<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'suppliers';
    protected $primaryKey = 'supplier_id';
    protected $fillable = [
        'name',
        'contact_name',
        'phone',
        'email',
        'address',
        'description',
        'logo_url'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship với purchase_orders
    // public function purchaseOrders(): HasMany
    // {
    //     return $this->hasMany(PurchaseOrder::class, 'supplier_id');
    // }

    // Scope để lọc supplier active
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope để tìm kiếm
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('contact_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    // Accessor để format phone number
    public function getFormattedPhoneAttribute()
    {
        // Có thể thêm logic format số điện thoại ở đây
        return $this->phone;
    }

    // Boot method để tự động set một số giá trị mặc định
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (!isset($supplier->is_active)) {
                $supplier->is_active = true;
            }
        });
    }
}
