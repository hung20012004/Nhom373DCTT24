import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
import Breadcrumb from '@/Components/Breadcrumb';
import ColorForm from './ColorForm';
import axios from 'axios';
import { ArrowUpDown } from 'lucide-react';

export default function Index() {
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editColor, setEditColor] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const fetchColors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/api/colors', {
                params: {
                    search,
                    page: pagination.current_page,
                    per_page: pagination.per_page,
                    sort_field: sortField,
                    sort_direction: sortDirection
                }
            });

            if (response.data && response.data.data) {
                setColors(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    per_page: response.data.per_page,
                    total: response.data.total,
                    last_page: response.data.last_page
                });
            }
        } catch (error) {
            console.error('Error fetching colors:', error);
            setColors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchColors();
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

    const handleDelete = async (colorId) => {
        if (confirm('Are you sure you want to delete this color?')) {
            try {
                const response = await axios.delete(`/admin/api/colors/${colorId}`);
                if (response.status === 200) {
                    fetchColors();
                    alert('Color deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting color:', error);
                alert(error.response?.data?.message || `Error deleting color ${colorId}`);
            }
        }
    };

    const breadcrumbItems = [
        { label: 'Colors', href: '/admin/colors' }
    ];

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
            <Head title="Colors Management" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Colors</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Input
                            type="text"
                            placeholder="Search colors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64"
                        />
                        <Button
                            onClick={() => {
                                setEditColor(null);
                                setShowForm(true);
                            }}
                        >
                            Add New Color
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="name">Name</SortableHeader>
                                    <TableHead className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Description</TableHead>
                                    <TableHead className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : !colors || colors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                            No colors found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    colors.map((color) => (
                                        <TableRow
                                            key={color.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{color.name}</TableCell>
                                            <TableCell className="py-4 px-6 text-center text-sm text-gray-900">
                                                {color.description?.substring(0, 50)}
                                                {color.description?.length > 50 ? '...' : ''}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700"
                                                        onClick={() => {
                                                            setEditColor(color);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="bg-red-600 text-center hover:bg-red-700 text-white"
                                                        onClick={() => handleDelete(color.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                            Showing {colors.length} of {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>

                {showForm && (
                    <ColorForm
                        color={editColor}
                        onClose={() => {
                            setShowForm(false);
                            setEditColor(null);
                        }}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditColor(null);
                            fetchColors();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
