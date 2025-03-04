import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const Confirmation = ({ order }) => {
    console.log('Order data:', order);

    return (
        <Layout>
            <Head title="Đặt hàng thành công" />

            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Đặt hàng thành công!</CardTitle>
                        <p className="text-gray-600">
                            Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: #{order.order_id}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Thông tin đơn hàng</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <p className="text-sm text-gray-600">Ngày đặt hàng:</p>
                                        <p>{new Date(order.order_date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                                        <p>
                                            {order.payment_method === 'cod'
                                                ? 'Thanh toán khi nhận hàng (COD)'
                                                : 'VNPAY'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Trạng thái đơn hàng:</p>
                                        <p className="font-medium text-orange-500">
                                            {order.order_status === 'new' ? 'Mới tạo' : 'Đang xử lý'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Trạng thái thanh toán:</p>
                                        <p className={`font-medium ${order.payment_status === 'paid' ? 'text-green-500' : 'text-orange-500'}`}>
                                            {order.payment_status === 'paid'
                                                ? 'Đã thanh toán'
                                                : order.payment_status === 'pending'
                                                ? 'Chờ thanh toán'
                                                : 'Chưa thanh toán'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Địa chỉ giao hàng</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {order.shipping_address ? (
                                    <>
                                        <p>{order.shipping_address.recipient_name}</p>
                                        <p>{order.shipping_address.phone}</p>
                                        <p>
                                            {order.shipping_address.street_address || order.shipping_address.address},
                                            {order.shipping_address.ward && ` ${order.shipping_address.ward},`}
                                            {order.shipping_address.district && ` ${order.shipping_address.district},`}
                                            {order.shipping_address.province && ` ${order.shipping_address.province}`}
                                        </p>
                                    </>
                                ) : (
                                    <p>Đơn hàng sẽ được giao đến địa chỉ mặc định của bạn.
                                    Bạn có thể kiểm tra lại trong trang quản lý đơn hàng.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Chi tiết đơn hàng</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {order.details && order.details.length > 0 ? (
                                    order.details.map((detail) => (
                                        <div key={detail.order_detail_id} className="flex justify-between py-2 border-b last:border-0">
                                            <div className="flex items-center space-x-2">
                                                <img
                                                    src={detail.variant && detail.variant.image ? detail.variant.image : '/placeholder.png'}
                                                    alt={detail.variant ? detail.variant.name : 'Sản phẩm'}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <p className="font-medium">{detail.variant ? detail.variant.name : 'Sản phẩm'}</p>
                                                    <p className="text-sm text-gray-500">Số lượng: {detail.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p>{detail.subtotal ? detail.subtotal.toLocaleString('vi-VN') : 0}đ</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center text-gray-500">
                                        Chi tiết đơn hàng đang được xử lý. Vui lòng xem trang đơn hàng để biết thêm thông tin.
                                    </div>
                                )}

                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Tạm tính:</span>
                                        <span>{order.subtotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí vận chuyển:</span>
                                        <span>{order.shipping_fee.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    {parseFloat(order.discount_amount) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Giảm giá:</span>
                                            <span>-{parseFloat(order.discount_amount).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-medium text-lg pt-2 border-t">
                                        <span>Tổng cộng:</span>
                                        <span>{order.total_amount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-center space-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/products">Tiếp tục mua sắm</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/order">Xem đơn hàng của tôi</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </Layout>
    );
};

export default Confirmation;
