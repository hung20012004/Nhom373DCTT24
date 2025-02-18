import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

const StaffForm = ({ staff, roles, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: staff?.name || '',
        email: staff?.email || '',
        username: staff?.username || '',
        password: '',
        role_id: staff?.role_id || '',
        is_active: staff?.is_active ?? true,
        profile: {
            full_name: staff?.profile?.full_name || '',
            gender: staff?.profile?.gender || '',
            date_of_birth: staff?.profile?.date_of_birth || '',
            phone: staff?.profile?.phone || '',
            avatar_url: staff?.profile?.avatar_url || '',
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = staff
                ? `/admin/api/users/${staff.id}`
                : '/admin/api/users';

            const response = await axios.post(url, formData);

            if (response.status === 200 || response.status === 201) {
                onSuccess();
                alert(staff ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {staff ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Tên hiển thị</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Tên đầy đủ</label>
                            <Input
                                value={formData.profile.full_name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    profile: {...formData.profile, full_name: e.target.value}
                                })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Tên đăng nhập</label>
                            <Input
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Mật khẩu {staff && '(để trống nếu không đổi)'}</label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required={!staff}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Vai trò</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.role_id}
                                onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                                required
                            >
                                <option value="">Chọn vai trò</option>
                                {roles.map(role => (
                                    <option key={role.role_id} value={role.role_id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit">
                            {staff ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default StaffForm;
