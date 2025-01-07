<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'variant_id',
        'quantity'
    ];

    public function cart()
    {
        return $this->belongsTo(ShoppingCart::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
