import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, X, ShoppingCart, User, Heart } from "lucide-react";
import Dropdown from "@/Components/Dropdown";
import { CartDialog } from "@/Components/cart/CartDialog";
import axios from "axios";
import ApplicationLogo from "@/Components/ApplicationLogo";
const Header = () => {
    const { url } = usePage();
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    // Function to check if a link is active
    const isActive = (path) => {
        if (path === "/") {
            return url === "/";
        }
        return url.startsWith(path);
    };

    // Get link classes based on active state
    const getLinkClasses = (path) => {
        const baseClasses =
            "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
        return isActive(path)
            ? `${baseClasses} border-blue-500 text-gray-900`
            : `${baseClasses} border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`;
    };

    // Get mobile link classes based on active state
    const getMobileLinkClasses = (path) => {
        const baseClasses =
            "block w-full pl-3 pr-4 py-2 border-l-4 text-base font-medium";
        return isActive(path)
            ? `${baseClasses} bg-blue-50 border-blue-500 text-blue-700`
            : `${baseClasses} border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700`;
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/api/v1/categories/featured");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const dropdownItems = [
        ...(categories || []).map(({ slug, name, products_count }) => ({
            href: `/products?category=${slug}`,
            label: name,
            count: products_count,
        })),
        {
            href: "/products",
            label: "View All Categories",
        },
    ];

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [url]);

    return (
        <nav
            className={`bg-white transition-all duration-300 ${
                isScrolled ? "fixed top-0 left-0 right-0 shadow-md z-50" : ""
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Navigation Links */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <ApplicationLogo className="h-20 w-auto fill-current text-gray-500" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/" className={getLinkClasses("/")}>
                                Home
                            </Link>
                            <Link
                                href="/products"
                                className={getLinkClasses("/products")}
                            >
                                Products
                            </Link>

                            {loading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <Dropdown
                                    trigger="Categories"
                                    items={dropdownItems}
                                />
                            )}

                            <Link
                                href="/about"
                                className={getLinkClasses("/about")}
                            >
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Right Side Buttons */}
                    <div className="flex items-center">
                        {/* Wishlist */}
                        <Link
                            href="/wishlist"
                            className={`p-2 relative ${getLinkClasses(
                                "/wishlist"
                            )}`}
                        >
                            <Heart className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                0
                            </span>
                        </Link>

                        {/* Cart */}
                        <div className="p-2">
                            <CartDialog />
                        </div>

                        {/* Desktop Authentication Menu */}
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            {auth.user ? (
                                <div className="relative ml-3">
                                    <div>
                                        <button
                                            onClick={() =>
                                                setIsUserMenuOpen(
                                                    !isUserMenuOpen
                                                )
                                            }
                                            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            <span className="mr-2">
                                                {auth.user.name}
                                            </span>
                                            <User className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* User Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Your Profile
                                            </Link>
                                            <Link
                                                href="/orders"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Your Orders
                                            </Link>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Log Out
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-x-4">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden ml-4">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                {isMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white border-b border-gray-200">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/" className={getMobileLinkClasses("/")}>
                            Home
                        </Link>

                        <Link
                            href="/products"
                            className={getMobileLinkClasses("/products")}
                        >
                            Products
                        </Link>

                        {/* Mobile Categories Menu */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsCategoryMenuOpen(!isCategoryMenuOpen)
                                }
                                className={`flex justify-between items-center w-full ${getMobileLinkClasses(
                                    "/categories"
                                )}`}
                            >
                                <span>Categories</span>
                                <svg
                                    className={`w-5 h-5 transition-transform ${
                                        isCategoryMenuOpen
                                            ? "transform rotate-180"
                                            : ""
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            {isCategoryMenuOpen && (
                                <div className="pl-4">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={`/products?category=${category.slug}`}
                                            className="block py-2 pl-3 text-gray-500 hover:text-gray-700"
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/products"
                                        className="block py-2 pl-3 text-gray-500 hover:text-gray-700"
                                    >
                                        View All Categories
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/about"
                            className={getMobileLinkClasses("/about")}
                        >
                            About
                        </Link>
                    </div>

                    {/* Mobile Authentication Menu */}
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {auth.user ? (
                            <>
                                <div className="flex items-center px-4">
                                    <div className="flex-shrink-0">
                                        <User className="h-8 w-8 rounded-full text-gray-400" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">
                                            {auth.user.name}
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">
                                            {auth.user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <Link
                                        href="/profile"
                                        className={getMobileLinkClasses(
                                            "/profile"
                                        )}
                                    >
                                        Your Profile
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className={getMobileLinkClasses(
                                            "/orders"
                                        )}
                                    >
                                        Your Orders
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className={getMobileLinkClasses(
                                            "/logout"
                                        )}
                                    >
                                        Log Out
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 space-y-1 px-2">
                                <Link
                                    href="/login"
                                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-gray-50"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
