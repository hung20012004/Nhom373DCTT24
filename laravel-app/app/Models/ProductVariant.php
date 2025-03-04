<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $primaryKey = 'variant_id';

    protected $fillable = [
        'product_id',
        'color_id',
        'size_id',
        'image_url',
        'stock_quantity',
        'price'
    ];

    protected $with = ['color', 'size'];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function color()
    {
        return $this->belongsTo(Color::class, 'color_id', 'color_id');
    }

    public function size()
    {
        return $this->belongsTo(Size::class, 'size_id', 'size_id');
    }
    public function variant_images()
    {
        return $this->hasMany(VariantImage::class, 'variant_id', 'variant_id')
                    ->orderBy('display_order');
    }
}
