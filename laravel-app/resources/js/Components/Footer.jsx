import React from 'react';
import { Link } from '@inertiajs/react';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">About Us</h3>
            <p className="text-gray-400">
              We are dedicated to providing the best shopping experience for our customers with quality products and excellent service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-white transition">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Connect With Us</h3>
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
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} StyleHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
