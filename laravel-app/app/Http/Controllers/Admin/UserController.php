<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Auth\Events\Registered;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['profile', 'role'])
            ->select('users.*')
            ->whereHas('role', function ($query) {
                $query->where('name', '!=', 'Customer');
            });

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        // Handle sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $allowedSortFields = [
            'name' => 'name',
            'email' => 'email',
            'is_active' => 'is_active',
            'created_at' => 'created_at',
            'last_login' => 'last_login',
        ];

        if (array_key_exists($sortField, $allowedSortFields)) {
            $dbField = $allowedSortFields[$sortField];
            $query->orderBy($dbField, $sortDirection);
        }

        // Handle pagination
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 10;

        $users = $query->paginate($perPage);

        $data = [
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
                'sort' => [
                    'field' => $sortField,
                    'direction' => $sortDirection
                ]
            ],
            'roles' => Role::where('name', '!=', 'Customer')->get(['role_id', 'name'])
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('Admin/Users/Index', $data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role_id' => 'required|exists:roles,role_id',
            'is_active' => 'boolean',
            'note' => 'nullable|string',
            'profile.full_name' => 'required|string|max:255',
            'profile.gender' => 'nullable|string|in:male,female,other',
            'profile.date_of_birth' => 'nullable|date',
            'profile.phone' => 'nullable|string|max:20',
            'profile.avatar_url' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(16)), // Mật khẩu tạm thời
                'role_id' => $validated['role_id'],
                'is_active' => $validated['is_active'] ?? true,
                'note' => $validated['note'] ?? null,
            ]);

            $user->profile()->create([
                'full_name' => $validated['profile']['full_name'],
                'gender' => $validated['profile']['gender'] ?? null,
                'date_of_birth' => $validated['profile']['date_of_birth'] ?? null,
                'phone' => $validated['profile']['phone'] ?? null,
                'avatar_url' => $validated['profile']['avatar_url'] ?? null,
            ]);
            $user->markEmailAsVerified();
            $token = Password::createToken($user);
            $user->sendPasswordResetNotification($token);
            event(new Registered($user));

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => new UserResource($user->load('profile'))
                ], 201);
            }

            return redirect()->back()->with('success', 'User created successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error creating user: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Error creating user');
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $user = User::with(['profile', 'role'])->findOrFail($id);
            $data = new UserResource($user);

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => $data
                ]);
            }

            return Inertia::render('Admin/Users/Show', [
                'user' => $data
            ]);
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error fetching user details'
                ], 500);
            }

            return redirect()->back()->with('error', 'Error fetching user details');
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => [
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
            'password' => 'nullable|string|min:8',
            'role_id' => 'exists:roles,role_id',
            'is_active' => 'boolean',
            'note' => 'nullable|string',
            'profile.full_name' => 'string|max:255',
            'profile.gender' => 'nullable|string|in:male,female,other',
            'profile.date_of_birth' => 'nullable|date',
            'profile.phone' => 'nullable|string|max:20',
            'profile.avatar_url' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update user fields if they exist in the request
            $userUpdate = [];

            if (isset($validated['name']))
                $userUpdate['name'] = $validated['name'];
            if (isset($validated['email']))
                $userUpdate['email'] = $validated['email'];
            if (isset($validated['password']) && !empty($validated['password']))
                $userUpdate['password'] = Hash::make($validated['password']);
            if (isset($validated['role_id']))
                $userUpdate['role_id'] = $validated['role_id'];
            if (isset($validated['is_active']))
                $userUpdate['is_active'] = $validated['is_active'];
            if (isset($validated['note']))
                $userUpdate['note'] = $validated['note'];

            if (!empty($userUpdate)) {
                $user->update($userUpdate);
            }

            // Update profile if profile data exists
            if (isset($validated['profile'])) {
                $profileUpdate = [];

                if (isset($validated['profile']['full_name']))
                    $profileUpdate['full_name'] = $validated['profile']['full_name'];
                if (isset($validated['profile']['gender']))
                    $profileUpdate['gender'] = $validated['profile']['gender'];
                if (isset($validated['profile']['date_of_birth']))
                    $profileUpdate['date_of_birth'] = $validated['profile']['date_of_birth'];
                if (isset($validated['profile']['phone']))
                    $profileUpdate['phone'] = $validated['profile']['phone'];
                if (isset($validated['profile']['avatar_url']))
                    $profileUpdate['avatar_url'] = $validated['profile']['avatar_url'];

                if (!empty($profileUpdate)) {
                    // Create profile if it doesn't exist
                    if (!$user->profile) {
                        $user->profile()->create($profileUpdate);
                    } else {
                        $user->profile->update($profileUpdate);
                    }
                }
            }

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => new UserResource($user->load('profile'))
                ]);
            }

            return redirect()->back()->with('success', 'User updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error updating user: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Error updating user');
        }
    }

    public function destroy(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $user = User::findOrFail($id);

            // Kiểm tra các ràng buộc trước khi xóa
            if ($user->orders()->exists()) {
                throw new \Exception('Cannot delete user because they have associated orders');
            }

            // Xóa các dữ liệu liên quan theo thứ tự
            if ($user->profile) {
                $user->profile->delete();
            }

            // Xóa các shipping addresses
            $user->shippingAddresses()->delete();

            // Xóa cart items và cart
            if ($user->cart) {
                $user->cart->items()->delete();
                $user->cart->delete();
            }

            // Cuối cùng xóa user
            $user->delete();

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'User deleted successfully'
                ]);
            }

            return redirect()->back()->with('success', 'User deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
