<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role_id' => $this->role_id,
            'role' => $this->whenLoaded('role', function() {
                return [
                    'role_id' => $this->role->role_id,
                    'name' => $this->role->name,
                ];
            }),
            'is_active' => (bool)$this->is_active,
            'last_login' => $this->last_login ? $this->last_login->format('Y-m-d H:i:s') : null,
            'note' => $this->note,
            'profile' => $this->whenLoaded('profile', function() {
                return [
                    'profile_id' => $this->profile->profile_id,
                    'full_name' => $this->profile->full_name,
                    'date_of_birth' => $this->profile->date_of_birth ? $this->profile->date_of_birth->format('Y-m-d') : null,
                    'gender' => $this->profile->gender,
                    'phone' => $this->profile->phone,
                    'avatar_url' => $this->profile->avatar_url,
                ];
            }),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
