<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryCheck extends Model
{
    use HasFactory;

    protected $primaryKey = 'check_id';

    protected $fillable = [
        'create_by',
        'check_date',
        'status',
        'note'
    ];

    protected $casts = [
        'check_date' => 'datetime',
    ];

    // Relationship with User who created the inventory check
    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'create_by', 'id');
    }

    // Relationship with Inventory Check Details
    public function details()
    {
        return $this->hasMany(InventoryCheckDetail::class, 'check_id', 'check_id');
    }

    // Helper method to calculate total products checked
    public function getTotalProductsAttribute()
    {
        return $this->details->count();
    }

    // Helper method to calculate total difference
    public function getTotalDifferenceAttribute()
    {
        return $this->details->sum('difference');
    }

    // Status helpers
    public function isDraft()
    {
        return $this->status === 'draft';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    // Status update methods
    public function markAsCompleted()
    {
        $this->status = 'completed';
        $this->save();

        return $this;
    }

    public function markAsDraft()
    {
        $this->status = 'draft';
        $this->save();

        return $this;
    }
}
