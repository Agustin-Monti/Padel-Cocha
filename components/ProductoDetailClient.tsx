'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useFavoritos } from "@/context/FavoritosContext";
import { Heart, CheckCircle, AlertTriangle, XCircle, MessageCircle, ZoomIn, ZoomOut, Move } from "lucide-react";
import HeartBurst from "@/components/HeartBurst";
import { motion } from "framer-motion";
import Carrito from "@/components/Carrito";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from 'next/link';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  peso: number;
  descripcion: string;
  stock: number;
  galeria: { imagen_galeria: string }[];
  variantes: { id: string; nombre: string; imagen: string; color?: string }[];
  oferta_activa: boolean;
  precio_oferta: number;
  categoria_id: number;
  marca_id: number;
  tipo_id: number;
  material: string;
  capacidad: string;
  origen: string;
  talle: string;
  modelo: string;
  medidas: string;
  forma: string;
  balance: string;
  nucleo: string;
  acabado: string;
  marco: string;
  potencia: number;
  control: number;
  juego: string;
  ancho: string;
  largo: string;
  textura: string;
  color: string;
}

interface ProductoRelacionado {
  id: string;
  nombre: string;
  imagen: string;
  precio: number;
  oferta_activa: boolean;
  precio_oferta: number;
}

interface Props {
  producto: Producto;
  relacionados: ProductoRelacionado[];
}

