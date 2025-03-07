<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrderDetail extends Model
{
    use HasFactory;

    // No singular primary key since we use composite key
    public $incrementing = false;

    protected $primaryKey = ['po_id', 'product_id'];

    protected $fillable = [
        'po_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2'
    ];

    // Required for composite keys in Laravel
    public function getKeyName()
    {
        return ['po_id', 'product_id'];
    }

    // Relationship with Purchase Order
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'po_id', 'po_id');
    }

    // Relationship with Product
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // Auto calculate subtotal before saving
    protected static function booted()
    {
        static::creating(function ($detail) {
            $detail->subtotal = $detail->quantity * $detail->unit_price;
        });

        static::updating(function ($detail) {
            $detail->subtotal = $detail->quantity * $detail->unit_price;
        });

        static::saved(function ($detail) {
            // Recalculate total amount on the parent purchase order
            if ($detail->purchaseOrder) {
                $detail->purchaseOrder->recalculateTotalAmount();
            }
        });
    }
}
