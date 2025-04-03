<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Models\Role;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $userRole = Role::where('name', 'Customer')->first();
        $roleId = $userRole ? $userRole->role_id : null;

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $roleId,
            'is_active' => true, // Default value
            'last_login' => now(),
            'api_key' => Str::random(40), // Set current timestamp
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('verification.notice', absolute: false));
    }
    public function apiStore(Request $request): JsonResponse
    {
        try {
            Log::info('apiStore registration reached', ['data' => $request->all()]);

            // Validate request data
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
                'password' => 'required|confirmed|min:8',
            ]);

            $userRole = Role::where('name', 'Customer')->first();
            $roleId = $userRole ? $userRole->role_id : null;

            // Create the user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $roleId,
                'is_active' => true,
                'last_login' => now(),
                'api_key' => Str::random(40),
            ]);

            // Login user ngay sau khi đăng ký
            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'api_key' => $user->api_key,
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('apiStore validation failed', [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('apiStore registration error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
