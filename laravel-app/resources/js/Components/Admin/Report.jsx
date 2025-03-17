import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';

export default function Reports({ reportTypes, initialData }) {
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [groupBy, setGroupBy] = useState('day');
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState(initialData || []);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        if (dateRange === 'custom') {
            // Don't fetch on custom range until dates are set
            if (!startDate || !endDate) return;
        }

        fetchReportData();
    }, [reportType, dateRange, groupBy, startDate, endDate]);

    const fetchReportData = async () => {
        setIsLoading(true);

        let params = {
            type: reportType,
            range: dateRange,
            groupBy: groupBy
        };

        if (dateRange === 'custom') {
            params.startDate = startDate;
            params.endDate = endDate;
        }

        // Add any additional filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params[key] = filters[key];
            }
        });

        try {
            const response = await fetch(`/api/admin/reports?${new URLSearchParams(params).toString()}`);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const downloadReport = (format) => {
        let params = {
            type: reportType,
            range: dateRange,
            groupBy: groupBy,
            format: format
        };

        if (dateRange === 'custom') {
            params.startDate = startDate;
            params.endDate = endDate;
        }

        // Add any additional filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params[key] = filters[key];
            }
        });

        window.location.href = `/api/admin/reports/download?${new URLSearchParams(params).toString()}`;
    };

    const renderChart = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64">Loading...</div>;
        }

        if (!reportData || reportData.length === 0) {
            return <div className="flex justify-center items-center h-64">No data available</div>;
        }

        switch (reportType) {
            case 'sales':
            case 'revenue':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'products':
            case 'categories':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    const renderTable = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64">Loading...</div>;
        }

        if (!reportData || reportData.length === 0) {
            return <div className="flex justify-center items-center h-64">No data available</div>;
        }

        // Dynamically generate table headers based on the first item in reportData
        const headers = Object.keys(reportData[0]).filter(key => key !== 'id');

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {headers.map((header, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                        {typeof row[header] === 'number' ?
                                            header.toLowerCase().includes('price') || header.toLowerCase().includes('amount') || header.toLowerCase().includes('revenue') ?
                                                `$${row[header].toFixed(2)}` : row[header]
                                            : row[header]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Reports" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>

                    {/* Filters and Controls */}
                    <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-2">
                                <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
                                    Report Type
                                </label>
                                <select
                                    id="report-type"
                                    name="report-type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    {reportTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
                                    Date Range
                                </label>
                                <select
                                    id="date-range"
                                    name="date-range"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                >
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="group-by" className="block text-sm font-medium text-gray-700">
                                    Group By
                                </label>
                                <select
                                    id="group-by"
                                    name="group-by"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value)}
                                >
                                    <option value="day">Day</option>
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                    <option value="quarter">Quarter</option>
                                    <option value="year">Year</option>
                                </select>
                            </div>

                            {dateRange === 'custom' && (
                                <>
                                    <div className="sm:col-span-3">
                                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="start-date"
                                            id="start-date"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="end-date"
                                            id="end-date"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => fetchReportData()}
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {/* Chart and Table */}
                    <div className="mt-8 bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900">Report Results</h2>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => downloadReport('csv')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        CSV
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadReport('pdf')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        PDF
                                    </button>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="mt-4">
                                {renderChart()}
                            </div>

                            {/* Table */}
                            <div className="mt-8">
                                {renderTable()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
