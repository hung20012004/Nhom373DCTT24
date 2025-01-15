import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Bell, User, Search } from 'lucide-react';

const Header = ({ user }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 h-16">
            <div className="px-4 h-full flex items-center justify-between">
                {/* Left side - Search */}
                <div className="flex items-center flex-1">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                {/* Right side - Notifications & Profile */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="p-2 hover:bg-gray-100 rounded-full relative">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2"
                        >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                {user?.name || 'Admin'}
                            </div>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <Link
                                    href={route('profile.edit')}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Hồ sơ
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Cài đặt
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Đăng xuất
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
