import React, { useState, useEffect } from 'react';
import VariantDisplay from './VariantDisplay';
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
import ProductForm from './ProductForm';
import Breadcrumb from '@/Components/Breadcrumb';
import axios from 'axios';
import { ArrowUpDown } from 'lucide-react';

export default function Index() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    console.log('editProduct in Index:', editProduct);
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/products', {
                params: {
                    search,
                    page: pagination.current_page,
                    per_page: pagination.per_page,
                    sort_field: sortField,
                    sort_direction: sortDirection,
                    with: 'variants.color,variants.size,category, material, tag'
                }
            });

            if (response.data && response.data.data) {
                setProducts(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    per_page: response.data.per_page,
                    total: response.data.total,
                    last_page: response.data.last_page
                });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
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

    const handleDelete = async (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/admin/api/products/${productId}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const breadcrumbItems = [
        { label: 'Products', href: '/admin/api/products' }
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
            <Head title="Products Management" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64"
                        />
                        <Button
                            onClick={() => {
                                setEditProduct(null);
                                setShowForm(true);
                            }}
                        >
                            Add New Product
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="id">ID</SortableHeader>
                                    <SortableHeader field="brand">Brand</SortableHeader>
                                    <SortableHeader field="name">Name</SortableHeader>
                                    <SortableHeader field="category">Category</SortableHeader>
                                    <SortableHeader field="category">Material</SortableHeader>
                                    <SortableHeader field="category">Tag</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Variants
                                    </TableHead>
                                    <SortableHeader field="price">Price</SortableHeader>
                                    <SortableHeader field="stock_quantity">Stock</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
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
                                ) : !products || products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow
                                            key={product.product_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{product.product_id}</TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{product.brand}</TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{product.name}</TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {product.category?.name || 'Uncategorized'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {product.material?.name || 'Unknown material'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {product.tag?.name || 'Unknown material'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <VariantDisplay variants={product.variants} />
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                ${product.price.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    product.stock_quantity > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : product.stock_quantity > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.stock_quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700"
                                                        onClick={() => {
                                                            setEditProduct(product);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => handleDelete(product.product_id)}
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
                            Showing {products.length} of {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>

                {showForm && (
                    <ProductForm
                        product={editProduct}
                        onClose={() => {
                            setShowForm(false);
                            setEditProduct(null);
                        }}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditProduct(null);
                            fetchProducts();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
