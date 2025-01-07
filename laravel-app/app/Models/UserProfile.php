<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $primaryKey = 'profile_id';

    protected $fillable = [
        'user_id',
        'full_name',
        'date_of_birth',
        'gender',
        'phone',
        'avatar_url'
    ];

    protected $casts = [
        'date_of_birth' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
