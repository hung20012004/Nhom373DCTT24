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
    const [sanPham, setSanPham] = useState([]);
    const [dangTai, setDangTai] = useState(true);
    const [timKiem, setTimKiem] = useState('');
    const [hienThiBieuMau, setHienThiBieuMau] = useState(false);
    const [suaSanPham, setSuaSanPham] = useState(null);
    const [phanTrang, setPhanTrang] = useState({
        trang_hien_tai: 1,
        so_luong_moi_trang: 10,
        tong_so: 0,
        trang_cuoi: 1
    });
    const [truongSapXep, setTruongSapXep] = useState('name');
    const [huongSapXep, setHuongSapXep] = useState('asc');
    console.log('suaSanPham trong Index:', suaSanPham);

    const layDanhSachSanPham = async () => {
        try {
            setDangTai(true);
            const response = await axios.get('/api/v1/products', {
                params: {
                    search: timKiem,
                    page: phanTrang.trang_hien_tai,
                    per_page: phanTrang.so_luong_moi_trang,
                    sort_field: truongSapXep,
                    sort_direction: huongSapXep,
                    with: 'variants.color,variants.size,category, material, tag'
                }
            });

            if (response.data && response.data.data) {
                setSanPham(response.data.data);
                setPhanTrang({
                    trang_hien_tai: response.data.current_page,
                    so_luong_moi_trang: response.data.per_page,
                    tong_so: response.data.total,
                    trang_cuoi: response.data.last_page
                });
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            setSanPham([]);
        } finally {
            setDangTai(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            layDanhSachSanPham();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [timKiem, phanTrang.trang_hien_tai, truongSapXep, huongSapXep]);

    const xuLySapXep = (truong) => {
        if (truongSapXep === truong) {
            setHuongSapXep(huongSapXep === 'asc' ? 'desc' : 'asc');
        } else {
            setTruongSapXep(truong);
            setHuongSapXep('asc');
        }
    };

    const xuLyXoa = async (sanPhamId) => {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
            try {
                await axios.delete(`/admin/products/${sanPhamId}`);
                layDanhSachSanPham();
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
            }
        }
    };

    const cacMucBreadcrumb = [
        { label: 'Sản phẩm', href: '/admin/products' }
    ];

    const hienThiPhanTrang = () => {
        const trang = [];
        for (let i = 1; i <= phanTrang.trang_cuoi; i++) {
            trang.push(
                <Button
                    key={i}
                    variant={phanTrang.trang_hien_tai === i ? "default" : "outline"}
                    className="w-10 h-10"
                    onClick={() => setPhanTrang(prev => ({ ...prev, trang_hien_tai: i }))}
                >
                    {i}
                </Button>
            );
        }
        return trang;
    };

    const TieuDeSapXep = ({ truong, children }) => (
        <TableHead
            className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => xuLySapXep(truong)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <ArrowUpDown className="w-4 h-4" />
            </div>
        </TableHead>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <AdminLayout>
            <Head title="Quản lý Sản phẩm" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={cacMucBreadcrumb} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={timKiem}
                            onChange={(e) => setTimKiem(e.target.value)}
                            className="w-full sm:w-64"
                        />
                        <Button
                            onClick={() => {
                                setSuaSanPham(null);
                                setHienThiBieuMau(true);
                            }}
                        >
                            Thêm sản phẩm mới
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TieuDeSapXep truong="id">ID</TieuDeSapXep>
                                    <TieuDeSapXep truong="brand">Thương Hiệu</TieuDeSapXep>
                                    <TieuDeSapXep truong="name">Tên</TieuDeSapXep>
                                    <TieuDeSapXep truong="category">Danh Mục</TieuDeSapXep>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Biến Thể
                                    </TableHead>
                                    <TieuDeSapXep truong="price">Giá</TieuDeSapXep>
                                    <TieuDeSapXep truong="stock_quantity">Tồn Kho</TieuDeSapXep>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dangTai ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : !sanPham || sanPham.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                            Không tìm thấy sản phẩm
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sanPham.map((sanPham) => (
                                        <TableRow
                                            key={sanPham.product_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{sanPham.product_id}</TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{sanPham.brand}</TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">{sanPham.name}</TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {sanPham.category?.name || 'Chưa phân loại'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <VariantDisplay variants={sanPham.variants} />
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatCurrency(sanPham.price)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    sanPham.stock_quantity > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : sanPham.stock_quantity > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {sanPham.stock_quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700"
                                                        onClick={() => {
                                                            setSuaSanPham(sanPham);
                                                            setHienThiBieuMau(true);
                                                        }}
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => xuLyXoa(sanPham.product_id)}
                                                    >
                                                        Xóa
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
                            Hiển thị {sanPham.length} trong tổng số {phanTrang.tong_so} kết quả
                        </div>
                        <div className="flex gap-2">
                            {hienThiPhanTrang()}
                        </div>
                    </div>
                </div>

                {hienThiBieuMau && (
                    <ProductForm
                        product={suaSanPham}
                        onClose={() => {
                            setHienThiBieuMau(false);
                            setSuaSanPham(null);
                        }}
                        onSuccess={() => {
                            setHienThiBieuMau(false);
                            setSuaSanPham(null);
                            layDanhSachSanPham();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
