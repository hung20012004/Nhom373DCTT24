<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'message', 'category', 'status', 'is_admin'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
