<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->tag_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'products' => ProductResource::collection($this->whenLoaded('products')), // Nếu bạn muốn trả về thông tin sản phẩm liên quan đến tag
        ];
    }
}
