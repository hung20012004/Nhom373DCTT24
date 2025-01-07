<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderHistory extends Model
{
    protected $primaryKey = 'history_id';

    protected $fillable = [
        'order_id',
        'status',
        'note'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
