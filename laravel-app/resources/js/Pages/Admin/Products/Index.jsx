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
import ProductForm from './ProductForm';
import axios from 'axios';

export default function Index() {
    const [products, setProducts] = useState([]);  // Initialize as empty array instead of undefined
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Fetching products...');
            const response = await axios.get('/admin/products', {
                params: { search }
            });
            console.log('API Response:', response);
            if (response.data && response.data.data) {
                setProducts(response.data.data);
            } else {
                console.error('Invalid response format:', response.data);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            console.error('Error details:', error.response?.data);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const handleDelete = async (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/api/admin/products/${productId}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <AdminLayout>
            <Head title="Products Management" />

            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Products</h1>
                    <Button onClick={() => {
                        setEditProduct(null);
                        setShowForm(true);
                    }}>
                        Add New Product
                    </Button>
                </div>

                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Brand</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                            </TableRow>
                        ) : !products || products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No products found</TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.product_id}>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell>{product.category?.name}</TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>{product.stock_quantity}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setEditProduct(product);
                                                    setShowForm(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
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
