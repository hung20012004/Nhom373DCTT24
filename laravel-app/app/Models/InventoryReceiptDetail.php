<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryReceiptDetail extends Model
{
    use HasFactory;

    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'receipt_id',
        'variant_id',
        'quantity',
        'unit_price',
        'expiry_date',
        'batch_number'
    ];

    protected $casts = [
        'expiry_date' => 'datetime',
        'unit_price' => 'decimal:2'
    ];

    protected $with = ['productVariant'];

    // Define that this model uses a composite primary key
    protected function setKeysForSaveQuery($query)
    {
        return $query->where('receipt_id', $this->getAttribute('receipt_id'))
                     ->where('variant_id', $this->getAttribute('variant_id'));
    }

    public function receipt()
    {
        return $this->belongsTo(InventoryReceipt::class, 'receipt_id', 'receipt_id');
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id', 'variant_id');
    }

    // Helper method to get subtotal
    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->unit_price;
    }

    // Helper method to check if item is expired
    public function getIsExpiredAttribute()
    {
        if (!$this->expiry_date) {
            return false;
        }

        return $this->expiry_date->isPast();
    }

    // Helper method to get days until expiry
    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->expiry_date) {
            return null;
        }

        return now()->diffInDays($this->expiry_date, false);
    }
}
