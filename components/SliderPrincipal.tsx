"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export const SliderPrincipal = () => {
  const videoRefDesktop = useRef<HTMLVideoElement>(null);
  const videoRefMobile = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  const slides = [
    {
      type: "image" as const,
      imageDesktop: "/baner3-desktop.png",
      imageMobile: "/baner3-mobile.png",
      title: "",
      link: ""
    },
    {
      type: "video" as const,
      videoSrcDesktop: "/video-promocional-desktop.mp4", // 2000x500 - Horizontal
      videoSrcMobile: "/video-promocional-mobile.mp4",   // 1080x1920 - Vertical con bordes
      posterDesktop: "/video-poster-desktop.png",
      posterMobile: "/video-poster-mobile.png",
      title: "",
      link: "",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Detectar si es móvil para cambiar controles
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Control del video cuando cambia de slide
  useEffect(() => {
    const currentSlide = slides[currentIndex];
    
    if (currentSlide.type === "video") {
      setCurrentVideoIndex(currentIndex);
      
      // Intentar reproducir el video correcto según el dispositivo
      const playVideo = async () => {
        try {
          if (isMobileView && videoRefMobile.current) {
            await videoRefMobile.current.play();
          } else if (!isMobileView && videoRefDesktop.current) {
            await videoRefDesktop.current.play();
          }
          setIsVideoPlaying(true);
        } catch (error) {
          console.log("Autoplay bloqueado o error:", error);
          setIsVideoPlaying(false);
        }
      };
      
      playVideo();
    } else {
      // Pausar ambos videos cuando no está visible
      if (videoRefDesktop.current) {
        videoRefDesktop.current.pause();
        videoRefDesktop.current.currentTime = 0;
      }
      if (videoRefMobile.current) {
        videoRefMobile.current.pause();
        videoRefMobile.current.currentTime = 0;
      }
      setIsVideoPlaying(false);
      setCurrentVideoIndex(null);
    }
  }, [currentIndex, isMobileView]);

  // Auto-avance de slides
  useEffect(() => {
    const currentSlide = slides[currentIndex];
    
    if (currentSlide.type === "video") {
      const currentVideoRef = isMobileView ? videoRefMobile.current : videoRefDesktop.current;
      
      if (currentVideoRef) {
        const handleVideoEnd = () => {
          nextSlide();
        };
        
        currentVideoRef.addEventListener('ended', handleVideoEnd);
        
        return () => {
          currentVideoRef.removeEventListener('ended', handleVideoEnd);
        };
      }
    } else {
      // Para imágenes, usar intervalo
      const interval = setInterval(() => {
        nextSlide();
      }, 7000);
      
      return () => clearInterval(interval);
    }
  }, [currentIndex, isMobileView]);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const nextIndex = (prev + 1) % slides.length;
      
      // Resetear ambos videos si el próximo slide es video
      if (slides[nextIndex].type === "video") {
        if (videoRefDesktop.current) videoRefDesktop.current.currentTime = 0;
        if (videoRefMobile.current) videoRefMobile.current.currentTime = 0;
      }
      
      return nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const prevIndex = (prev - 1 + slides.length) % slides.length;
      
      // Resetear ambos videos si el slide anterior es video
      if (slides[prevIndex].type === "video") {
        if (videoRefDesktop.current) videoRefDesktop.current.currentTime = 0;
        if (videoRefMobile.current) videoRefMobile.current.currentTime = 0;
      }
      
      return prevIndex;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null) {
      const swipeDistance = touchStart - touchEnd;
      const minSwipeDistance = 50;
      
      if (swipeDistance > minSwipeDistance) {
        nextSlide();
      }
      if (swipeDistance < -minSwipeDistance) {
        prevSlide();
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToSlide = (index: number) => {
    // Pausar ambos videos si el slide actual es video
    if (slides[currentIndex].type === "video") {
      if (videoRefDesktop.current) videoRefDesktop.current.pause();
      if (videoRefMobile.current) videoRefMobile.current.pause();
    }
    
    // Resetear ambos videos si el slide destino es video
    if (slides[index].type === "video") {
      if (videoRefDesktop.current) videoRefDesktop.current.currentTime = 0;
      if (videoRefMobile.current) videoRefMobile.current.currentTime = 0;
    }
    
    setCurrentIndex(index);
  };

  // Función para reproducir/pausar video manualmente
  const toggleVideoPlay = () => {
    if (isMobileView && videoRefMobile.current) {
      if (videoRefMobile.current.paused) {
        videoRefMobile.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRefMobile.current.pause();
        setIsVideoPlaying(false);
      }
    } else if (!isMobileView && videoRefDesktop.current) {
      if (videoRefDesktop.current.paused) {
        videoRefDesktop.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRefDesktop.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  return (
    <div className="relative w-full mx-auto overflow-hidden shadow-lg">
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
            className="min-w-full shrink-0 h-[320px] sm:h-[450px] md:h-[500px] relative group"
            style={{ maxHeight: "80vh" }}
          >
            {slide.type === "image" ? (
              <>
                {/* Imagen Desktop */}
                <div
                  className="hidden md:block w-full h-full bg-cover bg-center absolute inset-0"
                  style={{
                    backgroundImage: `url(${slide.imageDesktop})`,
                  }}
                ></div>

                {/* Imagen Mobile */}
                <div
                  className="block md:hidden w-full h-full bg-cover bg-center absolute inset-0"
                  style={{
                    backgroundImage: `url(${slide.imageMobile})`,
                  }}
                ></div>

                {/* Overlay para imágenes */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10"></div>
              </>
            ) : (
              <>
                {/* Video Desktop (2000x500) - Mostrar completo */}
                {index === currentIndex ? (
                  <>
                    {/* Desktop: Video horizontal - object-contain para ver completo */}
                    <div className="hidden md:block relative w-full h-full bg-black">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video
                          ref={videoRefDesktop}
                          className="w-full h-full object-contain"
                          poster={slide.posterDesktop}
                          muted
                          loop={false}
                          playsInline
                          preload="metadata"
                          onPlay={() => setIsVideoPlaying(true)}
                          onPause={() => setIsVideoPlaying(false)}
                        >
                          <source src={slide.videoSrcDesktop} type="video/mp4" />
                          Tu navegador no soporta videos.
                        </video>
                      </div>
                      
                      {/* Overlay para desktop */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30"></div>
                    </div>
                    
                    {/* Mobile: Video vertical (1080x1920) - Recortar bordes */}
                    <div className="block md:hidden relative w-full h-full bg-black overflow-hidden">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video
                          ref={videoRefMobile}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            // Ajusta este valor según necesites
                            // Valores posibles: 'center 10%', 'center 20%', 'center 30%', etc.
                            objectPosition: 'center 45%', // Para subir el contenido
                          }}
                          poster={slide.posterMobile}
                          muted
                          loop={false}
                          playsInline
                          preload="metadata"
                          onPlay={() => setIsVideoPlaying(true)}
                          onPause={() => setIsVideoPlaying(false)}
                        >
                          <source src={slide.videoSrcMobile} type="video/mp4" />
                          Tu navegador no soporta videos.
                        </video>
                      </div>
                      
                      {/* Overlay más fuerte para móvil para mejor contraste */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
                    </div>
                    
                    {/* Controles del video */}
                    <button
                      onClick={toggleVideoPlay}
                      className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                      aria-label={isVideoPlaying ? "Pausar video" : "Reproducir video"}
                    >
                      {isVideoPlaying ? (
                        <span className="text-lg">⏸️</span>
                      ) : (
                        <span className="text-lg">▶️</span>
                      )}
                    </button>
                    
                    {/* Indicador de que es un video */}
                    <div className="absolute top-4 left-4 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      🎥 Video
                    </div>
                  </>
                ) : (
                  // Mostrar poster cuando el video no está activo
                  <>
                    {/* Poster Desktop */}
                    <div
                      className="hidden md:block w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${slide.posterDesktop})`,
                      }}
                    ></div>
                    
                    {/* Poster Mobile */}
                    <div
                      className="block md:hidden w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${slide.posterMobile})`,
                      }}
                    ></div>
                    
                    {/* Overlay y botón de play sobre poster */}
                    <div className="absolute inset-0 bg-black/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 text-white p-4 rounded-full">
                          <span className="text-2xl">▶️</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30"></div>
                  </>
                )}
              </>
            )}

            {/* Contenido superpuesto (títulos y botones) - Ajustado para videos */}
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10 md:p-16 z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg max-w-2xl">
                {slide.title}
              </h2>
              {slide.link && (
                <Link
                  href={slide.link}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                >
                  Ver {slide.title}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botones navegación */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all z-20 opacity-0 group-hover:opacity-100 md:opacity-100"
        onClick={prevSlide}
        aria-label="Slide anterior"
      >
        <span className="text-xl">❮</span>
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all z-20 opacity-0 group-hover:opacity-100 md:opacity-100"
        onClick={nextSlide}
        aria-label="Slide siguiente"
      >
        <span className="text-xl">❯</span>
      </button>

      {/* Indicadores de slides */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((slide, index) => (
          <button
            key={index}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
              index === currentIndex 
                ? "bg-orange-500 scale-125" 
                : "bg-gray-300 hover:bg-gray-400"
            } ${slide.type === "video" ? "ring-1 ring-white/50" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir al slide ${index + 1}: ${slide.title}`}
            title={slide.title}
          >
            {slide.type === "video" && index !== currentIndex && (
              <span className="text-[10px] leading-none">🎥</span>
            )}
          </button>
        ))}
      </div>

      {/* Contador de slides */}
      <div className="absolute bottom-4 right-4 sm:right-6 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
        <span className="font-bold">{currentIndex + 1}</span>
        <span className="mx-1">/</span>
        <span>{slides.length}</span>
      </div>

      {/* Indicador de video activo */}
      {slides[currentIndex].type === "video" && isVideoPlaying && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Reproduciendo
        </div>
      )}
    </div>
  );
};
