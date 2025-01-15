<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            RoleSeeder::class,        // Roles for users
            SizeSeeder::class,        // Product sizes
            ColorSeeder::class,       // Product colors
            MaterialSeeder::class,    // Product materials
            TagSeeder::class,         // Product tags
            CategorySeeder::class,    // Product categories
        ]);

        $this->call([
            UserSeeder::class,        // Users (depends on roles)
            UserProfileSeeder::class, // User profiles (depends on users)
            ShippingAddressSeeder::class, // Shipping addresses (depends on users)
        ]);

        $this->call([
            SupplierSeeder::class,    // Suppliers
            ProductSeeder::class,     // Products (depends on categories, materials)
            ProductTagSeeder::class,  // Product-Tag relationships
            // ProductImageSeeder::class, // Product images
            ProductVariantSeeder::class, // Product variants (depends on products, sizes, colors)
        ]);

        $this->call([
            InventorySeeder::class,   // Initial inventory
            InventoryCheckSeeder::class, // Inventory checks
            PurchaseOrderSeeder::class,  // Purchase orders
            // InventoryReceiptSeeder::class, // Inventory receipts
        ]);

        $this->call([
            PromotionSeeder::class,   // Promotions
            CartSeeder::class,        // Shopping carts
            OrderSeeder::class,       // Orders
            OrderHistorySeeder::class, // Order history
            PaymentSeeder::class,     // Payments
            ProductReviewSeeder::class, // Product reviews
            WishlistSeeder::class,    // Wishlists
        ]);

        $this->call([
            NotificationSeeder::class, // User notifications
        ]);
    }
}

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'Admin', 'description' => 'System administrator'],
            ['name' => 'Manager', 'description' => 'Store manager'],
            ['name' => 'Sales', 'description' => 'Sales staff'],
            ['name' => 'Warehouse Staff', 'description' => 'Warehouse staff'],
            ['name' => 'Customer', 'description' => 'Regular customer'],
            ['name' => 'Guest', 'description' => 'Guest user'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert([
                'name' => $role['name'],
                'description' => $role['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class UserSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $this->call(RoleSeeder::class);
        $customerRoleId = DB::table('roles')
        ->where('name', 'Customer')
        ->value('role_id');
        $warehouseStaffRoleId = DB::table('roles')
        ->where('name', 'Warehouse Staff')
        ->value('role_id');
        DB::table('users')->insert([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('12345678'),
            'username' => 'admin',
            'is_active' => true,
            'role_id' => DB::table('roles')->where('name', 'Admin')->value('role_id'),
            'last_login' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        for ($i = 0; $i < 10; $i++) {
            DB::table('users')->insert([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password'),
                'username' => $faker->unique()->userName,
                'is_active' => true,
                'role_id' => $customerRoleId, // Set role_id for all regular users as Customer
                'last_login' => $faker->dateTimeThisYear(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        for ($i = 0; $i < 10; $i++) {
            DB::table('users')->insert([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password'),
                'username' => $faker->unique()->userName,
                'is_active' => true,
                'role_id' => $warehouseStaffRoleId,
                'last_login' => $faker->dateTimeThisYear(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Men\'s Clothing', 'slug' => 'mens-clothing'],
            ['name' => 'Women\'s Clothing', 'slug' => 'womens-clothing'],
            ['name' => 'Kids\' Clothing', 'slug' => 'kids-clothing'],
            ['name' => 'Accessories', 'slug' => 'accessories'],
            ['name' => 'Sportswear', 'slug' => 'sportswear'],
            ['name' => 'Footwear', 'slug' => 'footwear'],
            ['name' => 'Underwear', 'slug' => 'underwear'],
            ['name' => 'Outerwear', 'slug' => 'outerwear']
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category['name'],
                'slug' => $category['slug'],
                'description' => "Quality {$category['name']} for all occasions",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class TagSeeder extends Seeder
{
    public function run()
    {
        $tags = [
            'New Arrival', 'Best Seller', 'Sale', 'Featured', 'Limited Edition',
            'Eco-Friendly', 'Premium', 'Clearance'
        ];

        foreach ($tags as $tag) {
            DB::table('tags')->insert([
                'name' => $tag,
                'slug' => strtolower(str_replace(' ', '-', $tag)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class MaterialSeeder extends Seeder
{
    public function run()
    {
        $materials = [
            ['name' => 'Cotton', 'description' => 'Soft and breathable natural fabric'],
            ['name' => 'Polyester', 'description' => 'Durable and quick-drying synthetic material'],
            ['name' => 'Denim', 'description' => 'Sturdy cotton twill fabric'],
            ['name' => 'Wool', 'description' => 'Natural, warm, and moisture-wicking material'],
            ['name' => 'Silk', 'description' => 'Luxurious natural fabric with smooth texture'],
            ['name' => 'Linen', 'description' => 'Light and breathable natural fabric'],
            ['name' => 'Spandex', 'description' => 'Stretchy synthetic fabric for athletic wear'],
            ['name' => 'Nylon', 'description' => 'Strong and water-resistant synthetic material']
        ];

        foreach ($materials as $material) {
            DB::table('materials')->insert([
                'name' => $material['name'],
                'description' => $material['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class SupplierSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        for ($i = 0; $i < 5; $i++) {
            DB::table('suppliers')->insert([
                'name' => $faker->company,
                'contact_name' => $faker->name,
                'phone' => $faker->phoneNumber,
                'email' => $faker->companyEmail,
                'address' => $faker->address,
                'description' => $faker->text(200),
                'logo_url' => $faker->imageUrl(640, 480, 'business'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
class ProductSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Get IDs for relationships
        $categoryIds = DB::table('categories')->pluck('category_id');
        $materialIds = DB::table('materials')->pluck('material_id');

        // Define clothing-specific product templates
        $productTemplates = [
            ['name' => 'Classic T-Shirt', 'price_range' => [19.99, 29.99]],
            ['name' => 'Slim Fit Jeans', 'price_range' => [49.99, 89.99]],
            ['name' => 'Summer Dress', 'price_range' => [39.99, 79.99]],
            ['name' => 'Athletic Shorts', 'price_range' => [24.99, 34.99]],
            ['name' => 'Casual Hoodie', 'price_range' => [39.99, 59.99]],
            ['name' => 'Button-Up Shirt', 'price_range' => [34.99, 54.99]],
            ['name' => 'Yoga Pants', 'price_range' => [44.99, 64.99]],
            ['name' => 'Winter Jacket', 'price_range' => [89.99, 149.99]]
        ];

        foreach ($productTemplates as $template) {
            for ($i = 0; $i < 2; $i++) { // Create 2 variants of each template
                $price = $faker->randomFloat(2, $template['price_range'][0], $template['price_range'][1]);
                $name = $template['name'] . ' ' . $faker->randomElement(['Premium', 'Comfort', 'Deluxe', 'Essential']);

                $slugBase = Str::slug($name);
                $slug = $slugBase;
                $counter = 1;
                while (DB::table('products')->where('slug', $slug)->exists()) {
                    $slug = "{$slugBase}-{$counter}";
                    $counter++;
                }

                $productId = DB::table('products')->insertGetId([
                    'category_id' => $faker->randomElement($categoryIds),
                    'material_id' => $faker->randomElement($materialIds),
                    'name' => $name,
                    'slug' => $slug ,
                    'description' => $faker->paragraph(3) . "\n\nFeatures:\n- Premium quality fabric\n- Modern fit\n- Easy care",
                    'price' => $price,
                    'sale_price' => $faker->optional(0.3)->randomFloat(2, $price * 0.7, $price * 0.9),
                    'brand' => $faker->randomElement(['StyleCo', 'Fashion Elite', 'Urban Trends', 'Comfort Plus', 'Modern Basics']),
                    'sku' => 'CLT-' . $faker->unique()->numberBetween(1000, 9999),
                    'stock_quantity' => $faker->numberBetween(10, 100),
                    'min_purchase_quantity' => 1,
                    'max_purchase_quantity' => 5,
                    'gender' => $faker->randomElement(['male', 'female', 'unisex']),
                    'care_instruction' => "Machine wash cold\nTumble dry low\nDo not bleach\nIron on low if needed",
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $colorIds = DB::table('colors')->pluck('color_id')->toArray();
                $sizeIds = DB::table('sizes')->pluck('size_id')->toArray();

                if(empty($colorIds) || empty($sizeIds)) {
                    throw new \Exception('Colors or Sizes not found. Please run ColorSeeder and SizeSeeder first.');
                }

                foreach ($faker->randomElements($sizeIds, 4) as $sizeId) {
                    foreach ($faker->randomElements($colorIds, 3) as $colorId) {
                        DB::table('product_variants')->insert([
                            'product_id' => $productId,
                            'size_id' => $sizeId,
                            'color_id' => $colorId, // Đảm bảo color_id luôn có giá trị
                            'sku' => 'CLT-' . $faker->unique()->numberBetween(10000, 99999),
                            'price' => $price + $faker->randomFloat(2, 0, 5),
                            'stock_quantity' => $faker->numberBetween(5, 30),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }

                // Create product images
                $imageTypes = ['front', 'back', 'detail'];
                foreach ($imageTypes as $index => $type) {
                    DB::table('product_images')->insert([
                        'product_id' => $productId,
                        'image_url' => $faker->imageUrl(800, 1200, 'fashion'),
                        'display_order' => $index + 1,
                        'is_primary' => $index === 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}

class ProductsVariantsSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Get all product IDs
        $products = DB::table('products')->pluck('product_id')->toArray();

        // Get size and color IDs
        $sizes = DB::table('sizes')->pluck('size_id')->toArray();
        $colors = DB::table('colors')->pluck('color_id')->toArray();

        if (empty($products) || empty($sizes) || empty($colors)) {
            throw new \Exception('Products, sizes, or colors not found. Please run their seeders first.');
        }

        foreach ($products as $productId) {
            // Create 2-4 variants for each product
            $variantCount = $faker->numberBetween(2, 4);

            // Create unique combinations of size and color for each product
            $combinations = [];
            for ($i = 0; $i < $variantCount; $i++) {
                $sizeId = $faker->randomElement($sizes);
                $colorId = $faker->randomElement($colors);
                $combination = $sizeId . '-' . $colorId;

                // Ensure unique combinations
                if (in_array($combination, $combinations)) {
                    continue;
                }
                $combinations[] = $combination;

                // Get base product price
                $product = DB::table('products')->where('product_id', $productId)->first();
                $basePrice = $product->price;

                // Generate SKU
                $sku = strtoupper($faker->lexify('??')) . $faker->numberBetween(1000, 9999);

                DB::table('product_variants')->insert([
                    'product_id' => $productId,
                    'size_id' => $sizeId,
                    'color_id' => $colorId,
                    'sku' => $sku,
                    'stock_quantity' => $faker->numberBetween(0, 100),
                    'price' => $basePrice + $faker->randomFloat(2, 0, 10), // Slight price variation
                ]);
            }
        }
    }
}

class OrderSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Get valid IDs from related tables
        $users = DB::table('users')->pluck('id')->toArray();
        $variants = DB::table('product_variants')
            ->where('stock_quantity', '>', 0)
            ->pluck('variant_id')
            ->toArray();

        // Get valid shipping address IDs for each user
        $userAddresses = [];
        foreach ($users as $userId) {
            $addresses = DB::table('shipping_addresses')
                ->where('user_id', $userId)
                ->pluck('address_id')
                ->toArray();
            if (!empty($addresses)) {
                $userAddresses[$userId] = $addresses;
            }
        }

        // Only create orders for users who have shipping addresses
        $validUsers = array_keys($userAddresses);

        if (empty($validUsers) || empty($variants)) {
            throw new \Exception('No valid users with addresses or variants found.');
        }

        for ($i = 0; $i < 10; $i++) {
            try {
                DB::beginTransaction();

                // Select a valid user and one of their shipping addresses
                $userId = $faker->randomElement($validUsers);
                $shippingAddressId = $faker->randomElement($userAddresses[$userId]);

                // Generate order details first
                $orderDetails = [];
                $totalAmount = 0;
                $subtotal = 0;

                // Select random variants for the order
                foreach ($faker->randomElements($variants, $faker->numberBetween(1, 5)) as $variantId) {
                    $quantity = $faker->numberBetween(1, 3);
                    $variant = DB::table('product_variants')
                        ->where('variant_id', $variantId)
                        ->where('stock_quantity', '>=', $quantity)
                        ->first();

                    if (!$variant) {
                        continue;
                    }

                    $price = $variant->price;
                    $itemSubtotal = $price * $quantity;
                    $subtotal += $itemSubtotal;

                    $orderDetails[] = [
                        'variant_id' => $variantId,
                        'quantity' => $quantity,
                        'unit_price' => $price,
                        'subtotal' => $itemSubtotal,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    // Update stock quantity
                    DB::table('products_variants')
                        ->where('variant_id', $variantId)
                        ->decrement('stock_quantity', $quantity);
                }

                if (empty($orderDetails)) {
                    DB::rollBack();
                    continue;
                }

                // Calculate final amounts
                $shippingFee = $faker->randomFloat(2, 5, 20);
                $discountAmount = 0;
                $totalAmount = $subtotal + $shippingFee - $discountAmount;

                // Create the order
                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $userId,
                    'order_date' => $faker->dateTimeThisYear(),
                    'subtotal' => $subtotal,
                    'total_amount' => $totalAmount,
                    'shipping_fee' => $shippingFee,
                    'discount_amount' => $discountAmount,
                    'payment_method' => $faker->randomElement(['credit_card', 'paypal', 'bank_transfer']),
                    'payment_status' => $faker->randomElement(['pending', 'paid', 'failed']),
                    'order_status' => $faker->randomElement(['pending', 'processing', 'shipped', 'delivered']),
                    'shipping_address_id' => $shippingAddressId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Insert order details
                foreach ($orderDetails as $detail) {
                    $detail['order_id'] = $orderId;
                    DB::table('order_details')->insert($detail);
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                continue;
            }
        }
    }
}
class PromotionSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        $discountTypes = ['percentage', 'fixed_amount', 'buy_x_get_y'];

        for ($i = 0; $i < 5; $i++) {
            DB::table('promotions')->insert([
                'code' => strtoupper($faker->bothify('PROMO-####')),
                'name' => $faker->words(3, true) . ' Promotion',
                'description' => $faker->paragraph,
                'discount_type' => $faker->randomElement($discountTypes),
                'discount_value' => $faker->randomFloat(2, 5, 50),
                'min_order_value' => $faker->randomFloat(2, 100, 500),
                'max_discount' => $faker->randomFloat(2, 50, 200),
                'start_date' => $faker->dateTimeBetween('-1 week', '+1 week'),
                'end_date' => $faker->dateTimeBetween('+1 week', '+4 weeks'),
                'usage_limit' => $faker->numberBetween(50, 1000),
                'used_count' => 0,
                'is_active' => $faker->boolean(80),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class OrderHistorySeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $orders = DB::table('orders')->pluck('order_id');
        $statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        foreach ($orders as $orderId) {
            $numberOfStatuses = $faker->numberBetween(1, count($statuses));
            $selectedStatuses = $faker->randomElements($statuses, $numberOfStatuses);

            foreach ($selectedStatuses as $index => $status) {
                DB::table('order_history')->insert([
                    'order_id' => $orderId,
                    'status' => $status,
                    'note' => $faker->sentence,
                    'created_at' => $faker->dateTimeThisYear(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

class PaymentSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $orders = DB::table('orders')->pluck('order_id');
        $paymentMethods = ['credit_card', 'paypal', 'bank_transfer', 'cod'];
        $paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

        foreach ($orders as $orderId) {
            $order = DB::table('orders')->where('order_id', $orderId)->first();

            DB::table('payments')->insert([
                'order_id' => $orderId,
                'amount' => $order->total_amount,
                'payment_method' => $faker->randomElement($paymentMethods),
                'payment_status' => $faker->randomElement($paymentStatuses),
                'transaction_id' => $faker->uuid,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class WishlistSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $users = DB::table('users')->pluck('id');
        $products = DB::table('products')->pluck('product_id');

        foreach ($users as $userId) {
            $wishlistProducts = $faker->randomElements($products, $faker->numberBetween(1, 5));

            foreach ($wishlistProducts as $productId) {
                DB::table('wishlists')->insert([
                    'user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => $faker->numberBetween(1, 3),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

class NotificationSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $users = DB::table('users')->pluck('id');
        $types = ['order_status', 'promotion', 'price_drop', 'back_in_stock', 'new_arrival'];

        foreach ($users as $userId) {
            for ($i = 0; $i < 5; $i++) {
                DB::table('notifications')->insert([
                    'user_id' => $userId,
                    'title' => $faker->sentence,
                    'content' => $faker->paragraph,
                    'notification_type' => $faker->randomElement($types),
                    'reference_id' => $faker->numberBetween(1, 100),
                    'is_read' => $faker->boolean(30),
                    'created_at' => $faker->dateTimeThisMonth(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

class ProductReviewSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $users = DB::table('users')->pluck('id');
        $products = DB::table('products')->pluck('product_id');

        foreach ($products as $productId) {
            $numberOfReviews = $faker->numberBetween(2, 5);

            for ($i = 0; $i < $numberOfReviews; $i++) {
                DB::table('product_reviews')->insert([
                    'product_id' => $productId,
                    'user_id' => $faker->randomElement($users),
                    'rating' => $faker->numberBetween(1, 5),
                    'comment' => $faker->paragraph,
                    'created_at' => $faker->dateTimeThisYear(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

class ShippingAddressSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $users = DB::table('users')->pluck('id');

        foreach ($users as $userId) {
            $numberOfAddresses = $faker->numberBetween(1, 3);

            for ($i = 0; $i < $numberOfAddresses; $i++) {
                DB::table('shipping_addresses')->insert([
                    'user_id' => $userId,
                    'recipient_name' => $faker->name,
                    'phone' => $faker->phoneNumber,
                    'province' => $faker->state,
                    'district' => $faker->city,
                    'ward' => $faker->cityPrefix,
                    'street_address' => $faker->streetAddress,
                    'is_default' => $i === 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}


class CartSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Get active users
        $users = DB::table('users')
            ->where('is_active', true)
            ->pluck('id')
            ->toArray();

        if (empty($users)) {
            throw new \Exception('No active users found. Please run users seeder first.');
        }

        foreach ($users as $userId) {
            try {
                DB::beginTransaction();

                // Get available variants with stock
                $availableVariants = DB::table('products_variants')
                    ->select('products_variants.variant_id', 'products_variants.product_id')
                    ->join('products', 'products.product_id', '=', 'products_variants.product_id')
                    ->where('products_variants.stock_quantity', '>', 0)
                    ->where('products.is_active', true)
                    ->get()
                    ->toArray();

                if (empty($availableVariants)) {
                    DB::rollBack();
                    continue;
                }

                // Create shopping cart
                $cartId = DB::table('shopping_carts')->insertGetId([
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Add 1-4 random items to cart
                $cartItemCount = $faker->numberBetween(1, 4);
                $selectedVariants = $faker->randomElements($availableVariants, $cartItemCount);

                foreach ($selectedVariants as $variant) {
                    // Get variant details
                    $variantDetails = DB::table('products_variants')
                        ->where('variant_id', $variant->variant_id)
                        ->first();

                    if (!$variantDetails) {
                        continue;
                    }

                    // Generate random quantity that doesn't exceed stock
                    $maxQuantity = min(3, $variantDetails->stock_quantity);
                    $quantity = $faker->numberBetween(1, $maxQuantity);

                    DB::table('cart_items')->insert([
                        'cart_id' => $cartId,
                        'product_id' => $variant->product_id,
                        'variant_id' => $variant->variant_id,
                        'quantity' => $quantity,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                continue;
            }
        }
    }
}

class InventorySeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Get active products
        $products = DB::table('products')
            ->where('is_active', true)
            ->get();

        if ($products->isEmpty()) {
            throw new \Exception('No products found. Please run ProductsSeeder first.');
        }

        // Get some user IDs to use as create_by
        $users = DB::table('users')
            ->where('is_active', true)
            ->pluck('id');

        if ($users->isEmpty()) {
            throw new \Exception('No active users found. Please run UsersSeeder first.');
        }

        foreach ($products as $product) {
            DB::beginTransaction();

            // Generate 3-5 history records per product
            $numberOfRecords = $faker->numberBetween(3, 5);
            $currentQuantity = 0;

            for ($i = 0; $i < $numberOfRecords; $i++) {
                $referenceType = $faker->randomElement(['initial_stock', 'purchase', 'adjustment', 'return']);

                // Generate appropriate reference ID based on type
                $referenceId = match($referenceType) {
                    'initial_stock' => 'INIT-' . $faker->bothify('####'),
                    'purchase' => 'PO-' . $faker->bothify('####'),
                    'adjustment' => 'ADJ-' . $faker->bothify('####'),
                    'return' => 'RET-' . $faker->bothify('####'),
                };

                // Generate quantity change based on reference type
                $quantityChange = match($referenceType) {
                    'adjustment' => $faker->numberBetween(-20, 50),
                    'return' => $faker->numberBetween(1, 10),
                    default => $faker->numberBetween(10, 100)
                };

                // Update current quantity
                $currentQuantity += $quantityChange;

                // Ensure quantity doesn't go below 0
                if ($currentQuantity < 0) {
                    $quantityChange -= $currentQuantity;
                    $currentQuantity = 0;
                }

                // Generate appropriate note based on type and quantity
                $note = match($referenceType) {
                    'initial_stock' => 'Initial stock entry',
                    'purchase' => "Purchase order received from supplier",
                    'adjustment' => $quantityChange >= 0
                        ? "Inventory adjustment - Stock count correction (+" . abs($quantityChange) . ")"
                        : "Inventory adjustment - Stock count correction (-" . abs($quantityChange) . ")",
                    'return' => "Customer return - Added back to inventory",
                };

                // Insert inventory history record
                DB::table('inventory_history')->insert([
                    'product_id' => $product->product_id,
                    'create_by' => $users->random(),  // Random user as creator
                    'reference_id' => $referenceId,
                    'reference_type' => $referenceType,
                    'quantity_change' => $quantityChange,
                    'remaining_quantity' => $currentQuantity,
                    'note' => $note
                ]);
            }

            // Update product's stock quantity to match final remaining quantity
            DB::table('products')
                ->where('product_id', $product->product_id)
                ->update([
                    'stock_quantity' => $currentQuantity
                ]);

            DB::commit();
        }
    }
}
class InventoryCheckSeeder extends Seeder
{       public function run()
        {
            $faker = Faker::create();

            // Get active products
            $products = DB::table('products')
                ->where('is_active', true)
                ->get();

            if ($products->isEmpty()) {
                throw new \Exception('No products found. Please run ProductsSeeder first.');
            }

            // Get users who are active and don't have Admin, Guest, or Customer roles
            $validUsers = DB::table('users')
                ->join('roles', 'users.role_id', '=', 'roles.role_id')
                ->where('users.is_active', true)
                ->whereNotIn('roles.name', ['Admin', 'Guest', 'Customer'])
                ->pluck('users.id');

            if ($validUsers->isEmpty()) {
                throw new \Exception('No valid staff users found for inventory management.');
            }

            foreach ($products as $product) {
                DB::beginTransaction();

                // Generate 3-5 history records per product
                $numberOfRecords = $faker->numberBetween(3, 5);
                $currentQuantity = 0;

                for ($i = 0; $i < $numberOfRecords; $i++) {
                    $referenceType = $faker->randomElement(['initial_stock', 'purchase', 'adjustment', 'return']);

                    // Generate appropriate reference ID based on type
                    $referenceId = match($referenceType) {
                        'initial_stock' => 'INIT-' . $faker->bothify('####'),
                        'purchase' => 'PO-' . $faker->bothify('####'),
                        'adjustment' => 'ADJ-' . $faker->bothify('####'),
                        'return' => 'RET-' . $faker->bothify('####'),
                    };

                    // Generate quantity change based on reference type
                    $quantityChange = match($referenceType) {
                        'adjustment' => $faker->numberBetween(-20, 50),
                        'return' => $faker->numberBetween(1, 10),
                        default => $faker->numberBetween(10, 100)
                    };

                    // Update current quantity
                    $currentQuantity += $quantityChange;

                    // Ensure quantity doesn't go below 0
                    if ($currentQuantity < 0) {
                        $quantityChange -= $currentQuantity;
                        $currentQuantity = 0;
                    }

                    // Generate appropriate note based on type and quantity
                    $note = match($referenceType) {
                        'initial_stock' => 'Initial stock entry',
                        'purchase' => "Purchase order received from supplier",
                        'adjustment' => $quantityChange >= 0
                            ? "Inventory adjustment - Stock count correction (+" . abs($quantityChange) . ")"
                            : "Inventory adjustment - Stock count correction (-" . abs($quantityChange) . ")",
                        'return' => "Customer return - Added back to inventory",
                    };

                    // Insert inventory history record
                    DB::table('inventory_history')->insert([
                        'product_id' => $product->product_id,
                        'create_by' => $validUsers->random(),  // Random valid staff user
                        'reference_id' => $referenceId,
                        'reference_type' => $referenceType,
                        'quantity_change' => $quantityChange,
                        'remaining_quantity' => $currentQuantity,
                        'note' => $note
                    ]);
                }

                // Update product's stock quantity to match final remaining quantity
                DB::table('products')
                    ->where('product_id', $product->product_id)
                    ->update([
                        'stock_quantity' => $currentQuantity
                    ]);

                DB::commit();
            }
        }
    }
class SizeSeeder extends Seeder
{
    public function run()
    {
        $sizes = [
            ['name' => 'XS', 'description' => 'Extra Small'],
            ['name' => 'S', 'description' => 'Small'],
            ['name' => 'M', 'description' => 'Medium'],
            ['name' => 'L', 'description' => 'Large'],
            ['name' => 'XL', 'description' => 'Extra Large'],
            ['name' => 'XXL', 'description' => 'Double Extra Large'],
        ];

        foreach ($sizes as $size) {
            DB::table('sizes')->insert([
                'name' => $size['name'],
                'description' => $size['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class ColorSeeder extends Seeder
{
    public function run()
    {
        $colors = [
            ['name' => 'Red', 'description' => '#FF0000'],
            ['name' => 'Blue', 'description' => '#0000FF'],
            ['name' => 'Green', 'description' => '#00FF00'],
            ['name' => 'Black', 'description' => '#000000'],
            ['name' => 'White', 'description' => '#FFFFFF'],
            ['name' => 'Yellow', 'description' => '#FFFF00'],
            ['name' => 'Purple', 'description' => '#800080'],
        ];

        foreach ($colors as $color) {
            DB::table('colors')->insert([
                'name' => $color['name'],
                'description' => $color['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class UserProfileSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $users = DB::table('users')->pluck('id');

        foreach ($users as $userId) {
            DB::table('user_profiles')->insert([
                'user_id' => $userId,
                'full_name' => $faker->name,
                'date_of_birth' => $faker->date(),
                'gender' => $faker->randomElement(['male', 'female', 'other']),
                'phone' => $faker->phoneNumber,
                'avatar_url' => $faker->imageUrl(200, 200, 'people'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

class ProductTagSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $products = DB::table('products')->pluck('product_id');
        $tags = DB::table('tags')->pluck('tag_id');

        foreach ($products as $productId) {
            // Assign 1-3 random tags to each product
            foreach ($faker->randomElements($tags, $faker->numberBetween(1, 3)) as $tagId) {
                DB::table('product_tags')->insert([
                    'product_id' => $productId,
                    'tag_id' => $tagId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}


class InventoryReceiptSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Lấy danh sách suppliers
        $suppliers = DB::table('suppliers')
            ->where('is_active', true)
            ->pluck('supplier_id');

        if ($suppliers->isEmpty()) {
            throw new \Exception('Không tìm thấy suppliers. Vui lòng chạy SuppliersSeeder trước.');
        }

        // Lấy danh sách products có variant
        $products = DB::table('products')
            ->join('product_variants', 'products.product_id', '=', 'product_variants.product_id')
            ->where('products.is_active', true)
            ->select('products.product_id', 'product_variants.variant_id')
            ->get();

        if ($products->isEmpty()) {
            throw new \Exception('Không tìm thấy products hoặc variants. Vui lòng chạy ProductsSeeder trước.');
        }

        // Lấy users có role phù hợp để nhận hàng
        $validUsers = DB::table('users')
            ->join('roles', 'users.role_id', '=', 'roles.role_id')
            ->where('users.is_active', true)
            ->whereNotIn('roles.name', ['Admin', 'Guest', 'Customer'])
            ->pluck('users.id');

        if ($validUsers->isEmpty()) {
            throw new \Exception('Không tìm thấy users phù hợp để nhận hàng.');
        }

        // Lấy danh sách purchase orders đang chờ nhận hàng
        $purchaseOrders = DB::table('purchase_orders')
            ->where('status', 'pending') // hoặc trạng thái phù hợp để nhận hàng
            ->pluck('po_id');

        if ($purchaseOrders->isEmpty()) {
            throw new \Exception('Không tìm thấy purchase orders phù hợp. Vui lòng chạy PurchaseOrderSeeder trước.');
        }

        // Tạo 5 phiếu nhập kho
        for ($i = 0; $i < 5; $i++) {
            DB::beginTransaction();

            // Lấy random một purchase order
            $poId = $purchaseOrders->random();

            // Tạo phiếu nhập
            $receiptId = DB::table('inventory_receipts')->insertGetId([
                'received_by' => $validUsers->random(),
                'po_id' => $poId,
            ]);

            // Lấy các sản phẩm từ purchase order details
            $poDetails = DB::table('purchase_order_details')
                ->where('po_id', $poId)
                ->get();

            foreach ($poDetails as $detail) {
                $quantity = $detail->quantity;
                $unitPrice = $detail->unit_price;

                // Tạo chi tiết phiếu nhập
                DB::table('inventory_receipt_details')->insert([
                    'received_id' => $receiptId,
                    'variant_id' => $detail->variant_id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'expiry_date' => $faker->optional()->dateTimeBetween('+6 months', '+2 years'),
                ]);

                // Cập nhật stock_quantity trong product_variants
                DB::table('product_variants')
                    ->where('variant_id', $detail->variant_id)
                    ->increment('stock_quantity', $quantity);

                // Lấy product_id từ variant
                $productId = DB::table('product_variants')
                    ->where('variant_id', $detail->variant_id)
                    ->value('product_id');

                // Tạo inventory history
                DB::table('inventory_history')->insert([
                    'product_id' => $productId,
                    'create_by' => $validUsers->random(),
                    'reference' => 'REC-' . $receiptId,
                    'reference_type' => 'receipt',
                    'quantity_change' => $quantity,
                    'remaining_quantity' => DB::raw("(SELECT stock_quantity FROM product_variants WHERE variant_id = {$detail->variant_id})"),
                    'note' => "Nhập kho từ đơn mua hàng #{$poId}"
                ]);
            }

            // Cập nhật trạng thái purchase order
            DB::table('purchase_orders')
                ->where('po_id', $poId)
                ->update(['status' => 'received']);

            DB::commit();
        }
    }
}


class ProductImageSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $products = DB::table('products')->pluck('product_id');

        foreach ($products as $productId) {
            $numberOfImages = $faker->numberBetween(3, 5);

            for ($i = 0; $i < $numberOfImages; $i++) {
                DB::table('product_images')->insert([
                    'product_id' => $productId,
                    'image_url' => $faker->imageUrl(800, 600, 'products'),
                    'display_order' => $i + 1,
                    'is_primary' => $i === 0, // First image is primary
                    'alt_text' => $faker->words(3, true),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

class ProductVariantSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        $products = DB::table('products')->pluck('product_id');
        $sizes = DB::table('sizes')->pluck('size_id');
        $colors = DB::table('colors')->pluck('color_id');

        foreach ($products as $productId) {
            $basePrice = DB::table('products')
                ->where('product_id', $productId)
                ->value('price');

            // Create 3-6 variants per product
            foreach ($faker->randomElements($sizes, 2) as $sizeId) {
                foreach ($faker->randomElements($colors, 3) as $colorId) {
                    // Variant price might be slightly different from base price
                    $priceAdjustment = $faker->randomFloat(2, -5, 5);

                    DB::table('product_variants')->insert([
                        'product_id' => $productId,
                        'size_id' => $sizeId,
                        'color_id' => $colorId,
                        'sku' => $faker->unique()->bothify('SKU-####'),
                        'price' => $basePrice + $priceAdjustment,
                        'stock_quantity' => $faker->numberBetween(0, 100),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
class PurchaseOrderSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Lấy danh sách suppliers
        $suppliers = DB::table('suppliers')
            ->where('is_active', true)
            ->pluck('supplier_id');

        if ($suppliers->isEmpty()) {
            throw new \Exception('Không tìm thấy suppliers. Vui lòng chạy SuppliersSeeder trước.');
        }

        // Lấy danh sách products và variants
        $variants = DB::table('product_variants')
            ->join('products', 'product_variants.product_id', '=', 'products.product_id')
            ->where('products.is_active', true)
            ->select(
                'product_variants.variant_id',
                'products.product_id',
                'product_variants.price as regular_price'
            )
            ->get();

        if ($variants->isEmpty()) {
            throw new \Exception('Không tìm thấy product variants. Vui lòng chạy ProductsSeeder trước.');
        }

        // Lấy users có role phù hợp để tạo PO
        $validUsers = DB::table('users')
            ->join('roles', 'users.role_id', '=', 'roles.role_id')
            ->where('users.is_active', true)
            ->whereNotIn('roles.name', ['Admin', 'Guest', 'Customer'])
            ->pluck('users.id');

        if ($validUsers->isEmpty()) {
            throw new \Exception('Không tìm thấy users phù hợp để tạo đơn hàng.');
        }

        // Tạo 10 purchase orders
        for ($i = 0; $i < 10; $i++) {
            DB::beginTransaction();

                // Chọn random một supplier
                $supplierId = $suppliers->random();

                // Tạo purchase order
                $poId = DB::table('purchase_orders')->insertGetId([
                    'supplier_id' => $supplierId,
                    'create_by_user_id' => $validUsers->random(),
                    'order_date' => $faker->dateTimeBetween('-3 months', 'now'),
                    'expected_date' => $faker->dateTimeBetween('now', '+2 months'),
                    'total_amount' => 0, // Sẽ cập nhật sau
                    'status' => $faker->randomElement(['pending', 'processing', 'completed']),
                    'note' => $faker->optional()->sentence()
                ]);

                // Tạo chi tiết cho 3-7 sản phẩm
                $selectedVariants = collect($faker->randomElements($variants->toArray(), $faker->numberBetween(3, 7)))->unique('product_id');
                $totalAmount = 0;

                foreach ($selectedVariants as $variant) {
                    $existingDetail = DB::table('purchase_order_details')
                        ->where('po_id', $poId)
                        ->where('product_id', $variant->product_id)
                        ->first();

                    if ($existingDetail) {
                        continue; // Bỏ qua nếu sản phẩm đã tồn tại trong đơn hàng này
                    }

                    $quantity = $faker->numberBetween(10, 100);
                    $unitPrice = $faker->randomFloat(2, $variant->regular_price * 0.6, $variant->regular_price * 0.8);
                    $subtotal = $quantity * $unitPrice;
                    $totalAmount += $subtotal;

                    DB::table('purchase_order_details')->insert([
                        'po_id' => $poId,
                        'product_id' => $variant->product_id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $subtotal
                    ]);
                }

                // Cập nhật tổng tiền trong purchase order
                DB::table('purchase_orders')
                    ->where('po_id', $poId)
                    ->update(['total_amount' => $totalAmount]);

                DB::commit();

        }
    }
}
