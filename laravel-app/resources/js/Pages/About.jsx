import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Layout from '@/Layouts/Layout';
import { Link } from '@inertiajs/react';
import { Users, Award, Heart, Clock } from 'lucide-react';
import { Head } from '@inertiajs/react';

const About = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Layout>
      <Head title="Về chúng tôi" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Phần Giới Thiệu */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Về cửa hàng của chúng tôi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với sản phẩm chất lượng và dịch vụ khách hàng xuất sắc.
          </p>
        </div>

        {/* Giá Trị Cốt Lõi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Khách hàng là trên hết</h3>
            <p className="text-gray-600">Chúng tôi luôn đặt khách hàng làm trọng tâm trong mọi hoạt động</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Đặt chất lượng lên hàng đầu</h3>
            <p className="text-gray-600">Chỉ những sản phẩm tốt nhất mới có mặt trong cửa hàng của chúng tôi</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Heart className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tận tâm</h3>
            <p className="text-gray-600">Chúng tôi luôn tận tâm mang đến sự hoàn hảo</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Giao hàng nhanh chóng</h3>
            <p className="text-gray-600">Dịch vụ vận chuyển nhanh chóng và đáng tin cậy</p>
          </div>
        </div>

        {/* Câu Chuyện Của Chúng Tôi */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Câu chuyện của chúng tôi</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 mb-4">
              Thành lập vào năm 2020, chúng tôi bắt đầu với một sứ mệnh đơn giản: mang đến sản phẩm chất lượng cho mọi người.
              Từ một cửa hàng trực tuyến nhỏ, chúng tôi đã phát triển thành một địa chỉ mua sắm đáng tin cậy cho hàng ngàn khách hàng.
            </p>
            <p className="text-gray-600 mb-4">
              Đội ngũ chuyên gia của chúng tôi không ngừng tìm kiếm những sản phẩm tốt nhất, đàm phán giá cả tốt nhất
              và đảm bảo rằng mỗi khách hàng có một trải nghiệm mua sắm tuyệt vời.
            </p>
            <p className="text-gray-600">
              Ngày nay, chúng tôi tiếp tục phát triển và đổi mới, luôn giữ vững giá trị cốt lõi và cam kết làm hài lòng khách hàng.
            </p>
          </div>
        </div>

        {/* Kêu Gọi Hành Động */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Bắt đầu mua sắm ngay hôm nay</h2>
          <p className="text-gray-600 mb-6">
            Hãy tham gia cùng hàng ngàn khách hàng hài lòng và trải nghiệm sản phẩm và dịch vụ của chúng tôi.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>

      {/* Nút Cuộn Lên Đầu Trang */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full shadow-lg transition-all duration-300 hover:bg-white"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </Layout>
  );
};

export default About;
