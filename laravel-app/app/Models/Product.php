<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'material_id',
        'brand',
        'gender',
        'care_instruction',
        'season',
        'min_purchase_quantity',
        'stock_quantity',
        'slug',
        'description',
        'price',
        'sale_price',
        'max_purchase_quantity'
    ];

    protected $with = ['category', 'material'];

    public function category()
{
    return $this->belongsTo(Category::class, 'category_id', 'category_id');
}

    public function material()
    {
        return $this->belongsTo(Material::class,'material_id','material_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id', 'product_id');
    }
    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'product_tags');
    }
}
