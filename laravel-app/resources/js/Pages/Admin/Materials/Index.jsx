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
import axios from 'axios';
import { ArrowUpDown } from 'lucide-react';
export default function MaterialIndex() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
        const [search, setSearch] = useState('');
        const [pagination, setPagination] = useState({
            current_page: 1,
            per_page: 10,
            total: 0,
            last_page: 1
        });
        const [sortField, setSortField] = useState('name');
        const [sortDirection, setSortDirection] = useState('asc');
        const fetchMaterials = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/v1/materials', {
                    params: {
                        search,
                        page: pagination.current_page,
                        per_page: pagination.per_page,
                        sort_field: sortField,
                        sort_direction: sortDirection
                    }
                });

                if (response.data) {
                    setMaterials(response.data.data);
                    setPagination({
                        current_page: response.data.current_page,
                        per_page: response.data.per_page,
                        total: response.data.total,
                        last_page: response.data.last_page
                    });
                }
            } catch (error) {
                console.error('Error fetching materials:', error);
                setMaterials([]);
            } finally {
                setLoading(false);
            }
        };
        useEffect(() => {
                const timeoutId = setTimeout(() => {
                    fetchMaterials()
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
                { label: 'Materials', href: '/admin/materials' }
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
                    className="cursor-pointer"
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
                    <Head title="Materials Management" />

                    <div className="container mx-auto py-6">
                        <Breadcrumb items={[{ label: 'Materials', href: '/admin/materials' }]} />

                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">Materials</h1>
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Search materials..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-64"
                                />
                                <Button>
                                    Add New Material
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableHeader field="name">Name</SortableHeader>
                                        <SortableHeader field="description">Description</SortableHeader>
                                        <TableHead>Actions</TableHead>
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
                                    ) : materials.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                                No materials found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        materials.map((material) => (
                                            <TableRow key={material.id}>
                                                <TableCell>{material.name}</TableCell>
                                                <TableCell>{material.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline">Edit</Button>
                                                        <Button variant="destructive">Delete</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            <div className="flex justify-between items-center p-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Showing {materials.length} of {pagination.total} results
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
