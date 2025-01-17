<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $primaryKey = 'material_id';

    protected $fillable = [
        'name',
        'description'
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'material_id', 'material_id');
    }
}
