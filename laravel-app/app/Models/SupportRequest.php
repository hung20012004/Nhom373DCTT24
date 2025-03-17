<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'issue_type',
        'description',
        'status',
        'resolved_at',
        'assigned_to',
        'admin_notes'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    // Possible status values
    const STATUS_NEW = 'new';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_RESOLVED = 'resolved';
    const STATUS_CLOSED = 'closed';

    // Possible issue types
    const ISSUE_SHIPPING = 'shipping';
    const ISSUE_PRODUCT = 'product';
    const ISSUE_PAYMENT = 'payment';
    const ISSUE_OTHER = 'other';

    // Default values
    protected $attributes = [
        'status' => self::STATUS_NEW,
    ];

    // Relationship with User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with Order model
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Relationship with Admin (for the resolver)
    public function resolver()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Scope for filtering by status
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope for filtering by issue type
    public function scopeWithIssueType($query, $type)
    {
        return $query->where('issue_type', $type);
    }

    // Accessor for status label
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_NEW => 'Mới',
            self::STATUS_IN_PROGRESS => 'Đang xử lý',
            self::STATUS_RESOLVED => 'Đã giải quyết',
            self::STATUS_CLOSED => 'Đã đóng',
            default => 'Không xác định',
        };
    }

    // Accessor for issue type label
    public function getIssueTypeLabelAttribute()
    {
        return match($this->issue_type) {
            self::ISSUE_SHIPPING => 'Vấn đề vận chuyển',
            self::ISSUE_PRODUCT => 'Vấn đề sản phẩm',
            self::ISSUE_PAYMENT => 'Vấn đề thanh toán',
            self::ISSUE_OTHER => 'Khác',
            default => 'Không xác định',
        };
    }
}
