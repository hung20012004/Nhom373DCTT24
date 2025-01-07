<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'is_active',
        'last_login',
        'note'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login' => 'datetime',
        ];
    }

    /**
     * Get the user profile associated with the user.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    /**
     * Get the shopping cart associated with the user.
     */
    public function shoppingCart(): HasOne
    {
        return $this->hasOne(ShoppingCart::class, 'user_id');
    }

    /**
     * Get all orders for the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    /**
     * Get all notifications for the user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    /**
     * Get all wishlists for the user.
     */
    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class, 'user_id');
    }

    /**
     * Get all reviews written by the user.
     */
    public function productReviews(): HasMany
    {
        return $this->hasMany(ProductReview::class, 'user_id');
    }

    /**
     * Get all shipping addresses for the user.
     */
    public function shippingAddresses(): HasMany
    {
        return $this->hasMany(ShippingAddress::class, 'user_id');
    }

    /**
     * Get user's default shipping address.
     */
    public function defaultShippingAddress(): HasOne
    {
        return $this->hasOne(ShippingAddress::class, 'user_id')
            ->where('is_default', true);
    }
}
