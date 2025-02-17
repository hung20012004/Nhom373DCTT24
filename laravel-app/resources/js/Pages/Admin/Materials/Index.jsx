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
import MaterialForm from './MaterialForm.jsx';
import axios from 'axios';
import { ArrowUpDown } from 'lucide-react';

export default function MaterialIndex() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editMaterial, setEditMaterial] = useState(null);
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
            const response = await axios.get('api/v1/materials', {
                params: {
                    search,
                    page: pagination.current_page,
                    per_page: pagination.per_page,
                    sort_field: sortField,
                    sort_direction: sortDirection
                }
            });

            if (response.data && response.data.data) {
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
            fetchMaterials();
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

    const handleDelete = async (materialId) => {
        if (confirm('Are you sure you want to delete this material?')) {
            try {
                const response = await axios.delete(`/admin/api/materials/${materialId}`);
                if (response.status === 200) {
                    fetchMaterials();
                    alert('Material deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting material:', error);
                alert(error.response?.data?.message || `Error deleting material ${materialId}`);
            }
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
            <Head title="Materials Management" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Input
                            type="text"
                            placeholder="Search materials..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64"
                        />
                        <Button
                            onClick={() => {
                                setEditMaterial(null);
                                setShowForm(true);
                            }}
                        >
                            Add New Material
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="name">Name</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</TableHead>
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
                                ) : !materials || materials.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                            No materials found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    materials.map((material) => (
                                        <TableRow
                                            key={material.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{material.name}</TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {material.description?.substring(0, 50)}
                                                {material.description?.length > 50 ? '...' : ''}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700"
                                                        onClick={() => {
                                                            setEditMaterial(material);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => handleDelete(material.id)}
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
                            Showing {materials.length} of {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>

                {showForm && (
                    <MaterialForm
                        material={editMaterial}
                        onClose={() => {
                            setShowForm(false);
                            setEditMaterial(null);
                        }}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditMaterial(null);
                            fetchMaterials();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
