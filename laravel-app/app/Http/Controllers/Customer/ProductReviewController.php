<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductReviewController extends Controller
{

    public function getProductReviews($productId)
    {
        $reviews = ProductReview::where('product_id', $productId)
            ->join('users', 'product_reviews.user_id', '=', 'users.id')
            ->join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
            ->select(
                'product_reviews.review_id',
                'product_reviews.product_id',
                'product_reviews.rating',
                'product_reviews.comment',
                'product_reviews.created_at',
                'product_reviews.updated_at',
                'users.id',
                'user_profiles.full_name'
            )
            ->orderBy('product_reviews.created_at', 'desc')
            ->get();

        // Tính toán thống kê đánh giá
        $stats = $this->calculateReviewStats($productId);

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
            'stats' => $stats
        ]);
    }

    /**
     * Lấy đánh giá của người dùng hiện tại cho sản phẩm
     */
    public function getUserReview($productId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng chưa đăng nhập'
            ]);
        }

        $userId = Auth::id();
        $review = ProductReview::where('product_id', $productId)
            ->where('user_id', $userId)
            ->first();

        return response()->json([
            'success' => true,
            'review' => $review
        ]);
    }

    /**
     * Thêm đánh giá mới
     */
    public function store(Request $request, $productId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để đánh giá sản phẩm'
            ], 401);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        $existingReview = ProductReview::where('product_id', $productId)
            ->where('user_id', Auth::id())
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã đánh giá sản phẩm này. Vui lòng sử dụng chức năng cập nhật.'
            ], 400);
        }

        // Tạo đánh giá mới
        $review = ProductReview::create([
            'product_id' => $productId,
            'user_id' => Auth::id(),
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá đã được gửi thành công',
            'review' => $review
        ]);
    }

    /**
     * Cập nhật đánh giá
     */
    public function update(Request $request, $productId, $reviewId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để cập nhật đánh giá'
            ], 401);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        $review = ProductReview::where('review_id', $reviewId)
            ->where('user_id', Auth::id())
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá hoặc bạn không có quyền cập nhật'
            ], 404);
        }

        // Cập nhật đánh giá
        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá đã được cập nhật thành công',
            'review' => $review
        ]);
    }

    /**
     * Xóa đánh giá
     */
    public function destroy($productId, $reviewId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để xóa đánh giá'
            ], 401);
        }

        $review = ProductReview::where('review_id', $reviewId)
            ->where('user_id', Auth::id())
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa'
            ], 404);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá đã được xóa thành công'
        ]);
    }

    /**
     * Tính toán thống kê đánh giá
     */
    private function calculateReviewStats($productId)
    {
        // Tổng số đánh giá
        $totalReviews = ProductReview::where('product_id', $productId)->count();

        if ($totalReviews === 0) {
            return [
                'averageRating' => 0,
                'totalReviews' => 0,
                'ratingCounts' => [
                    '1' => 0,
                    '2' => 0,
                    '3' => 0,
                    '4' => 0,
                    '5' => 0
                ]
            ];
        }

        // Điểm đánh giá trung bình
        $averageRating = ProductReview::where('product_id', $productId)->avg('rating');

        // Số lượng đánh giá cho mỗi mức sao
        $ratingCounts = ProductReview::where('product_id', $productId)
            ->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Đảm bảo có đủ các mức đánh giá từ 1-5
        $formattedRatingCounts = [];
        for ($i = 1; $i <= 5; $i++) {
            $formattedRatingCounts[$i] = $ratingCounts[$i] ?? 0;
        }

        return [
            'averageRating' => (float) $averageRating,
            'totalReviews' => $totalReviews,
            'ratingCounts' => $formattedRatingCounts
        ];
    }
}
