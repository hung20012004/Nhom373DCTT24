<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:categories,category_id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string', // Thay đổi validation cho image_url
            'is_active' => 'required|boolean',
            'display_order' => 'required|integer|min:0'
        ]);

        DB::beginTransaction();
        try {
            $validated['slug'] = Str::slug($validated['name'] . ' ' . uniqid());

            // Nếu có image_url từ Cloudinary, sử dụng nó trực tiếp
            if ($request->has('image_url')) {
                $validated['image_url'] = $request->image_url;
            }

            $category = Category::create($validated);

            DB::commit();
            return response()->json(new CategoryResource($category), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating category'], 500);
        }
    }

    public function update(Request $request, $categoryId)
    {
        // Validate tất cả các trường có thể được gửi từ form
        $rules = [
            'parent_id' => 'nullable|exists:categories,category_id',
            'name' => 'string|max:255',
            'slug' => 'string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0'
        ];

        // Validate dữ liệu
        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            // Tìm category theo ID
            $category = Category::findOrFail($categoryId);
            // Tạo mảng chứa dữ liệu cần update
            $updateData = [];

            // Kiểm tra và thêm từng trường vào mảng update nếu có trong request
            if ($request->has('name')) {
                $updateData['name'] = $validated['name'];
                $updateData['slug'] = Str::slug($validated['name']);
            }

            if ($request->has('description')) {
                $updateData['description'] = $validated['description'];
            }

            if ($request->has('image_url')) {
                // Nếu image_url là rỗng (đã xóa ảnh)
                if (empty($request->image_url)) {
                    $updateData['image_url'] = null;
                    // Thêm logic xóa ảnh cũ từ Cloudinary nếu cần
                    if ($category->image_url) {
                        // Xóa ảnh cũ từ Cloudinary
                        // $this->deleteFromCloudinary($category->image_url);
                    }
                } else {
                    $updateData['image_url'] = $validated['image_url'];
                }
            }

            if ($request->has('is_active')) {
                $updateData['is_active'] = $validated['is_active'];
            }

            if ($request->has('display_order')) {
                $updateData['display_order'] = $validated['display_order'];
            }

            if ($request->has('parent_id')) {
                $updateData['parent_id'] = $validated['parent_id'];
            }

            // Chỉ update nếu có dữ liệu thay đổi
            if (!empty($updateData)) {
                $category->update($updateData);
            }

            DB::commit();

            // Trả về category đã được cập nhật
            return response()->json(new CategoryResource($category));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating category',
                'error' => $e->getMessage(),
                'data' => $request->all() // Thêm dữ liệu request để debug
            ], 500);
        }
    }
    public function destroy($categoryId)
    {
        DB::beginTransaction();

        try {
            // Tìm category theo ID
            $category = Category::findOrFail($categoryId);
            // Kiểm tra xem category có products không
            if ($category->products()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete category because it has associated products'
                ], 400);
            }

            // Xóa category
            $category->delete();

            DB::commit();
            return response()->json([
                'message' => 'Category deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Không thể xóa danh mục: '], 500);
        }
    }
}
