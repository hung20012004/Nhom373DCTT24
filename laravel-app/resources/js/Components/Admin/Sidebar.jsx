import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    FileText,
    Settings,
    ChevronLeft,
    Menu
} from 'lucide-react';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
        { title: 'Người dùng', icon: <Users size={20} />, path: '/admin/users' },
        { title: 'Sản phẩm', icon: <ShoppingCart size={20} />, path: '/admin/products' },
        { title: 'Báo cáo', icon: <FileText size={20} />, path: '/admin/reports' },
        { title: 'Cài đặt', icon: <Settings size={20} />, path: '/admin/settings' },
    ];

    return (
        <div className={`min-h-screen bg-gray-800 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                {!collapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-gray-700"
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-700 transition-colors"
                    >
                        <span>{item.icon}</span>
                        {!collapsed && <span>{item.title}</span>}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
