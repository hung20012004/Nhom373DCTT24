import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Star, Send, AlertCircle } from "lucide-react";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProductReviewComponent = ({ productId, variant }) => {
    const { auth } = usePage().props;
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [allReviews, setAllReviews] = useState([]);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });

    // Fetch reviews for this product
    useEffect(() => {
        if (productId) {
            fetchReviews();
            if (auth.user) {
                fetchUserReview();
            }
        }
    }, [productId, auth.user]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/products/${productId}/reviews`);
            if (response.data.success) {
                setAllReviews(response.data.reviews);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const fetchUserReview = async () => {
        try {
            const response = await axios.get(`/products/${productId}/reviews/user`);
            if (response.data.success && response.data.review) {
                setUserReview(response.data.review);
                setRating(response.data.review.rating);
                setComment(response.data.review.comment);
            }
        } catch (error) {
            console.error("Error fetching user review:", error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!auth.user) {
            setError("Vui lòng đăng nhập để đánh giá sản phẩm!");
            return;
        }

        if (rating === 0) {
            setError("Vui lòng chọn số sao đánh giá!");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const url = userReview
                ? `/products/${productId}/reviews/${userReview.review_id}`
                : `/products/${productId}/reviews`;

            const method = userReview ? 'put' : 'post';

            const response = await axios[method](url, {
                rating,
                comment,
                variant_id: variant?.variant_id || null
            });

            if (response.data.success) {
                setSuccess(true);
                fetchReviews();
                if (!userReview) {
                    fetchUserReview();
                }

                // Reset success message after 3 seconds
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            } else {
                setError(response.data.message || "Đã xảy ra lỗi khi gửi đánh giá");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi khi gửi đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (currentRating, interactive = false, key = "") => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <button
                    type="button"
                    key={`${key}-star-${index}`}
                    className={`${
                        interactive ? "cursor-pointer" : "cursor-default"
                    } focus:outline-none`}
                    onClick={() => interactive && setRating(starValue)}
                    onMouseEnter={() => interactive && setHoverRating(starValue)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                >
                    <Star
                        className={`w-6 h-6 ${
                            starValue <= (interactive ? (hoverRating || currentRating) : currentRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                        }`}
                    />
                </button>
            );
        });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Calculate percentage for rating bar
    const getRatingPercentage = (count) => {
        if (stats.totalReviews === 0) return 0;
        return (count / stats.totalReviews) * 100;
    };

    return (
        <div className="bg-white rounded-lg border p-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>

            {/* Review Statistics */}
            {stats.totalReviews > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                            <div className="flex justify-center mt-1">{renderStars(stats.averageRating, false, "stats")}</div>
                            <div className="text-sm text-gray-500 mt-1">{stats.totalReviews} đánh giá</div>
                        </div>
                        <div className="flex-1">
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="flex items-center gap-2 mb-1">
                                    <div className="text-sm font-medium w-2">{star}</div>
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${getRatingPercentage(stats.ratingCounts[star])}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 w-10">
                                        {stats.ratingCounts[star]} đánh giá
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="mb-6">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                        <AlertDescription>Đánh giá của bạn đã được gửi thành công!</AlertDescription>
                    </Alert>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đánh giá của bạn
                    </label>
                    <div className="flex items-center">
                        {renderStars(rating, true, "user-rating")}
                        <span className="ml-2 text-sm text-gray-500">
                            {rating > 0 ? `${rating}/5 sao` : "Chưa đánh giá"}
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét của bạn (tùy chọn)
                    </label>
                    <textarea
                        id="comment"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={submitting || !auth.user}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white ${
                        submitting || !auth.user
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    <Send className="w-4 h-4" />
                    {submitting
                        ? "Đang gửi..."
                        : userReview
                            ? "Cập nhật đánh giá"
                            : "Gửi đánh giá"}
                </button>

                {!auth.user && (
                    <p className="mt-2 text-sm text-gray-500">
                        Vui lòng đăng nhập để đánh giá sản phẩm
                    </p>
                )}
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">
                    {allReviews.length > 0
                        ? `${allReviews.length} đánh giá từ khách hàng`
                        : "Chưa có đánh giá nào"}
                </h4>

                {allReviews.map((review) => (
                    <div key={review.review_id} className="border-b pb-4">
                        <div className="flex justify-between mb-1">
                            <div className="font-medium">{review.full_name || "Người dùng"}</div>
                            <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                        </div>
                        <div className="flex items-center mb-2">
                            {renderStars(review.rating, false, `review-${review.review_id}`)}
                            {review.variant && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {review.variant_color} / {review.variant_size}
                                </span>
                            )}
                        </div>
                        {review.comment && <p className="text-gray-700">{review.comment}</p>}
                    </div>
                ))}

                {allReviews.length > 5 && (
                    <div className="text-center pt-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Xem tất cả đánh giá
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviewComponent;
