import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, Printer, X } from "lucide-react";
import axios from "axios";

const OrderDialog = ({ orderId, isOpen, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const paymentStatusLabels = {
        paid: "Đã thu tiền",
        confirmed: "Đã xác nhận",
        pending: "Chờ thanh toán",
        rejected: "Đã từ chối",
        cancelled: "Đã hủy",
    };

    const paymentStatusClasses = {
        paid: "bg-green-100 text-green-800",
        confirmed: "bg-blue-100 text-blue-800",
        pending: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800",
        cancelled: "bg-red-100 text-red-800",
    };

    const orderStatusLabels = {
        new: "Mới tạo",
        confirmed: "Đã xác nhận",
        processing: "Đang xử lý",
        cancelled: "Đã hủy",
        preparing: "Đang chuẩn bị",
        packed: "Đã đóng gói",
        shipping: "Đang giao hàng",
        delivered: "Đã giao hàng",
        shipping_failed: "Giao hàng thất bại",
    };

    const statusClasses = {
        new: "bg-blue-100 text-blue-800",
        confirmed: "bg-cyan-100 text-cyan-800",
        processing: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        preparing: "bg-yellow-100 text-yellow-800",
        packed: "bg-purple-100 text-purple-800",
        shipping: "bg-indigo-100 text-indigo-800",
        delivered: "bg-emerald-100 text-emerald-800",
        shipping_failed: "bg-rose-100 text-rose-800",
    };

    const fetchOrder = async () => {
        if (!orderId || !isOpen) return;

        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/orders/${orderId}`);
            if (response.data && response.data.data) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrder();
        }
    }, [orderId, isOpen]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        const printContent = document.getElementById("print-content").innerHTML;
        const currentDate = format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi });

        printWindow.document.write(`
            <html>
                <head>
                    <title>Đơn hàng #${order?.order_id || ""}</title>
                    <style>
                        @page { size: A4; margin: 1cm }
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            line-height: 1.5;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #000;
                        }
                        .shop-info {
                            font-size: 12px;
                            margin-bottom: 10px;
                        }
                        .document-title {
                            font-size: 24px;
                            font-weight: bold;
                            margin: 10px 0;
                        }
                        .order-info {
                            margin-bottom: 20px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .order-info-section {
                            width: 48%;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 8px;
                            text-align: left;
                            font-size: 12px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        .total-section {
                            width: 300px;
                            margin-left: auto;
                            font-size: 12px;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 5px 0;
                        }
                        .total-final {
                            font-weight: bold;
                            border-top: 1px solid #000;
                            padding-top: 5px;
                        }
                        .signature-section {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 50px;
                            text-align: center;
                        }
                        .signature-box {
                            width: 200px;
                        }
                        .signature-title {
                            font-weight: bold;
                            margin-bottom: 60px;
                        }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="shop-info">
                            <div>TÊN CỬA HÀNG THỜI TRANG</div>
                            <div>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</div>
                            <div>Điện thoại: 0123.456.789 - Email: example@email.com</div>
                        </div>
                        <div class="document-title">PHIẾU MUA HÀNG</div>
                        <div>Số: #${order?.order_id || ""}</div>
                    </div>

                    <div class="order-info">
                        <div class="order-info-section">
                            <p><strong>Thông tin người nhận:</strong></p>
                            <p>Họ tên: ${order.shipping_address?.recipient_name}</p>
                            <p>SĐT: ${order.shipping_address?.phone}</p>
                            <p>Địa chỉ: ${order.shipping_address?.street_address}, ${
            order.shipping_address?.ward
        }, ${order.shipping_address?.district}, ${order.shipping_address?.province}</p>
                        </div>
                        <div class="order-info-section">
                            <p><strong>Thông tin đơn hàng:</strong></p>
                            <p>Ngày đặt: ${formatDate(order.order_date)}</p>
                            <p>Ngày in: ${currentDate}</p>
                            <p>Phương thức thanh toán: ${order.payment_method}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên sản phẩm</th>
                                <th>Thuộc tính</th>
                                <th class="text-right">SL</th>
                                <th class="text-right">Đơn giá</th>
                                <th class="text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.details
                                .map(
                                    (detail, index) => `
                                <tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td>${detail.variant?.product?.name}</td>
                                    <td>${detail.variant?.attribute_values
                                        ?.map((attr) => attr.value)
                                        .join(", ")}</td>
                                    <td class="text-right">${detail.quantity}</td>
                                    <td class="text-right">${formatCurrency(
                                        detail.unit_price
                                    )}</td>
                                    <td class="text-right">${formatCurrency(
                                        detail.subtotal
                                    )}</td>
                                </tr>
                            `
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span>Tổng tiền hàng:</span>
                            <span>${formatCurrency(order.subtotal)}</span>
                        </div>
                        ${
                            order.discount_amount > 0
                                ? `
                        <div class="total-row">
                            <span>Giảm giá:</span>
                            <span>-${formatCurrency(order.discount_amount)}</span>
                        </div>
                        `
                                : ""
                        }
                        <div class="total-row">
                            <span>Phí vận chuyển:</span>
                            <span>${formatCurrency(order.shipping_fee)}</span>
                        </div>
                        <div class="total-row total-final">
                            <span>Tổng thanh toán:</span>
                            <span>${formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>

                    ${
                        order.note
                            ? `
                    <div style="margin: 20px 0;">
                        <strong>Ghi chú:</strong>
                        <p>${order.note}</p>
                    </div>
                    `
                            : ""
                    }

                    <div class="signature-section">
                        <div class="signature-box">
                            <p class="signature-title">Người lập phiếu</p>
                            <p>(Ký, họ tên)</p>
                        </div>
                        <div class="signature-box">
                            <p class="signature-title">Người nhận hàng</p>
                            <p>(Ký, họ tên)</p>
                        </div>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const renderLoading = () => (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );

    const renderNotFound = () => (
        <div className="text-center p-6">
            <h2 className="text-2xl font-bold text-gray-800">
                Không tìm thấy đơn hàng
            </h2>
            <p className="mt-2 text-gray-600">
                Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">
                            Chi tiết đơn hàng #{orderId}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {loading ? (
                    renderLoading()
                ) : !order ? (
                    renderNotFound()
                ) : (
                    <>
                        <div className="flex justify-end mb-4">
                            <Button onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                In đơn
                            </Button>
                        </div>

                        {/* Nội dung sẽ được in */}
                        <div id="print-content">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle>
                                            Thông tin đơn hàng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-3">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Mã đơn:
                                                </span>
                                                <span className="font-medium">
                                                    #{order.order_id}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Ngày đặt:
                                                </span>
                                                <span>
                                                    {formatDate(
                                                        order.order_date
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Trạng thái đơn hàng:
                                                </span>
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        statusClasses[
                                                            order.order_status
                                                        ]
                                                    }`}
                                                >
                                                    {orderStatusLabels[
                                                        order.order_status
                                                    ] || order.order_status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Phương thức thanh toán:
                                                </span>
                                                <span>
                                                    {order.payment_method}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Trạng thái thanh toán:
                                                </span>
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        paymentStatusClasses[
                                                            order.payment_status
                                                        ]
                                                    }`}
                                                >
                                                    {paymentStatusLabels[
                                                        order.payment_status
                                                    ] || order.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle>
                                            Thông tin khách hàng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-3">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Người nhận:
                                                </span>
                                                <span className="font-medium">
                                                    {
                                                        order.shipping_address
                                                            ?.recipient_name
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Điện thoại:
                                                </span>
                                                <span>
                                                    {
                                                        order.shipping_address
                                                            ?.phone
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Địa chỉ:
                                                </span>
                                                <span className="text-right">
                                                    {
                                                        order.shipping_address
                                                            ?.street_address
                                                    }
                                                    ,{" "}
                                                    {
                                                        order.shipping_address
                                                            ?.ward
                                                    }
                                                    ,{" "}
                                                    {
                                                        order.shipping_address
                                                            ?.district
                                                    }
                                                    ,{" "}
                                                    {
                                                        order.shipping_address
                                                            ?.province
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="mb-6">
                                <CardHeader className="py-3">
                                    <CardTitle>Chi tiết đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="py-3">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        #
                                                    </TableHead>
                                                    <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Sản phẩm
                                                    </TableHead>
                                                    <TableHead className="py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Số lượng
                                                    </TableHead>
                                                    <TableHead className="py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Đơn giá
                                                    </TableHead>
                                                    <TableHead className="py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Thành tiền
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {order.details &&
                                                    order.details.map(
                                                        (detail, index) => (
                                                            <TableRow
                                                                key={index}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <TableCell className="py-2 px-4 text-sm text-gray-900">
                                                                    {index + 1}
                                                                </TableCell>
                                                                <TableCell className="py-2 px-4 text-sm text-gray-900">
                                                                    <div className="flex items-center">
                                                                        {detail
                                                                            .variant
                                                                            ?.image_url && (
                                                                            <img
                                                                                src={
                                                                                    detail
                                                                                        .variant
                                                                                        .image_url
                                                                                }
                                                                                alt={
                                                                                    detail
                                                                                        .variant
                                                                                        ?.product
                                                                                        ?.name
                                                                                }
                                                                                className="w-10 h-10 mr-3 object-cover rounded"
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {
                                                                                    detail
                                                                                        .variant
                                                                                        ?.product
                                                                                        ?.name
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {detail.variant?.attribute_values
                                                                                    ?.map(
                                                                                        (
                                                                                            attr
                                                                                        ) =>
                                                                                            attr.value
                                                                                    )
                                                                                    .join(
                                                                                        ", "
                                                                                    )}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                SKU:{" "}
                                                                                {
                                                                                    detail
                                                                                        .variant
                                                                                        ?.sku
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-2 px-4 text-sm text-gray-900 text-right">
                                                                    {
                                                                        detail.quantity
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="py-2 px-4 text-sm text-gray-900 text-right">
                                                                    {formatCurrency(
                                                                        detail.unit_price
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-2 px-4 text-sm text-gray-900 font-medium text-right">
                                                                    {formatCurrency(
                                                                        detail.subtotal
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="mt-6 flex flex-col items-end">
                                        <div className="w-full max-w-md space-y-2">
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">
                                                    Tổng tiền hàng:
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        order.subtotal
                                                    )}
                                                </span>
                                            </div>
                                            {order.discount_amount > 0 && (
                                                <div className="flex justify-between py-2">
                                                    <span className="text-gray-600">
                                                        Giảm giá:
                                                    </span>
                                                    <span className="font-medium text-red-600">
                                                        -
                                                        {formatCurrency(
                                                            order.discount_amount
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">
                                                    Phí vận chuyển:
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        order.shipping_fee
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-t border-gray-200">
                                                <span className="text-gray-800 font-medium">
                                                    Tổng thanh toán:
                                                </span>
                                                <span className="font-bold text-lg">
                                                    {formatCurrency(
                                                        order.total_amount
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {order.note && (
                                <Card className="mb-6">
                                    <CardHeader className="py-3">
                                        <CardTitle>Ghi chú</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-3">
                                        <p className="text-gray-700">
                                            {order.note}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OrderDialog;
