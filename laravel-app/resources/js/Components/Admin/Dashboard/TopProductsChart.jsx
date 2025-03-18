import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function TopProductsChart({ topProducts }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Sản phẩm bán chạy
            </h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                            dataKey="value"
                            name="Số lượng bán"
                            fill="#82ca9d"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