export default function ProductoDetailClient({ producto, relacionados }: Props) {
  const [imagenPrincipal, setImagenPrincipal] = useState<string | null>(producto.imagen);
  const [isCarritoOpen, setIsCarritoOpen] = useState(false);
  const [carritoModificado, setCarritoModificado] = useState(false);
  const [openDevolucion, setOpenDevolucion] = useState(false);
  const [openGarantia, setOpenGarantia] = useState(false);
  const [showModalGaleria, setShowModalGaleria] = useState(false);
  const [categoriaNombre, setCategoriaNombre] = useState<string | null>(null);
  const [marcaNombre, setMarcaNombre] = useState<string | null>(null);
  const [talleSeleccionado, setTalleSeleccionado] = useState<string | null>(null);
  const [tallesDisponibles, setTallesDisponibles] = useState<Record<string, number>>({});
  
  // Estados para el zoom en desktop
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  // Estados para el zoom en móvil
  const [mobileZoom, setMobileZoom] = useState({
    isZoomed: false,
    scale: 1,
    translateX: 0,
    translateY: 0,
    lastTouchX: 0,
    lastTouchY: 0,
    isMoving: false
  });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const mobileImageRef = useRef<HTMLImageElement>(null);
  const scrollYRef = useRef<number>(0); // Para guardar la posición del scroll
  const router = useRouter();
  const supabase = createClient();
  const [showBurst, setShowBurst] = useState(false);

  const { esFavorito, verificarFavorito, addFavorito, removeFavorito } = useFavoritos();

  // ==================== FUNCIONES PARA BLOQUEAR/DESBLOQUEAR SCROLL MEJORADAS ====================
  
  const lockScroll = useCallback(() => {
    // Guardar la posición actual del scroll
    scrollYRef.current = window.scrollY;
    
    // Aplicar estilos para bloquear el scroll de forma suave
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Compensar la barra de scroll si es visible
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }, []);

  const unlockScroll = useCallback(() => {
    // Restaurar los estilos del body
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.paddingRight = '';
    
    // Restaurar la posición del scroll de forma suave
    if (scrollYRef.current !== undefined) {
      window.scrollTo({
        top: scrollYRef.current,
        behavior: 'instant' // Usamos 'instant' para evitar animaciones
      });
    }
  }, []);

  // ==================== EFECTOS PARA CONTROLAR EL SCROLL ====================
  
  useEffect(() => {
    if (isZoomed || showModalGaleria) {
      lockScroll();
    } else {
      // Usar setTimeout para restaurar el scroll en el siguiente ciclo
      const timer = setTimeout(() => {
        unlockScroll();
      }, 0);
      
      return () => clearTimeout(timer);
    }

    return () => {
      unlockScroll();
    };
  }, [isZoomed, showModalGaleria, lockScroll, unlockScroll]);

  // ==================== ZOOM EN DESKTOP ====================
  
  const handleDesktopMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !zoomContainerRef.current) return;
    
    const container = zoomContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    setCursorPosition({ x, y });
    
    const moveX = (x / 100) * (rect.width * (zoomLevel - 1));
    const moveY = (y / 100) * (rect.height * (zoomLevel - 1));
    
    setImagePosition({
      x: -moveX + (rect.width * (zoomLevel - 1)) / 2,
      y: -moveY + (rect.height * (zoomLevel - 1)) / 2
    });
  };

  const toggleDesktopZoom = () => {
    if (window.innerWidth >= 1024) {
      const newZoomState = !isZoomed;
      setIsZoomed(newZoomState);
      
      if (newZoomState) {
        setZoomLevel(2);
      } else {
        setImagePosition({ x: 0, y: 0 });
      }
    }
  };

  const handleDesktopWheel = (e: React.WheelEvent) => {
    if (window.innerWidth >= 1024 && isZoomed) {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const newZoom = Math.max(1.5, Math.min(4, zoomLevel + delta));
      setZoomLevel(newZoom);
    }
  };

  // ==================== ZOOM EN MÓVIL ====================
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth < 1024) {
      const touch = e.touches[0];
      setMobileZoom(prev => ({
        ...prev,
        lastTouchX: touch.clientX,
        lastTouchY: touch.clientY,
        isMoving: false
      }));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth < 1024) {
      e.preventDefault();
      
      if (e.touches.length === 1 && mobileZoom.isZoomed) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - mobileZoom.lastTouchX;
        const deltaY = touch.clientY - mobileZoom.lastTouchY;
        
        setMobileZoom(prev => ({
          ...prev,
          translateX: prev.translateX + deltaX,
          translateY: prev.translateY + deltaY,
          lastTouchX: touch.clientX,
          lastTouchY: touch.clientY,
          isMoving: true
        }));
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const baseDistance = 100;
        const scale = Math.max(1, Math.min(3, distance / baseDistance));
        
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        if (mobileImageRef.current) {
          const rect = mobileImageRef.current.getBoundingClientRect();
          const relativeX = (centerX - rect.left) / rect.width;
          const relativeY = (centerY - rect.top) / rect.height;
          
          setMobileZoom(prev => ({
            ...prev,
            scale,
            isZoomed: scale > 1.1,
            translateX: prev.translateX + (relativeX * rect.width * (1 - scale)),
            translateY: prev.translateY + (relativeY * rect.height * (1 - scale))
          }));
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (window.innerWidth < 1024) {
      if (!mobileZoom.isMoving && mobileZoom.isZoomed) {
        setMobileZoom(prev => ({
          ...prev,
          scale: 1,
          isZoomed: false,
          translateX: 0,
          translateY: 0
        }));
      }
    }
  };

  // ==================== FUNCIONES DEL PRODUCTO ====================
  
  useEffect(() => {
    const fetchCategoriaNombre = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("nombre")
        .eq("id", producto.categoria_id)
        .single();

      if (!error) {
        setCategoriaNombre(data.nombre);
      }
    };

    const fetchMarcaNombre = async () => {
      const { data, error } = await supabase
        .from("marcas")
        .select("nombre")
        .eq("id", producto.marca_id)
        .single();

      if (!error) {
        setMarcaNombre(data.nombre);
      }
    };

    fetchCategoriaNombre();
    fetchMarcaNombre();
  }, [producto.categoria_id, producto.marca_id, supabase]);

  useEffect(() => {
    verificarFavorito(producto.id);
  }, [producto.id, verificarFavorito]);

  useEffect(() => {
    if (
      (categoriaNombre?.toLowerCase() === "indumentaria" ||
       categoriaNombre?.toLowerCase() === "zapatillas") &&
      producto.talle
    ) {
      try {
        const talles = typeof producto.talle === "string" 
          ? JSON.parse(producto.talle) as Record<string, number>
          : producto.talle as Record<string, number>;

        setTallesDisponibles(talles);

        const tallesConStock = Object.entries(talles).filter(([_, stock]) => stock > 0);
        if (tallesConStock.length > 0) {
          setTalleSeleccionado(tallesConStock[0][0]);
        }
      } catch (err) {
        console.error("Error al parsear los talles:", err);
      }
    }
  }, [categoriaNombre, producto.talle]);

  const generarMensajeWhatsApp = () => {
    const mensaje = `¡Hola! Estoy interesado/a en el producto:\n\n` +
      `*${producto.nombre}*\n` +
      (marcaNombre ? `Marca: ${marcaNombre}\n` : '') +
      (producto.oferta_activa ? 
        `Precio: $${producto.precio_oferta.toLocaleString()} (Oferta)\n` : 
        `Precio: $${producto.precio.toLocaleString()}\n`) +
      `\nQuería consultar:\n` +
      `✅ Disponibilidad del producto\n` +
      (categoriaNombre?.toLowerCase() === "indumentaria" || 
       categoriaNombre?.toLowerCase() === "zapatillas" ? 
       `✅ Talle: ${talleSeleccionado || 'por consultar'}\n` : '') +
      `✅ Opciones de envío y pago\n` +
      `\nPodrías darme más información? Gracias!`;
    
    return encodeURIComponent(mensaje);
  };

  const handleWhatsAppClick = () => {
    const mensaje = generarMensajeWhatsApp();
    const url = `https://wa.me/5493445532916?text=${mensaje}`;
    window.open(url, '_blank');
  };

  const handleToggleFavorito = async () => {
    if (!esFavorito(producto.id)) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }

    if (esFavorito(producto.id)) {
      await removeFavorito(producto.id);
    } else {
      await addFavorito(producto.id);
    }
  };

  const calcularDescuento = (precioOriginal: number, precioOferta: number) =>
    Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100);

  const handleClickVariante = (id: string) => {
    router.push(`/products/${id}`);
  };

  function mapColorNameToHex(colorName: string): string {
    const mapa: Record<string, string> = {
      rojo: "#ff0000",
      azul: "#0000ff",
      verde: "#008000",
      negro: "#000000",
      blanco: "#ffffff",
      gris: "#808080",
      rosa: "#ff69b4",
      amarillo: "#ffff00",
      naranja: "#ffa500",
      marron: "#8b4513",
      beige: "#f5f5dc",
      celeste: "#87ceeb",
    };
    return mapa[colorName.toLowerCase()] || "gray";
  }

  const resetAllZoom = () => {
    setIsZoomed(false);
    setZoomLevel(2);
    setCursorPosition({ x: 50, y: 50 });
    setImagePosition({ x: 0, y: 0 });
    setMobileZoom({
      isZoomed: false,
      scale: 1,
      translateX: 0,
      translateY: 0,
      lastTouchX: 0,
      lastTouchY: 0,
      isMoving: false
    });
  };

  // ==================== COMPONENTES INTERNOS ====================
  
  const CardEspecificacion = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center text-center">
      <span className="text-sm text-gray-500 mb-1">{label}</span>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
  );

  const BarraEspecificacion = ({ label, value }: { label: string; value: number }) => {
    const porcentaje = Math.min(value * 10, 100);

    return (
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-200">
        <p className="text-sm text-gray-500 font-medium mb-2 text-center">{label}</p>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
        <p className="text-xs text-right mt-1 text-gray-600">{porcentaje}%</p>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Galería lateral desktop */}
          <div className="hidden lg:flex lg:flex-col space-y-4 w-1/6 mt-8">
            {producto.galeria.map((img, i) => (
              <div
                key={i}
                className="w-28 h-28 rounded-xl border-2 border-gray-200 shadow-md overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                onClick={() => {
                  setImagenPrincipal(img.imagen_galeria);
                  resetAllZoom();
                }}
              >
                <img 
                  src={img.imagen_galeria} 
                  alt={`Img ${i}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
              </div>
            ))}
          </div>
          
          {/* Contenedor principal de imagen - Desktop */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <div
              ref={zoomContainerRef}
              className="relative overflow-hidden rounded-lg cursor-crosshair bg-white select-none"
              onMouseMove={handleDesktopMouseMove}
              onClick={toggleDesktopZoom}
              onWheel={handleDesktopWheel}
              style={{ height: '600px' }}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Indicador de zoom */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                {isZoomed ? (
                  <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <ZoomIn size={16} />
                    <span>Zoom {zoomLevel.toFixed(1)}x</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAllZoom();
                      }}
                      className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30 transition-colors"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <ZoomIn size={16} />
                    <span>Click para zoom</span>
                  </div>
                )}
              </div>
              
              {/* Imagen con zoom */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  ref={imageRef}
                  src={imagenPrincipal || producto.imagen}
                  alt={producto.nombre}
                  className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
                  style={{
                    transform: isZoomed 
                      ? `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`
                      : 'scale(1)',
                    transformOrigin: 'center center',
                    pointerEvents: 'none'
                  }}
                  draggable="false"
                />
              </div>
              
              {/* Lente de zoom */}
              {isZoomed && (
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute w-24 h-24 border-2 border-white/70 rounded-full shadow-2xl"
                    style={{
                      left: `calc(${cursorPosition.x}% - 3rem)`,
                      top: `calc(${cursorPosition.y}% - 3rem)`,
                      boxShadow: '0 0 20px rgba(255,255,255,0.5), inset 0 0 20px rgba(255,255,255,0.3)'
                    }}
                  />
                </div>
              )}
              
              {/* Botón para abrir modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModalGaleria(true);
                }}
                className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white p-2 rounded-full transition-colors z-10 shadow-lg"
                title="Ver en pantalla completa"
              >
                <ZoomIn size={24} />
              </button>
            </div>
            
            {/* Instrucciones */}
            <div className="mt-3 text-sm text-gray-600 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <ZoomIn size={16} />
                <span>{isZoomed ? 'Rueda para ajustar zoom • Click para salir' : 'Click para activar zoom'}</span>
              </div>
            </div>
          </div>

          {/* Imagen principal - MOBILE */}
          <div className="w-full lg:hidden">
            <Slider 
              dots={true} 
              infinite={true} 
              speed={500} 
              slidesToShow={1} 
              slidesToScroll={1} 
              arrows={false}
              beforeChange={resetAllZoom}
            >
              {[producto.imagen, ...producto.galeria.map(g => g.imagen_galeria)].map((img, idx) => (
                <div key={idx} className="relative">
                  <div
                    className="touch-none overflow-hidden rounded-xl bg-white relative select-none"
                    style={{ height: '500px' }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Indicador de zoom móvil */}
                    {mobileZoom.isZoomed && (
                      <div className="absolute top-4 left-4 z-10 bg-black/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <Move size={16} />
                        <span>{mobileZoom.scale.toFixed(1)}x</span>
                        <button 
                          onClick={resetAllZoom}
                          className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30 transition-colors"
                        >
                          Salir
                        </button>
                      </div>
                    )}
                    
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        ref={mobileImageRef}
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        className="max-w-full max-h-full object-contain touch-manipulation"
                        style={{
                          transform: `translate(${mobileZoom.translateX}px, ${mobileZoom.translateY}px) scale(${mobileZoom.scale})`,
                          transition: mobileZoom.isMoving ? 'none' : 'transform 0.2s ease-out',
                          pointerEvents: 'none'
                        }}
                        draggable="false"
                      />
                    </div>
                    
                    {/* Overlay de instrucciones */}
                    {!mobileZoom.isZoomed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 pointer-events-none">
                        <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm mb-2">
                          Pellizca para hacer zoom
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowModalGaleria(true)}
                    className="absolute bottom-4 right-4 bg-black/80 text-white p-2 rounded-full shadow-lg hover:bg-black transition-colors"
                  >
                    <ZoomIn size={20} />
                  </button>
                  
                  <div className="mt-3 text-sm text-gray-600 px-2">
                    {mobileZoom.isZoomed ? (
                      <div className="flex items-center justify-center gap-2">
                        <Move size={16} />
                        <span>Desliza para moverte • Toca para salir</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <ZoomIn size={16} />
                        <span>Pellizca para zoom • Toca para pantalla completa</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          {/* Detalles del producto */}
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl text-gray-900">{producto.nombre}</h1>
              <div className="relative w-10 h-10">
                <motion.button
                  onClick={handleToggleFavorito}
                  className="p-2 rounded-full hover:bg-gray-100 transition shadow-sm w-10 h-10"
                  whileTap={{ scale: 1.4 }}
                >
                  <Heart
                    size={24}
                    className={`transition-colors ${
                      esFavorito(producto.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}
                  />
                </motion.button>
                <HeartBurst trigger={showBurst} />
              </div>
            </div>

            {/* Precio */}
            {producto.oferta_activa ? (
              <>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-xl font-bold text-gray-800">${producto.precio_oferta.toLocaleString()}</p>
                  <p className="text-sm line-through text-gray-500">${producto.precio.toLocaleString()}</p>
                  <p className="text-sm text-red-500">{calcularDescuento(producto.precio, producto.precio_oferta)}% OFF</p>
                </div>
                <p className="text-sm text-green-700 font-medium mt-1">
                  OFERTA ACTIVA
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-gray-800 mt-2">${producto.precio.toLocaleString()}</p>
                <p className="text-sm text-green-700 font-medium mt-1">
                  ${ (producto.precio * 0.90).toLocaleString('es-AR', { minimumFractionDigits: 2 }) } con transferencia
                </p>
              </>
            )}

            {/* Stock */}
            <div className="mt-4">
              {producto.stock === 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm shadow-sm">
                  <XCircle size={18} />
                  <span>Sin stock</span>
                </div>
              ) : producto.stock <= 4 ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm shadow-sm">
                  <AlertTriangle size={18} />
                  <span>Stock mínimo</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm shadow-sm">
                  <CheckCircle size={18} />
                  <span>Stock disponible</span>
                </div>
              )}
            </div>

            {/* Variantes */}
            {producto.variantes.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Colores disponibles</h2>
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                  {producto.variantes.map((variante) => {
                    const colorHex = mapColorNameToHex(variante.color || '');
                    return (
                      <div key={variante.id}>
                        <div
                          className="w-14 h-14 rounded-full cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-105 m-2"
                          onClick={() => handleClickVariante(variante.id)}
                          style={{
                            border: `3px solid ${colorHex}`,
                            boxShadow: variante.id === producto.id ? "0 0 0 2px black" : "none",
                          }}
                        >
                          <img
                            src={variante.imagen}
                            alt={variante.nombre}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Marca */}
            {marcaNombre && (
              <div className="mt-4 text-lg font-semibold text-gray-700">
                Marca: <span className="text-gray-900">{marcaNombre}</span>
              </div>
            )}

            {/* Selección de talle */}
            {(categoriaNombre?.toLowerCase() === "indumentaria" || 
              categoriaNombre?.toLowerCase() === "zapatillas") && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-800 mb-2">Consultar disponibilidad en talle:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tallesDisponibles).map(([talle, cantidad]) => (
                    <button
                      key={talle}
                      onClick={() => setTalleSeleccionado(talle)}
                      className={`
                        w-12 h-12 px-2 py-2 border text-sm font-medium
                        flex items-center justify-center
                        transition-colors duration-200
                        ${talleSeleccionado === talle ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"}
                        hover:border-gray-500
                      `}
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp */}
            <div className="mt-8">
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl">
                <div className="flex items-center mb-2">
                  <MessageCircle className="text-green-600 mr-2" size={20} />
                  <span className="text-sm font-medium text-gray-800">Consulta rápida por WhatsApp</span>
                </div>
                <p className="text-xs text-gray-600">
                  Estamos en modo catálogo. Consultá disponibilidad, talles, envíos y métodos de pago directamente con nosotros.
                </p>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3 rounded-lg text-base transition bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <MessageCircle size={22} className="mr-2" />
                Consultar disponibilidad por WhatsApp
              </button>
            </div>

            {/* Descripción */}
            <div className="mt-8">
              <div className="border-b border-gray-200">
                <button onClick={() => setOpenDevolucion(!openDevolucion)} className="w-full flex justify-between items-center py-4 text-base font-semibold text-gray-900">
                  <span>Detalles</span>
                  <span>{openDevolucion ? '-' : '+'}</span>
                </button>
                {openDevolucion && (
                  <div className="pb-4 text-gray-700 space-y-2 text-sm">
                    <p><span className="font-medium">Peso:</span> {producto.peso} kg</p>
                    <p><span className="font-medium">Descripción:</span> {producto.descripcion}</p>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <button onClick={() => setOpenGarantia(!openGarantia)} className="w-full flex justify-between items-center py-4 text-base font-semibold text-gray-900">
                  <span>Devolución</span>
                  <span>{openGarantia ? '-' : '+'}</span>
                </button>
                {openGarantia && (
                  <div className="pb-4 text-gray-700 text-sm">
                    Aceptamos devoluciones dentro de los primeros 10 días desde la entrega. El producto debe estar sin uso y en su empaque original.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Carrito isOpen={isCarritoOpen} onClose={() => setIsCarritoOpen(false)} carritoModificado={carritoModificado} />
      </div>

      {/* Modal galería */}
      {showModalGaleria && (
        <ModalGaleria
          producto={producto}
          imagenPrincipal={imagenPrincipal}
          setImagenPrincipal={setImagenPrincipal}
          onClose={() => {
            setShowModalGaleria(false);
            resetAllZoom();
          }}
        />
      )}

      {/* Especificaciones */}
      {categoriaNombre && (
        <div className="mt-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <h2 className="mx-4 text-2xl font-semibold text-center text-gray-800">
              Especificaciones
            </h2>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="rounded-xl p-4 shadow-sm text-sm text-gray-700 space-y-1">
            
            {categoriaNombre === "Indumentaria" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {producto.modelo && <CardEspecificacion label="Modelo" value={producto.modelo} />}
                {producto.origen && <CardEspecificacion label="Origen" value={producto.origen} />}
                {producto.color && <CardEspecificacion label="Color" value={producto.color} />}
                {producto.material && <CardEspecificacion label="Material" value={producto.material} />}
              </div>
            )}

            {categoriaNombre === "Zapatillas" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {producto.modelo && <CardEspecificacion label="Modelo" value={producto.modelo} />}
                {producto.origen && <CardEspecificacion label="Origen" value={producto.origen} />}
                {producto.color && <CardEspecificacion label="Color" value={producto.color} />}
                {producto.material && <CardEspecificacion label="Material" value={producto.material} />}
              </div>
            )}

            {categoriaNombre === "Bolso" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {producto.modelo && <CardEspecificacion label="Modelo" value={producto.modelo} />}
                {producto.origen && <CardEspecificacion label="Origen" value={producto.origen} />}
                {producto.material && <CardEspecificacion label="Material" value={producto.material} />}
                {producto.capacidad && <CardEspecificacion label="Capacidad" value={producto.capacidad} />}
                {producto.medidas && <CardEspecificacion label="Medidas" value={producto.medidas} />}
              </div>
            )}

            {categoriaNombre === "Paletas" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {producto.modelo && <CardEspecificacion label="Modelo" value={producto.modelo} />}
                {producto.marco && <CardEspecificacion label="Marco" value={producto.marco} />}
                {producto.origen && <CardEspecificacion label="Origen" value={producto.origen} />}
                {producto.forma && <CardEspecificacion label="Forma" value={producto.forma} />}
                {producto.balance && <CardEspecificacion label="Balance" value={producto.balance} />}
                {producto.acabado && <CardEspecificacion label="Acabado" value={producto.acabado} />}
                {producto.nucleo && <CardEspecificacion label="Núcleo" value={producto.nucleo} />}
                {producto.juego && <CardEspecificacion label="Juego" value={producto.juego} />}
                {producto.potencia && <BarraEspecificacion label="Potencia" value={producto.potencia} />}
                {producto.control && <BarraEspecificacion label="Control" value={producto.control} />}
              </div>
            )}

            {categoriaNombre === "Accesorios" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {producto.origen && <CardEspecificacion label="Origen" value={producto.origen} />}
                {producto.ancho && <CardEspecificacion label="Ancho" value={producto.ancho} />}
                {producto.largo && <CardEspecificacion label="Largo" value={producto.largo} />}
                {producto.textura && <CardEspecificacion label="Textura" value={producto.textura} />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <div className="mt-8 pb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <h2 className="mx-4 text-2xl font-semibold text-center text-gray-800">
              Productos relacionados
            </h2>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <Slider
            dots={false}
            infinite={false}
            speed={500}
            slidesToShow={4}
            slidesToScroll={1}
            responsive={[
              {
                breakpoint: 1280,
                settings: { slidesToShow: 3 },
              },
              {
                breakpoint: 768,
                settings: { slidesToShow: 1 },
              },
              {
                breakpoint: 480,
                settings: { slidesToShow: 1 },
              },
            ]}
          >
            {relacionados.map((producto) => {
              const mostrarOferta = producto.oferta_activa && producto.precio_oferta;
              const porcentajeDescuento = mostrarOferta
                ? Math.round(100 - (producto.precio_oferta! * 100) / producto.precio)
                : 0;

              const precioEfectivo = producto.precio * 0.85;

              return (
                <div key={producto.id} className="px-3">
                  <div className="bg-[#f9f5f0] border border-[#e2dcd4] text-center rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-full max-w-[340px] mx-auto">
                    <div className="relative">
                      {mostrarOferta && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-10">
                          - {porcentajeDescuento}%
                        </div>
                      )}
                      <Link href={`/products/${producto.id}`} prefetch={false}>
                        <div className="w-full h-[280px] flex items-center justify-center bg-white rounded-2xl mb-4 overflow-hidden">
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="max-h-[260px] object-contain transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </Link>
                    </div>

                    <Link href={`/products/${producto.id}`} prefetch={false}>
                      <h3 className="font-amatic text-2xl tracking-wide text-[#4a3c2f] mb-2 h-[60px] overflow-hidden truncate ">
                        {producto.nombre}
                      </h3>
                    </Link>

                    <div className="w-12 h-[2px] bg-[#816b4b] mx-auto my-2 rounded-full" />

                    {mostrarOferta ? (
                      <div className="flex justify-center items-center gap-2 text-base">
                        <span className="line-through text-gray-500 text-sm">
                          ${producto.precio.toLocaleString('es-ES')}
                        </span>
                        <span className="text-2xl font-semibold text-[#4a3c2f]">
                          ${producto.precio_oferta!.toLocaleString('es-ES')}
                        </span>
                      </div>
                    ) : (
                      <p className="text-2xl font-semibold text-[#4a3c2f] mt-2">
                        ${producto.precio.toLocaleString('es-ES')}
                      </p>
                    )}

                    {!mostrarOferta ? (
                      <p className="text-sm font-medium text-green-700 mt-1">
                        ${precioEfectivo.toLocaleString('es-ES', { minimumFractionDigits: 2 })} con transferencia
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-green-700 mt-1">
                        OFERTA ACTIVA!!
                      </p>
                    )}

                    <p className="text-sm mt-2 font-poppins text-gray-700">
                      💳 6 cuotas disponibles con tarjeta
                    </p>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      )}
    </div>
  );
}

// Componente Modal simplificado
interface ModalGaleriaProps {
  producto: Producto;
  imagenPrincipal: string | null;
  setImagenPrincipal: (img: string) => void;
  onClose: () => void;
}

const ModalGaleria = ({ producto, imagenPrincipal, setImagenPrincipal, onClose }: ModalGaleriaProps) => {
  const [modalZoom, setModalZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleModalWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.max(1, Math.min(3, modalZoom.scale + delta));
    
    setModalZoom(prev => ({
      ...prev,
      scale: newScale
    }));
  };

  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (modalZoom.scale > 1) {
      setIsDragging(true);
      setStartX(e.clientX - modalZoom.x);
      setStartY(e.clientY - modalZoom.y);
      e.preventDefault();
    }
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (isDragging && modalZoom.scale > 1) {
      setModalZoom(prev => ({
        ...prev,
        x: e.clientX - startX,
        y: e.clientY - startY
      }));
      e.preventDefault();
    }
  };

  const handleModalMouseUp = () => {
    setIsDragging(false);
  };

  const resetModalZoom = () => {
    setModalZoom({ scale: 1, x: 0, y: 0 });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white text-sm flex items-center gap-2">
            {modalZoom.scale > 1 ? (
              <>
                <Move size={16} />
                <span>Arrastra para mover • Rueda para zoom</span>
              </>
            ) : (
              <>
                <ZoomIn size={16} />
                <span>Rueda para zoom • Click fuera para cerrar</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-3xl text-white hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Imagen */}
        <div className="h-full flex items-center justify-center p-8">
          <div 
            className="relative overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
            onWheel={handleModalWheel}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            style={{ 
              width: '100%', 
              height: '100%',
              maxWidth: '800px',
              maxHeight: '600px'
            }}
          >
            <img
              src={imagenPrincipal || producto.imagen}
              alt={producto.nombre}
              className="w-full h-full object-contain pointer-events-none"
              style={{
                transform: `translate(${modalZoom.x}px, ${modalZoom.y}px) scale(${modalZoom.scale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
              draggable="false"
            />
            
            {/* Controles de zoom */}
            {modalZoom.scale > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <button
                  onClick={resetModalZoom}
                  className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-sm"
                >
                  <ZoomOut size={16} />
                  <span>Reiniciar ({modalZoom.scale.toFixed(1)}x)</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Miniaturas */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto py-2">
          <button
            onClick={() => setImagenPrincipal(producto.imagen)}
            className={`w-12 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
              imagenPrincipal === producto.imagen ? 'border-white' : 'border-transparent hover:border-white/50'
            }`}
          >
            <img 
              src={producto.imagen} 
              alt="Principal" 
              className="w-full h-full object-cover"
            />
          </button>
          
          {producto.galeria.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setImagenPrincipal(img.imagen_galeria)}
              className={`w-12 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                imagenPrincipal === img.imagen_galeria ? 'border-white' : 'border-transparent hover:border-white/50'
              }`}
            >
              <img 
                src={img.imagen_galeria} 
                alt={`Galería ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
