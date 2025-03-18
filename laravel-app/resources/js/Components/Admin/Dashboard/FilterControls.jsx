import React from "react";
import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";

export default function FilterControls({
    timeFilter,
    setTimeFilter,
    selectedReport,
    setSelectedReport,
    filterOptions,
    reportOptions
}) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-md border-gray-300 py-2 px-3 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
                {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="rounded-md border-gray-300 py-2 px-3 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
                {reportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <Button className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Xuất báo cáo
            </Button>
        </div>
    );
}
