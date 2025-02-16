<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatMessage;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Get all chat messages (Admin & User).
     */
    public function index()
    {
        return response()->json(ChatMessage::with('user')->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a new chat message.
     */
    public function store(Request $request)
{
    $request->validate([
        'message' => 'required|string',
        'category' => 'required|string'
    ]);

    $chatMessage = ChatMessage::create([
        'user_id' => Auth::id(),
        'message' => $request->message,
        'category' => $request->category,
        'status' => 'new',
        'is_admin' => Auth::user()->is_admin ?? false
    ]);

    return response()->json($chatMessage, 201);
}


    /**
     * Update chat message status (For Admin).
     */
    public function updateStatus(Request $request, $id)
    {
        $chatMessage = ChatMessage::findOrFail($id);
        $chatMessage->update([
            'status' => $request->status
        ]);

        return response()->json(['message' => 'Status updated successfully']);
    }
}
