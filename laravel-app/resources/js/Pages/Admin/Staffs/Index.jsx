import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import Breadcrumb from "@/Components/Breadcrumb";
import StaffForm from "./StaffForm";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

export default function Index() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/admin/users", {
                params: {
                    search,
                    role_id: selectedRole || undefined,
                    page: pagination.current_page,
                    per_page: pagination.per_page,
                    sort_field: sortField,
                    sort_direction: sortDirection,
                },
            });

            if (response.data && response.data.data) {
                setUsers(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    per_page: response.data.per_page,
                    total: response.data.total,
                    last_page: response.data.last_page,
                });
                if (response.data.roles) {
                    setRoles(response.data.roles);
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [
        search,
        pagination.current_page,
        sortField,
        sortDirection,
        selectedRole,
    ]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleDelete = async (userId) => {
        if (confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) {
            try {
                const response = await axios.delete(`/admin/users/${userId}`);
                if (response.status === 200) {
                    fetchUsers();
                    alert("Nhân viên đã được xóa thành công");
                }
            } catch (error) {
                console.error("Lỗi khi xóa nhân viên:", error);
                alert(
                    error.response?.data?.message ||
                        `Lỗi khi xóa nhân viên ${userId}`
                );
            }
        }
    };

    const breadcrumbItems = [
        { label: "Quản lý nhân viên", href: "/admin/users" },
    ];

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.last_page; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={
                        pagination.current_page === i ? "default" : "outline"
                    }
                    className="w-10 h-10"
                    onClick={() =>
                        setPagination((prev) => ({ ...prev, current_page: i }))
                    }
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
            <Head title="Quản lý nhân viên" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý nhân viên
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm nhân viên..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64"
                            />
                            <select
                                value={selectedRole}
                                onChange={(e) =>
                                    setSelectedRole(e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Tất cả vai trò</option>
                                {roles.map((role) => (
                                    <option
                                        key={role.role_id}
                                        value={role.role_id}
                                    >
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            onClick={() => {
                                setEditUser(null);
                                setShowForm(true);
                            }}
                        >
                            Thêm nhân viên mới
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="id">
                                        ID
                                    </SortableHeader>
                                    <SortableHeader field="name">
                                        Tên
                                    </SortableHeader>
                                    <SortableHeader field="email">
                                        Email
                                    </SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chức vụ
                                    </TableHead>
                                    <SortableHeader field="is_active">
                                        Trạng thái
                                    </SortableHeader>
                                    <SortableHeader field="last_login">
                                        Đăng nhập lần cuối
                                    </SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : !users || users.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4 text-gray-500"
                                        >
                                            Không có nhân viên nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {user.id}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div>
                                                    <p className="font-medium">
                                                        {user.name}
                                                    </p>
                                                    {user.profile &&
                                                        user.profile
                                                            .full_name && (
                                                            <p className="text-gray-500 text-xs">
                                                                {
                                                                    user.profile
                                                                        .full_name
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {user.role ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {user.role.name}
                                                    </span>
                                                ) : (
                                                    "Chưa phân quyền"
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {user.is_active
                                                        ? "Hoạt động"
                                                        : "Tạm khóa"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {user.last_login
                                                    ? format(
                                                          new Date(
                                                              user.last_login
                                                          ),
                                                          "dd/MM/yyyy HH:mm"
                                                      )
                                                    : "Chưa đăng nhập"}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700"
                                                        onClick={() => {
                                                            setEditUser(user);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Chỉnh sửa
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
                            Hiển thị {users.length} trên {pagination.total} nhân
                            viên
                        </div>
                        <div className="flex gap-2">{renderPagination()}</div>
                    </div>
                </div>

                {showForm && (
                    <StaffForm
                        staff={editUser}
                        roles={roles}
                        onClose={() => {
                            setShowForm(false);
                            setEditUser(null);
                        }}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditUser(null);
                            fetchUsers();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
