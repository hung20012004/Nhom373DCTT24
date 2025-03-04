import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Breadcrumb from '@/Components/Breadcrumb';
import axios from 'axios';
import { ArrowUpDown } from 'lucide-react';

// Customer Details Dialog Component
const CustomerDetailsDialog = ({ customer, onClose }) => {
    if (!customer) return null;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Full Name</h3>
                            <p>{customer.full_name}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Email</h3>
                            <p>{customer.email}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Phone</h3>
                            <p>{customer.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Gender</h3>
                            <p>{customer.gender || 'Not specified'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Date of Birth</h3>
                            <p>{customer.date_of_birth || 'Not provided'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Account Status</h3>
                            <p className={`font-semibold ${customer.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </div>

                    {customer.shipping_address && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Shipping Address</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p>{customer.shipping_address.street_address}</p>
                                <p>{customer.shipping_address.ward}, {customer.shipping_address.district}</p>
                                <p>{customer.shipping_address.province}</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Main Customer Management Component
export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState('full_name');
    const [sortDirection, setSortDirection] = useState('asc');

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('customers/index', {
                params: {
                    search,
                    page: pagination.current_page,
                    per_page: pagination.per_page,
                    sort_field: sortField,
                    sort_direction: sortDirection
                }
            });

            if (response.data && response.data.data) {
                setCustomers(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    per_page: response.data.per_page,
                    total: response.data.total,
                    last_page: response.data.last_page
                });
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCustomers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, pagination.current_page, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const breadcrumbItems = [
        { label: 'Customers', href: '/admin/customers' }
    ];

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

    return (
        <AdminLayout>
            <Head title="Customer Management" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <Input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-64"
                    />
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="id">ID</SortableHeader>
                                    <SortableHeader field="full_name">Full Name</SortableHeader>
                                    <SortableHeader field="email">Email</SortableHeader>
                                    <SortableHeader field="phone">Phone</SortableHeader>
                                    <TableHead>Status</TableHead>
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
                                ) : !customers || customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                            No customers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer) => (
                                        <TableRow
                                            key={customer.user_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {customer.user_id}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {customer.full_name}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {customer.email}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {customer.phone || 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    customer.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {customer.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View Details
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {selectedCustomer && (
                    <CustomerDetailsDialog
                        customer={selectedCustomer}
                        onClose={() => setSelectedCustomer(null)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
