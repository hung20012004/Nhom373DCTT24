import React, { useState, useEffect } from 'react';

const HeroBanner = ({ banners }) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentBannerIndex];

  return (
    <section
      className="relative h-[70vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image */}
      <div className="absolute inset-0 transition-all duration-500">
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          className="w-full h-full object-cover object-center"
        />
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isHovered ? 'bg-black/60' : 'bg-transparent'
          }`}
        />
      </div>

      {/* Content container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`absolute bottom-12 left-12 flex flex-col items-start text-left max-w-lg space-y-6 transition-all duration-500 transform ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <h1 className="text-white text-5xl font-bold leading-tight drop-shadow-lg">
            {currentBanner.title}
          </h1>
          <p className="text-white/90 text-lg font-light drop-shadow-sm">
            {currentBanner.subtitle}
          </p>
          <button
  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-2xl hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
  onClick={() => window.location.href = currentBanner.button_link}
>
  {currentBanner.button_text}
</button>

        </div>

        {/* Banner Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
