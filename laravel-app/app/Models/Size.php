<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Size extends Model
{
    protected $primaryKey = 'size_id';

    protected $fillable = [
        'name',
        'description'
    ];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class,'size_id','size_id');
    }
}
