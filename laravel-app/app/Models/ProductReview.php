<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    protected $primaryKey = 'review_id';

    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'comment',
        'is_verified'
    ];

    protected $casts = [
        'is_verified' => 'boolean'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
