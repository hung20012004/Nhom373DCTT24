<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $primaryKey = 'order_id';

    protected $fillable = [
        'user_id',
        'shipping_address_id',
        'promotion_id',
        'order_date',
        'subtotal',
        'shipping_fee',
        'discount_amount',
        'total_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'note'
    ];

    protected $casts = [
        'order_date' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(ShippingAddress::class, 'shipping_address_id', 'address_id');
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    public function details()
    {
        return $this->hasMany(OrderDetail::class, 'order_id', 'order_id');
    }
    public function history()
    {
        return $this->hasMany(OrderHistory::class, 'order_id', 'order_id');
    }
}
