import React from "react";

export default function StatCard({ title, value, change, icon }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="text-2xl">{icon}</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-lg font-medium text-gray-900">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                    <span
                        className={`font-medium ${
                            change > 0
                                ? "text-green-600"
                                : change < 0
                                ? "text-red-600"
                                : "text-gray-900"
                        }`}
                    >
                        {change > 0 ? "↑" : change < 0 ? "↓" : ""}{" "}
                        {Math.abs(change)}%
                    </span>
                    <span className="text-gray-500"> so với kỳ trước</span>
                </div>
            </div>
        </div>
    );
}
