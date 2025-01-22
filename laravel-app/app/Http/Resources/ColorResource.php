<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ColorResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->color_id,
            'name' => $this->name,
            'description' => $this->description,

            // Relationships
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
