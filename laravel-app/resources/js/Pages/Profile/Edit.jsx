import React from 'react';
import Layout from '@/Layouts/Layout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, user }) {
    return (
        <Layout>
            <Head title="Hồ Sơ Cá Nhân" />
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        Thông tin cá nhân
                    </h1>
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                user={user}
                                className="p-6 md:p-8"
                                translations={{
                                    title: "Thông Tin Cá Nhân",
                                    description: "Cập nhật thông tin cá nhân của bạn.",
                                    nameLabel: "Tên",
                                    emailLabel: "Địa Chỉ Email",
                                    saveButton: "Lưu Thay Đổi"
                                }}
                            />
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                            <UpdatePasswordForm
                                className="p-6 md:p-8"
                                translations={{
                                    title: "Cập Nhật Mật Khẩu",
                                    description: "Đảm bảo tài khoản của bạn an toàn bằng mật khẩu mạnh.",
                                    currentPasswordLabel: "Mật Khẩu Hiện Tại",
                                    newPasswordLabel: "Mật Khẩu Mới",
                                    confirmPasswordLabel: "Xác Nhận Mật Khẩu Mới",
                                    saveButton: "Đổi Mật Khẩu"
                                }}
                            />
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out border-2 border-red-100">
                            <DeleteUserForm
                                className="p-6 md:p-8"
                                translations={{
                                    title: "Xóa Tài Khoản",
                                    description: "Một khi tài khoản bị xóa, tất cả dữ liệu sẽ bị mất vĩnh viễn.",
                                    passwordLabel: "Mật Khẩu",
                                    deleteButton: "Xóa Tài Khoản"
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
