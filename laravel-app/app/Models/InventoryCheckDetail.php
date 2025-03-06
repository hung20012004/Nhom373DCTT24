<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryCheckDetail extends Model
{
    use HasFactory;

    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'check_id',
        'product_id',
        'system_quantity',
        'actual_quantity',
        'difference',
        'note'
    ];

    // Define composite primary key behavior
    protected function setKeysForSaveQuery($query)
    {
        return $query->where('check_id', $this->check_id)
                     ->where('product_id', $this->product_id);
    }

    // Relationship with Inventory Check
    public function inventoryCheck()
    {
        return $this->belongsTo(InventoryCheck::class, 'check_id', 'check_id');
    }

    // Relationship with Product
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // Auto-calculate difference when actual_quantity is set
    public function setActualQuantityAttribute($value)
    {
        $this->attributes['actual_quantity'] = $value;
        $this->attributes['difference'] = $value - $this->system_quantity;
    }

    // Helper methods
    public function hasDiscrepancy()
    {
        return $this->difference != 0;
    }

    public function getDiscrepancyPercentageAttribute()
    {
        if ($this->system_quantity == 0) {
            return $this->actual_quantity > 0 ? 100 : 0;
        }

        return round(($this->difference / $this->system_quantity) * 100, 2);
    }
}
