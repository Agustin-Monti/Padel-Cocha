"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export const SliderPrincipal = () => {
  const slides = [
    {
      imageDesktop: "/baner1-desktop.jpg",
      imageMobile: "/baner1-mobile.jpg",
      title: "Marroquinería",
    },
    {
      imageDesktop: "/baner2-desktop.jpg",
      imageMobile: "/baner2-mobile.jpg",
      title: "Maquillaje",
    },
    {
      imageDesktop: "/baner3-desktop.png",
      imageMobile: "/baner3-mobile.png",
      title: "Marroquinería",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.targetTouches[0].clientX);

  const handleTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null) {
      if (touchStart - touchEnd > 50) nextSlide();
      if (touchStart - touchEnd < -50) prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="relative w-screen max-w-none mx-auto overflow-hidden rounded-lg shadow-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-full h-[320px] sm:h-[450px] md:h-[500px] relative"
            style={{
              maxHeight: "80vh",
            }}
          >
            {/* Imagen Desktop */}
            <div
              className="hidden md:block w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.imageDesktop})`,
              }}
            ></div>

            {/* Imagen Mobile */}
            <div
              className="block md:hidden w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.imageMobile})`,
              }}
            ></div>

            {/* Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10"></div>

            {/* Botón */}
            {slide.link && (
              <Link
                href={slide.link}
                className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Ver Más Sobre {slide.title}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Botones navegación */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"
        onClick={prevSlide}
      >
        ❮
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-opacity-75"
        onClick={nextSlide}
      >
        ❯
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
              index === currentIndex ? "bg-orange-500" : "bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
          ></button>
        ))}
      </div>
    </div>
  );
};

