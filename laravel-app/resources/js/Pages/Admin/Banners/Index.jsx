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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import Breadcrumb from '@/Components/Breadcrumb';
import BannerForm from './BannerForm.jsx';
import axios from 'axios';
import { ArrowUpDown, Eye, Edit, Trash2, Calendar, Power } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/Components/ui/switch';

export default function Index() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editBanner, setEditBanner] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState('order_sequence');
    const [sortDirection, setSortDirection] = useState('asc');

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const params = {};

            if (search && search.trim() !== '') {
                params.search = search.trim();
            }

            if (statusFilter !== 'all') {
                params.is_active = statusFilter === 'active' ? 1 : 0;
            }

            if (fromDate) {
                params.from_date = fromDate;
            }

            if (toDate) {
                params.to_date = toDate;
            }

            params.page = pagination.current_page;
            params.per_page = pagination.per_page;
            params.sort_field = sortField;
            params.sort_direction = sortDirection;

            const response = await axios.get('/api/v1/banners', { params });

            if (response.data && response.data.data) {
                setBanners(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    last_page: response.data.data.last_page
                });
            }
            console.log('Banners:', response.data.data.data);
        } catch (error) {
            console.error('Lỗi khi tải banner:', error);
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBanners();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, fromDate, toDate, pagination.current_page, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = async (bannerId) => {
        if (confirm('Bạn có chắc chắn muốn xóa banner này không?')) {
            try {
                const response = await axios.delete(`/admin/banners/${bannerId}`);
                if (response.data.status === 'success') {
                    fetchBanners();
                    alert('Banner đã được xóa thành công');
                }
            } catch (error) {
                console.error('Lỗi khi xóa banner:', error);
                alert(error.response?.data?.message || `Lỗi khi xóa banner ${bannerId}`);
            }
        }
    };

    const handleToggleStatus = async (bannerId, currentStatus) => {
        try {
            const response = await axios.put(`/admin/banners/${bannerId}/toggle-status`, {
                is_active: !currentStatus
            });

            if (response.data.status === 'success') {
                fetchBanners();
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái banner:', error);
            alert(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái banner');
        }
    };

    const breadcrumbItems = [
        { label: 'Banners', href: '/admin/banners' }
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    return (
        <AdminLayout>
            <Head title="Quản lý Banner" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Banner</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button
                            onClick={() => {
                                setEditBanner(null);
                                setShowForm(true);
                            }}
                        >
                            Thêm banner mới
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo tiêu đề..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="active">Đang hoạt động</SelectItem>
                                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full"
                                    placeholder="Từ ngày"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full"
                                    placeholder="Đến ngày"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="id">ID</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</TableHead>
                                    <SortableHeader field="title">Tiêu đề</SortableHeader>
                                    <SortableHeader field="order_sequence">Thứ tự</SortableHeader>
                                    <SortableHeader field="start_date">Ngày bắt đầu</SortableHeader>
                                    <SortableHeader field="end_date">Ngày kết thúc</SortableHeader>
                                    <SortableHeader field="is_active">Trạng thái</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : !banners || banners.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                                            Không có banner nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    banners.map((banner) => (
                                        <TableRow
                                            key={banner.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                #{banner.id}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {banner.image_url && (
                                                    <img
                                                        src={banner.image_url}
                                                        alt={banner.title}
                                                        className="h-16 w-auto object-cover rounded"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="font-medium">{banner.title}</div>
                                                <div className="text-gray-500 text-xs mt-1">{banner.subtitle}</div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {banner.order_sequence}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatDate(banner.start_date)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatDate(banner.end_date)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <Switch
                                                    checked={banner.is_active}
                                                    onCheckedChange={() => handleToggleStatus(banner.id, banner.is_active)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-amber-600 hover:text-amber-700"
                                                        onClick={() => {
                                                            setEditBanner(banner);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                        onClick={() => handleDelete(banner.id)}
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
                    </div>

                    <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                            Hiển thị {banners.length} trên {pagination.total} banner
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>

                {showForm && (
                    <BannerForm
                        banner={editBanner}
                        onClose={() => {
                            setShowForm(false);
                            setEditBanner(null);
                        }}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditBanner(null);
                            fetchBanners();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
