<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'material_id' => $this->material_id,
            'brand' => $this->brand,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'stock_quantity' => $this->stock_quantity,
            'min_purchase_quantity' => $this->min_purchase_quantity,
            'max_purchase_quantity' => $this->max_purchase_quantity,
            'gender' => $this->gender,
            'care_instruction' => $this->care_instruction,
            'season' => $this->season,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'category' => new CategoryResource($this->whenLoaded('category')),
            'material' => new MaterialResource($this->whenLoaded('material')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
