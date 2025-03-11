import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import Breadcrumb from '@/Components/Breadcrumb';
import axios from 'axios';
import { ArrowUpDown, Eye, Trash2 } from 'lucide-react';

export default function OrdersIndex({ orders, filters }) {
    const [ordersList, setOrdersList] = useState(orders.data);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    const [pagination, setPagination] = useState({
        current_page: orders.current_page,
        per_page: orders.per_page,
        total: orders.total,
        last_page: orders.last_page
    });

    // Fetch orders with current filters
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/orders', {
                params: {
                    search,
                    status,
                    page: pagination.current_page,
                    per_page: pagination.per_page,
                    sort_field: sortField,
                    sort_direction: sortDirection
                }
            });

            if (response.data && response.data.orders) {
                setOrdersList(response.data.orders.data);
                setPagination({
                    current_page: response.data.orders.current_page,
                    per_page: response.data.orders.per_page,
                    total: response.data.orders.total,
                    last_page: response.data.orders.last_page
                });
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search and filter
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, status, pagination.current_page, sortField, sortDirection]);

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Handle order deletion
    const handleDelete = async (orderId) => {
        if (confirm('Are you sure you want to delete this order?')) {
            try {
                const response = await axios.delete(`/admin/orders/${orderId}`);
                if (response.status === 200) {
                    fetchOrders();
                    alert('Order deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                alert(error.response?.data?.message || 'Failed to delete order');
            }
        }
    };

    // Render pagination buttons
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.last_page; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={pagination.current_page === i ? "default" : "outline"}
                    className="w-10 h-10"
                    onClick={() => setPagination(prev => ({ ...prev, current_page: i }))}
                >
                    {i}
                </Button>
            );
        }
        return pages;
    };

    // Sortable table header component
    const SortableHeader = ({ field, children }) => (
        <TableHead
            className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <ArrowUpDown className="w-4 h-4" />
            </div>
        </TableHead>
    );

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-green-100 text-green-800';
            case 'delivered': return 'bg-green-200 text-green-900';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const breadcrumbItems = [
        { label: 'Orders', href: '/admin/orders' }
    ];

    return (
        <AdminLayout>
            <Head title="Manage Orders" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64"
                        />
                        <Select
                            value={status}
                            onValueChange={setStatus}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <SortableHeader field="id">Order ID</SortableHeader>
                                <SortableHeader field="user_name">Customer</SortableHeader>
                                <SortableHeader field="total_amount">Total Amount</SortableHeader>
                                <SortableHeader field="status">Status</SortableHeader>
                                <SortableHeader field="created_at">Order Date</SortableHeader>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : !ordersList || ordersList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ordersList.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <TableCell className="py-4 px-6 text-sm text-gray-900">
                                            #{order.id}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-gray-900">
                                            {order.user.name}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-gray-900">
                                            ${order.total_amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-gray-900">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-gray-900">
                                            <div className="flex gap-2">
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Button variant="outline" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDelete(order.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                            Showing {ordersList.length} of {pagination.total} orders
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
