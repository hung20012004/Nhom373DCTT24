<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        if ($request->user()->hasVerifiedEmail()) {
            $user = $request->user();
            if ($user->role && $user->role->name === 'Customer') {
                return redirect()->intended(route('home', absolute: false));
            } else {
                return redirect()->intended(route('admin.dashboard', absolute: false));
            }
        }

        return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
}
