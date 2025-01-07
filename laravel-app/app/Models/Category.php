<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $primaryKey = 'category_id';

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'image_url',
        'is_active',
        'display_order'
    ];

    // Relationships
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeParentCategories($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    // Accessors & Mutators
    public function getHasChildrenAttribute()
    {
        return $this->children()->count() > 0;
    }

    public function getProductCountAttribute()
    {
        return $this->products()->count();
    }

    // Helper Methods
    public function getAllChildren()
    {
        $children = collect();

        foreach ($this->children as $child) {
            $children->push($child);
            $children = $children->merge($child->getAllChildren());
        }

        return $children;
    }
}
