<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $primaryKey = 'promotion_id';

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'min_order_value',
        'max_discount',
        'start_date',
        'end_date',
        'usage_limit',
        'used_count',
        'is_active'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
