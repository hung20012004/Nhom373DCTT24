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
import InventoryCheckForm from './InventoryCheckForm.jsx';
import axios from 'axios';
import { ArrowUpDown, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Index() {
    const [inventoryChecks, setInventoryChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [creatorFilter, setCreatorFilter] = useState('all');
    const [creators, setCreators] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editInventoryCheck, setEditInventoryCheck] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState('check_date');
    const [sortDirection, setSortDirection] = useState('desc');

    const statusLabels = {
        'draft': 'Nháp',
        'completed': 'Hoàn thành'
    };

    const statusClasses = {
        'draft': 'bg-gray-100 text-gray-800',
        'completed': 'bg-green-100 text-green-800'
    };

    const fetchCreators = async () => {
        try {
            const response = await axios.get('/admin/users');
            if (response.data && response.data.data) {
                setCreators(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách người tạo:', error);
        }
    };

    const fetchInventoryChecks = async () => {
        try {
            setLoading(true);
            // Tạo đối tượng params và chỉ thêm các tham số có giá trị
            const params = {};

            // Chỉ thêm search nếu không rỗng
            if (search && search.trim() !== '') {
                params.search = search.trim();
            }

            // Chỉ thêm status nếu không phải 'all'
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            // Chỉ thêm create_by nếu không phải 'all'
            if (creatorFilter !== 'all') {
                params.create_by = creatorFilter;
            }

            // Chỉ thêm from_date nếu có giá trị
            if (fromDate) {
                params.from_date = fromDate;
            }

            // Chỉ thêm to_date nếu có giá trị
            if (toDate) {
                params.to_date = toDate;
            }

            // Luôn thêm các tham số phân trang và sắp xếp
            params.page = pagination.current_page;
            params.per_page = pagination.per_page;
            params.sort_field = sortField;
            params.sort_direction = sortDirection;

            const response = await axios.get('/api/v1/inventory-checks', { params });

            if (response.data && response.data.data) {
                setInventoryChecks(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    last_page: response.data.data.last_page
                });
            } console.log('Danh sách kiểm kê kho:', inventoryChecks);
        } catch (error) {
            console.error('Lỗi khi tải kiểm kê kho:', error);
            setInventoryChecks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreators();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchInventoryChecks();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, creatorFilter, fromDate, toDate, pagination.current_page, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = async (checkId) => {
        if (confirm('Bạn có chắc chắn muốn xóa phiếu kiểm kê này không?')) {
            try {
                const response = await axios.delete(`/admin/inventory-checks/${checkId}`);
                if (response.data.status === 'success') {
                    fetchInventoryChecks();
                    alert('Phiếu kiểm kê đã được xóa thành công');
                }
            } catch (error) {
                console.error('Lỗi khi xóa phiếu kiểm kê:', error);
                alert(error.response?.data?.message || `Lỗi khi xóa phiếu kiểm kê ${checkId}`);
            }
        }
    };

    const handleStatusChange = async (checkId, newStatus) => {
        try {
            const response = await axios.put(`/admin/inventory-checks/${checkId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchInventoryChecks();
                alert('Trạng thái phiếu kiểm kê đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái phiếu kiểm kê:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái phiếu kiểm kê');
        }
    };

    const breadcrumbItems = [
        { label: 'Kiểm kê kho', href: '/admin/inventory-checks' }
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

    const calculateDifferenceCount = (check) => {
        if (!check.details || check.details.length === 0) return 0;
        return check.details.filter(detail => detail.difference !== 0).length;
    };

    return (
        <AdminLayout>
            <Head title="Quản lý kiểm kê kho" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Kiểm kê kho</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm phiếu kiểm kê..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64"
                            />
                        <Button
                            onClick={() => {
                                setEditInventoryCheck(null);
                                setShowForm(true);
                            }}
                        >
                            Thêm phiếu kiểm kê mới
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="draft">Nháp</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Lọc theo người tạo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả người tạo</SelectItem>
                                    {creators.map(creator => (
                                        <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                                    ))}
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
                                    <SortableHeader field="check_id">Mã phiếu</SortableHeader>
                                    <SortableHeader field="create_by">Người tạo</SortableHeader>
                                    <SortableHeader field="check_date">Ngày kiểm kê</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số sản phẩm</TableHead>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số sp chênh lệch</TableHead>
                                    <SortableHeader field="status">Trạng thái</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : !inventoryChecks || inventoryChecks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                                            Không có phiếu kiểm kê nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inventoryChecks.map((check) => (
                                        <TableRow
                                            key={check.check_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                #{check.check_id}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {check.created_by_user?.name   || 'Không xác định'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatDate(check.check_date)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {check.details?.length || 0}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {calculateDifferenceCount(check)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[check.status]}`}>
                                                    {statusLabels[check.status] || check.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700"
                                                        onClick={() => window.location.href = `/admin/inventory-checks/${check.check_id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {check.status === 'draft' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-amber-600 hover:text-amber-700"
                                                                onClick={() => {
                                                                    setEditInventoryCheck(check);
                                                                    setShowForm(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                                onClick={() => handleDelete(check.check_id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {check.status === 'draft' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleStatusChange(check.check_id, 'completed')}
                                                        >
                                                            Hoàn thành
                                                        </Button>
                                                    )}
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
                            Hiển thị {inventoryChecks.length} trên {pagination.total} phiếu kiểm kê
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>

                {showForm && (
                    <InventoryCheckForm
                        inventoryCheck={editInventoryCheck}
                        onClose={() => {
                            setShowForm(false);
                            setEditInventoryCheck(null);
                        }}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditInventoryCheck(null);
                            fetchInventoryChecks();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
