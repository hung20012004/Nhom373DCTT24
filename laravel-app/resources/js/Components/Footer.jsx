import React from 'react';
import { Link } from '@inertiajs/react';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Giới thiệu */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Về chúng tôi</h3>
            <p className="text-gray-400">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với sản phẩm chất lượng và dịch vụ tận tâm.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Dịch vụ khách hàng */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Chăm sóc khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition">
                  Thông tin vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-white transition">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ & Mạng xã hội */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Mail className="h-6 w-6" />
              </a>
            </div>
            <div className="text-gray-400">
              <p>Email: contact@example.com</p>
              <p>Hotline: (123) 456-7890</p>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} StyleHub. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
