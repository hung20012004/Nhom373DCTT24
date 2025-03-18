import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function OrderStatusChart({ orderStatusData }) {
    // Define all possible status values with Vietnamese translations
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

    // Ensure all statuses are included in the chart
    const allStatuses = Object.keys(statusMap);

    // Convert the data to use Vietnamese labels and ensure all statuses are included
    const completeData = allStatuses.map(status => {
        // Find if this status exists in the provided data
        const existingEntry = orderStatusData.find(item => item.name === status);

        return {
            name: statusMap[status] || status, // Use Vietnamese label
            value: existingEntry ? existingEntry.value : 0, // Use existing value or 0 if not found
            originalStatus: status // Keep the original status key for reference
        };
    });

    // Filter out statuses with zero values if you don't want to show them
    // const filteredData = completeData.filter(item => item.value > 0);

    // Or keep all statuses regardless of value
    const filteredData = completeData;

    const colors = [
        "#0088FE", // new
        "#FFBB28", // processing
        "#FF8042", // confirmed
        "#00C49F", // preparing
        "#8884d8", // packed
        "#82ca9d", // shipping
        "#38b000", // delivered
        "#d62828", // cancelled
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Trạng thái đơn hàng
            </h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                                percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                            }
                        >
                            {filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[allStatuses.indexOf(entry.originalStatus) % colors.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
