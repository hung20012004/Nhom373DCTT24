<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('ApiKey', [
            'apiKey' => $request->user()->api_key,
        ]);
    }

    public function regenerate(Request $request)
    {
        $user = $request->user();
        $user->api_key = Str::random(40);
        $user->save();

        return redirect()->back()->with('success', 'API key regenerated successfully.');
    }
}
