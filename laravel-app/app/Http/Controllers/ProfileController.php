<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\UserProfile;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('profile');

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $user,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if phone number already exists for another user
        if ($request->input('phone')) {
            $query = UserProfile::where('phone', $request->input('phone'));

            // Only check for different users if current user has a profile
            if ($user->profile) {
                $query->where('profile_id', '!=', $user->profile->profile_id);
            }

            $existingProfile = $query->first();

            if ($existingProfile) {
                return Redirect::back()->withErrors([
                    'phone' => 'Số điện thoại này đã được sử dụng bởi người dùng khác.'
                ])->withInput();
            }
        }

        // Validate the incoming request
        $validatedData = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'avatar_url' => 'nullable|image|max:2048'
        ]);

        // Update user email
        $user->email = $validatedData['email'];
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        // Get or create profile
        $profile = $user->profile ?? new UserProfile();

        if (!$user->profile) {
            // Associate the new profile with the user
            $profile->user_id = $user->id;
        }

        // Handle avatar upload
        if ($request->hasFile('avatar_url')) {
            // Delete old avatar if exists
            if ($profile->avatar_url) {
                Storage::disk('public')->delete($profile->avatar_url);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar_url')->store('avatars', 'public');
            $validatedData['avatar_url'] = $avatarPath;
        }

        $profile->fill([
            'full_name' => $validatedData['full_name'],
            'phone' => $validatedData['phone'] ?? null,
            'date_of_birth' => $validatedData['date_of_birth'] ?? null,
            'gender' => $validatedData['gender'] ?? null,
            'avatar_url' => $validatedData['avatar_url'] ?? $profile->avatar_url,
        ])->save();

        return Redirect::route('profile.edit')->with('status', 'Profile updated successfully');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Optional: Remove profile avatar if exists
        if ($user->profile && $user->profile->avatar_url) {
            Storage::disk('public')->delete($user->profile->avatar_url);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
