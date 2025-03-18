import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

export default function LowStockTable({ lowStockProducts }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Cảnh báo hàng tồn kho thấp
            </h2>
            <div className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sản phẩm
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Danh mục
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tồn kho
                            </TableHead>
                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lowStockProducts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-4 text-gray-500"
                                >
                                    Không có sản phẩm nào sắp hết hàng
                                </TableCell>
                            </TableRow>
                        ) : (
                            lowStockProducts.map((product, index) => (
                                <TableRow
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                        {product.category}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                        {product.stock}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-sm">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Hàng sắp hết
                                        </span>
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
