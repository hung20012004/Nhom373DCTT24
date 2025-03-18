import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { formatVND } from '@/utils/format';

export default function RecentOrdersTable({ recentOrders }) {
    function getStatusText(status) {
        const statusMap = {
            new: "Mới",
            processing: "Đang xử lý",
            confirmed: "Đã xác nhận",
            preparing: "Đang chuẩn bị",
            packed: "Đã đóng gói",
            shipping: "Đang giao hàng",
            delivered: "Đã giao hàng",
            cancelled: "Đã hủy",
        };

        return statusMap[status] || status;
    }

    // Thêm hàm formatDate để chuyển đổi ngày sang định dạng Việt Nam
    function formatDate(dateString) {
        // Kiểm tra nếu dateString là string hợp lệ
        if (!dateString) return "";

        try {
            const date = new Date(dateString);

            // Kiểm tra nếu date không hợp lệ
            if (isNaN(date.getTime())) return dateString;

            // Format theo định dạng DD/MM/YYYY
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (error) {
            // Nếu có lỗi khi parse date, trả về string gốc
            return dateString;
        }
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                    Đơn hàng gần đây
                </h2>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mã đơn hàng
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Khách hàng
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày đặt
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tổng tiền
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-4 text-gray-500"
                                >
                                    Không có đơn hàng gần đây
                                </TableCell>
                            </TableRow>
                        ) : (
                            recentOrders.map((order, index) => (
                                <TableRow
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                        #{order.id}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                        {order.customer}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                        {formatDate(order.date)}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                        {formatVND(order.total)}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                order.status === "delivered"
                                                    ? "bg-green-100 text-green-800"
                                                    : order.status === "processing" ||
                                                      order.status === "confirmed"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : order.status === "shipping"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : order.status === "cancelled"
                                                    ? "bg-red-100 text-red-800"
                                                    : order.status === "new"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : order.status === "preparing" ||
                                                      order.status === "packed"
                                                    ? "bg-indigo-100 text-indigo-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm">
                                        <Button
                                            variant="outline"
                                            className="text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700"
                                        >
                                            Xem
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
