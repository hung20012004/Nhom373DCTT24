<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    protected $primaryKey = 'order_detail_id';

    protected $fillable = [
        'order_id',
        'variant_id',
        'quantity',
        'unit_price',
        'subtotal'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
