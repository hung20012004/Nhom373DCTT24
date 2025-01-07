<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingAddress extends Model
{
    protected $primaryKey = 'address_id';

    protected $fillable = [
        'user_id',
        'recipient_name',
        'phone',
        'province',
        'district',
        'ward',
        'street_address',
        'is_default'
    ];

    protected $casts = [
        'is_default' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'shipping_address_id');
    }
}
