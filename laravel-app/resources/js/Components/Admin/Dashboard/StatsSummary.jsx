import React from "react";
import StatCard from "./StatCard";
import { formatVND } from '@/utils/format';

export default function StatsSummary({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
                title="Tổng đơn hàng"
                value={stats.totalOrders || 0}
                change={stats.orderChange || 0}
                icon="📦"
            />
            <StatCard
                title="Doanh thu"
                value={formatVND(stats.revenue || 0)}
                change={stats.revenueChange || 0}
                icon="💰"
            />
            <StatCard
                title="Khách hàng"
                value={stats.totalCustomers || 0}
                change={stats.customerChange || 0}
                icon="👥"
            />
            <StatCard
                title="Giá trị đơn hàng TB"
                value={formatVND(stats.avgOrderValue || 0)}
                change={stats.avgOrderChange || 0}
                icon="📊"
            />
        </div>
    );
}
