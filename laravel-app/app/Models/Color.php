<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Color extends Model
{
    protected $primaryKey = 'color_id';

    protected $fillable = [
        'name',
        'description'
    ];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class,'color_id','color_id');
    }
}
