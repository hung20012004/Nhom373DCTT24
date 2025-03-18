import React from "react";
import {
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Line,
    ResponsiveContainer
} from "recharts";

const RevenueChart = () => {
    // Sample data based on your chart
    const revenueData = [
        { date: "02 Mar", value: 0 },
        { date: "05 Mar", value: 0 },
        { date: "08 Mar", value: 0 },
        { date: "11 Mar", value: 4500000 },
        { date: "14 Mar", value: 2500000 },
        { date: "17 Mar", value: 4400000 },
        { date: "19 Mar", value: 5100000 },
        { date: "20 Mar", value: 0 },
        { date: "23 Mar", value: 0 },
        { date: "26 Mar", value: 0 },
        { date: "31 Mar", value: 0 }
    ];

    const formatYAxis = (value) => {
        if (value >= 1000000) {
            return `${value / 1000000}M`;
        }
        return value;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
                Doanh thu theo thời gian
            </h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={revenueData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value.toLocaleString()} VND`, "Doanh thu"]}
                            labelFormatter={(label) => `Ngày: ${label}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="value"
                            name="Doanh thu"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
