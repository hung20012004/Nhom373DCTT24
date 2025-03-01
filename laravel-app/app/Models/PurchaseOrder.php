<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $primaryKey = 'po_id';

    protected $fillable = [
        'supplier_id',
        'create_by_user_id',
        'order_date',
        'expected_date',
        'total_amount',
        'status',
        'note'
    ];

    protected $casts = [
        'order_date' => 'datetime',
        'expected_date' => 'datetime',
        'total_amount' => 'decimal:2'
    ];

    // Relationship with Supplier
    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'supplier_id');
    }

    // Relationship with User who created the PO
    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'create_by_user_id', 'id');
    }

    // Relationship with Purchase Order Details
    public function details()
    {
        return $this->hasMany(PurchaseOrderDetail::class, 'po_id', 'po_id');
    }

    // Relationship with Inventory Receipts
    public function inventoryReceipts()
    {
        return $this->hasMany(InventoryReceipt::class, 'po_id', 'po_id');
    }

    // Helper method to calculate total quantity
    public function getTotalQuantityAttribute()
    {
        return $this->details->sum('quantity');
    }

    // Helper method to recalculate total amount
    public function recalculateTotalAmount()
    {
        $total = $this->details->sum('subtotal');
        $this->total_amount = $total;
        $this->save();

        return $total;
    }

    // Status helpers
    public function isDraft()
    {
        return $this->status === 'draft';
    }

    public function isOrdered()
    {
        return $this->status === 'ordered';
    }

    public function isReceived()
    {
        return $this->status === 'received';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    // Status update methods
    public function markAsOrdered()
    {
        $this->status = 'ordered';
        $this->save();

        return $this;
    }

    public function markAsReceived()
    {
        $this->status = 'received';
        $this->save();

        return $this;
    }

    public function markAsCancelled()
    {
        $this->status = 'cancelled';
        $this->save();

        return $this;
    }
}
