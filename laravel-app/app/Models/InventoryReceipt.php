<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryReceipt extends Model
{
    use HasFactory;

    protected $primaryKey = 'receipt_id';

    protected $fillable = [
        'po_id',
        'received_by',
        'note'
    ];

    protected $with = ['purchaseOrder', 'receivedByUser'];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'po_id', 'po_id');
    }

    public function receivedByUser()
    {
        return $this->belongsTo(User::class, 'received_by', 'id');
    }

    public function details()
    {
        return $this->hasMany(InventoryReceiptDetail::class, 'receipt_id', 'receipt_id');
    }

    // Helper method to get total amount
    public function getTotalAmountAttribute()
    {
        return $this->details->sum(function($detail) {
            return $detail->quantity * $detail->unit_price;
        });
    }

    // Helper method to get total quantity
    public function getTotalQuantityAttribute()
    {
        return $this->details->sum('quantity');
    }
}
