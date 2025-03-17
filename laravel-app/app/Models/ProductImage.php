<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $primaryKey = 'image_id';

    protected $fillable = [
        'product_id',
        'image_url',
        'display_order',
        'is_primary'
    ];

    protected $casts = [
        'is_primary' => 'boolean'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class,'product_id','product_id');
    }
}
