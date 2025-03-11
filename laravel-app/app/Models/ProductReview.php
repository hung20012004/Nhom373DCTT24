<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    use HasFactory;

    protected $table = 'product_reviews';
    protected $primaryKey = 'review_id';

    protected $fillable = [
        'product_id',
        'user_id',
        'variant_id',
        'rating',
        'comment'
    ];

    // Mối quan hệ với Product
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // Mối quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Mối quan hệ với Variant
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }
}
