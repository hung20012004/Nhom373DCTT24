<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['profile', 'role'])
            ->select('users.*')
            ->whereHas('role', function($query) {
                $query->where('name', '!=', 'Customer');
            });

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('username', 'like', "%{$searchTerm}%");
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
            'username' => 'username',
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

        return [
            'data' => UserResource::collection($users),
            'current_page' => $users->currentPage(),
            'per_page' => $users->perPage(),
            'last_page' => $users->lastPage(),
            'total' => $users->total(),
            'sort' => [
                'field' => $sortField,
                'direction' => $sortDirection
            ],
            'roles' => Role::where('name', '!=', 'Customer')->get(['role_id', 'name'])
        ];
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
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
            // Create user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
                'role_id' => $validated['role_id'],
                'is_active' => $validated['is_active'] ?? true,
                'note' => $validated['note'] ?? null,
            ]);

            // Create user profile
            $user->profile()->create([
                'full_name' => $validated['profile']['full_name'],
                'gender' => $validated['profile']['gender'] ?? null,
                'date_of_birth' => $validated['profile']['date_of_birth'] ?? null,
                'phone' => $validated['profile']['phone'] ?? null,
                'avatar_url' => $validated['profile']['avatar_url'] ?? null,
            ]);

            DB::commit();
            return response()->json(new UserResource($user->load('profile')), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi tạo nhân viên: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $user = User::with(['profile', 'role'])->findOrFail($id);
        return response()->json(new UserResource($user));
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
            'username' => [
                'string',
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

            if (isset($validated['name'])) $userUpdate['name'] = $validated['name'];
            if (isset($validated['email'])) $userUpdate['email'] = $validated['email'];
            if (isset($validated['username'])) $userUpdate['username'] = $validated['username'];
            if (isset($validated['password'])) $userUpdate['password'] = Hash::make($validated['password']);
            if (isset($validated['role_id'])) $userUpdate['role_id'] = $validated['role_id'];
            if (isset($validated['is_active'])) $userUpdate['is_active'] = $validated['is_active'];
            if (isset($validated['note'])) $userUpdate['note'] = $validated['note'];

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
            return response()->json(new UserResource($user->load('profile')));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi cập nhật nhân viên: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $user = User::findOrFail($id);

            // Check if user has related data
            if ($user->orders()->exists()) {
                return response()->json([
                    'message' => 'Không thể xóa nhân viên vì có đơn hàng liên quan'
                ], 400);
            }

            // Delete profile first (if exists)
            if ($user->profile) {
                $user->profile->delete();
            }

            // Delete user
            $user->delete();

            DB::commit();
            return response()->json([
                'message' => 'Nhân viên đã được xóa thành công'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Không thể xóa nhân viên: ' . $e->getMessage()], 500);
        }
    }
}
