'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useFavoritos } from "@/context/FavoritosContext";
import { Heart, CheckCircle, AlertTriangle, XCircle, MessageCircle, ZoomIn, ZoomOut, Move, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  const imageRef = useRef<HTMLImageElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef<number>(0);
  const router = useRouter();
  const supabase = createClient();
  const [showBurst, setShowBurst] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const { esFavorito, verificarFavorito, addFavorito, removeFavorito } = useFavoritos();

  // ==================== FUNCIONES MEJORADAS PARA BLOQUEAR/DESBLOQUEAR SCROLL ====================
  const lockScroll = useCallback(() => {
    if (document.body.style.position === 'fixed') return;
    
    scrollYRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.height = '100vh';
  }, []);

  const unlockScroll = useCallback(() => {
    if (document.body.style.position !== 'fixed') return;
    
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.paddingRight = '';
    
    if (scrollYRef.current !== undefined) {
      window.scrollTo({
        top: scrollYRef.current,
        behavior: 'instant'
      });
    }
  }, []);

  // ==================== EFECTOS SIMPLIFICADOS ====================
  useEffect(() => {
    // Solo bloquear scroll para el modal de galería COMPLETA
    if (showModalGaleria) {
      lockScroll();
    }

    return () => {
      // Solo desbloquear si estamos saliendo del modal de galería
      if (showModalGaleria) {
        unlockScroll();
      }
    };
  }, [showModalGaleria, lockScroll, unlockScroll]);

  // Para el zoom en desktop, usa un efecto separado
  useEffect(() => {
    if (isZoomed && window.innerWidth >= 1024) {
      // Para zoom en desktop, solo prevenir el scroll de página
      const preventPageScroll = (e: WheelEvent) => {
        // Solo prevenir si el evento ocurre en el contenedor de zoom
        if (zoomContainerRef.current?.contains(e.target as Node)) {
          e.preventDefault();
        }
      };

      document.addEventListener('wheel', preventPageScroll, { passive: false });
      
      return () => {
        document.removeEventListener('wheel', preventPageScroll);
      };
    }
  }, [isZoomed]);

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
        // NO bloquees el scroll aquí, solo lo manejaremos con el event listener
      } else {
        setImagePosition({ x: 0, y: 0 });
        // NO necesitas restaurar nada aquí
      }
    }
  };

  // Añade este useEffect para manejar el zoom sin bloquear el scroll:
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Solo prevenir el scroll de la página si estamos haciendo zoom
      if (isZoomed && zoomContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    // Solo agregar el event listener si hay zoom activo
    if (isZoomed) {
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isZoomed]);

  const handleDesktopWheel = (e: React.WheelEvent) => {
    if (window.innerWidth >= 1024 && isZoomed) {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const newZoom = Math.max(1.5, Math.min(4, zoomLevel + delta));
      setZoomLevel(newZoom);
    }
  };

  // ==================== FUNCIÓN RESET ALL ZOOM ====================
  
  const resetAllZoom = useCallback(() => {
    setIsZoomed(false);
    setZoomLevel(2);
    setCursorPosition({ x: 50, y: 50 });
    setImagePosition({ x: 0, y: 0 });
  }, []);

  // ==================== CONFIGURACIÓN DEL SLIDER PARA MÓVIL ====================
  
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (oldIndex: number, newIndex: number) => {
      setCurrentSlideIndex(newIndex);
      resetAllZoom();
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

  useEffect(() => {
    return () => {
      // Limpiar todo al desmontar el componente
      unlockScroll();
      document.body.style.overflow = '';
    };
  }, [unlockScroll]);

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

          {/* Imagen principal - MOBILE (SIN ZOOM, SOLO SLIDER) */}
          <div className="w-full lg:hidden">
            <Slider {...sliderSettings}>
              {[producto.imagen, ...producto.galeria.map(g => g.imagen_galeria)].map((img, idx) => (
                <div key={idx} className="relative">
                  <div
                    className="overflow-hidden rounded-xl bg-gray-100 relative"
                    style={{ height: '500px' }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Botón para abrir modal */}
                  <button
                    onClick={() => setShowModalGaleria(true)}
                    className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors"
                  >
                    <ZoomIn size={22} />
                  </button>
                </div>
              ))}
            </Slider>
            
            {/* Instrucciones para móvil */}
            <div className="mt-3 text-sm text-gray-600 px-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <ZoomIn size={16} />
                <span>Toca el ícono para ver en pantalla completa</span>
              </div>
            </div>
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

      {/* Modal galería MEJORADO - VERSIÓN SIMPLIFICADA */}
      {showModalGaleria && (
        <ModalGaleriaMejorado
          producto={producto}
          currentSlideIndex={currentSlideIndex}
          setCurrentSlideIndex={setCurrentSlideIndex}
          onClose={() => {
            setShowModalGaleria(false);
            resetAllZoom();
          }}
          lockScroll={lockScroll}
          unlockScroll={unlockScroll}
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
                {producto.marco && <CardEspecificacion label="Material Externo" value={producto.marco} />}
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

// ==================== MODAL GALERÍA MEJORADO ====================
interface ModalGaleriaMejoradoProps {
  producto: Producto;
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  onClose: () => void;
  lockScroll: () => void;
  unlockScroll: () => void;
}

const ModalGaleriaMejorado = ({ 
  producto, 
  currentSlideIndex,
  setCurrentSlideIndex,
  onClose, 
  lockScroll, 
  unlockScroll 
}: ModalGaleriaMejoradoProps) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastScale, setLastScale] = useState(1);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isZoomingRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  // Detectar si es móvil y bloquear scroll
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    lockScroll();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      unlockScroll();
    };
  }, [lockScroll, unlockScroll]);

  // Obtener todas las imágenes
  const allImages = [producto.imagen, ...producto.galeria.map(g => g.imagen_galeria)];
  const currentImage = allImages[currentSlideIndex];

  // Navegación
  const goToPrevious = () => {
    if (zoomScale > 1) {
      resetZoom();
      setTimeout(() => {
        const newIndex = (currentSlideIndex - 1 + allImages.length) % allImages.length;
        setCurrentSlideIndex(newIndex);
      }, 150);
    } else {
      const newIndex = (currentSlideIndex - 1 + allImages.length) % allImages.length;
      setCurrentSlideIndex(newIndex);
      resetZoom();
    }
  };

  const goToNext = () => {
    if (zoomScale > 1) {
      resetZoom();
      setTimeout(() => {
        const newIndex = (currentSlideIndex + 1) % allImages.length;
        setCurrentSlideIndex(newIndex);
      }, 150);
    } else {
      const newIndex = (currentSlideIndex + 1) % allImages.length;
      setCurrentSlideIndex(newIndex);
      resetZoom();
    }
  };

  // Reset zoom
  const resetZoom = () => {
    setZoomScale(1);
    setTranslate({ x: 0, y: 0 });
    isZoomingRef.current = false;
  };

  // Manejar doble click para desktop
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isMobile) return;
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    
    if (timeSinceLastClick < 300) { // Doble click detectado
      e.preventDefault();
      e.stopPropagation();
      
      if (zoomScale === 1) {
        // Activar zoom centrado en el punto del click
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newScale = 2;
        setZoomScale(newScale);
        
        // Calcular posición para centrar el zoom en el punto del click
        if (imageRef.current && containerRef.current) {
          const imgRect = imageRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          
          const relativeX = x / rect.width;
          const relativeY = y / rect.height;
          
          const scaleDiff = newScale - 1;
          const newTranslateX = -((relativeX - 0.5) * containerRect.width * scaleDiff);
          const newTranslateY = -((relativeY - 0.5) * containerRect.height * scaleDiff);
          
          setTranslate({ x: newTranslateX, y: newTranslateY });
        }
      } else {
        // Desactivar zoom
        resetZoom();
      }
      
      lastClickTimeRef.current = 0;
    } else {
      lastClickTimeRef.current = now;
    }
  };

  // ==================== MANEJO DE GESTOS TÁCTILES PARA MÓVIL ====================
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touches = e.touches;
    const now = Date.now();
    
    // Guardar información del toque inicial
    touchStartRef.current = {
      x: touches[0].clientX,
      y: touches[0].clientY,
      time: now
    };
    
    if (touches.length === 1) {
      // Un solo dedo - preparar para arrastre
      setIsDragging(true);
      setDragStart({
        x: touches[0].clientX - translate.x,
        y: touches[0].clientY - translate.y
      });
    } else if (touches.length === 2 && zoomScale === 1) {
      // Dos dedos - iniciar zoom pellizco
      isZoomingRef.current = true;
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      setLastTouchDistance(distance);
      setLastScale(zoomScale);
      
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touches = e.touches;
    
    if (touches.length === 1 && isDragging && zoomScale > 1) {
      // Arrastrar imagen con zoom
      const touch = touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      
      // Calcular límites de movimiento
      if (imageRef.current && containerRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const maxX = Math.max(0, (imgRect.width * zoomScale - containerRect.width) / 2);
        const maxY = Math.max(0, (imgRect.height * zoomScale - containerRect.height) / 2);
        
        setTranslate({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        });
      }
      
      e.preventDefault();
    } else if (touches.length === 2 && isZoomingRef.current) {
      // Zoom pellizco
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchDistance > 0) {
        const scaleChange = currentDistance / lastTouchDistance;
        const newScale = Math.max(1, Math.min(4, lastScale * scaleChange));
        setZoomScale(newScale);
        
        // Calcular el punto central para mantener el zoom centrado
        if (imageRef.current && containerRef.current) {
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;
          
          const containerRect = containerRef.current.getBoundingClientRect();
          const relativeX = (centerX - containerRect.left) / containerRect.width;
          const relativeY = (centerY - containerRect.top) / containerRect.height;
          
          const scaleDiff = newScale - zoomScale;
          const newTranslateX = translate.x - (relativeX - 0.5) * containerRect.width * scaleDiff;
          const newTranslateY = translate.y - (relativeY - 0.5) * containerRect.height * scaleDiff;
          
          setTranslate({ x: newTranslateX, y: newTranslateY });
        }
      }
      
      setLastTouchDistance(currentDistance);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touches = e.changedTouches;
    const now = Date.now();
    const touchDuration = now - touchStartRef.current.time;
    
    // Si fue un toque rápido (menos de 300ms) y no hay zoom
    if (touches.length === 1 && touchDuration < 300 && !isZoomingRef.current) {
      const touch = touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // Si el movimiento fue mínimo, es un toque, no un arrastre
      if (deltaX < 10 && deltaY < 10) {
        // Toque en el lado izquierdo (20%) - imagen anterior
        if (touch.clientX < window.innerWidth * 0.2) {
          goToPrevious();
        }
        // Toque en el lado derecho (20%) - siguiente imagen
        else if (touch.clientX > window.innerWidth * 0.8) {
          goToNext();
        }
        // Toque en el centro - NO hace nada (solo se cierra con la X)
      }
    }
    
    setIsDragging(false);
    isZoomingRef.current = false;
    setLastTouchDistance(0);
  };

  // ==================== MANEJO PARA DESKTOP ====================
  
  const handleWheel = (e: React.WheelEvent) => {
    if (isMobile) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.max(1, Math.min(4, zoomScale + delta));
    setZoomScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile || zoomScale === 1) return;
    
    // Solo arrastrar si no es un click simple (para evitar confusión con doble click)
    if (e.button === 0) { // Botón izquierdo
      setIsDragging(true);
      setDragStart({
        x: e.clientX - translate.x,
        y: e.clientY - translate.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !isDragging || zoomScale === 1) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calcular límites de movimiento
    if (imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const maxX = Math.max(0, (imgRect.width * zoomScale - containerRect.width) / 2);
      const maxY = Math.max(0, (imgRect.height * zoomScale - containerRect.height) / 2);
      
      setTranslate({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
      onClick={(e) => {
        // Solo cerrar si se hace click en el fondo oscuro (fuera del contenido)
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Cabecera */}
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white text-sm flex items-center gap-2">
            {zoomScale > 1 ? (
              <>
                {isMobile ? (
                  <>
                    <Move size={16} />
                    <span>Pellizca para ajustar zoom • Desliza para mover</span>
                  </>
                ) : (
                  <>
                    <Move size={16} />
                    <span>Doble click para quitar zoom • Arrastra para mover</span>
                  </>
                )}
              </>
            ) : (
              <>
                {isMobile ? (
                  <span>Pellizca para zoom • Toca lados para navegar</span>
                ) : (
                  <span>• Mueve la Rueda del mouse para ajustar</span>
                )}
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
        
        {/* Contenedor principal */}
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-4 relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Imagen principal - CONTAINER CON TAMAÑO CONTROLADO */}
          <div 
            className={`relative ${isMobile ? 'w-full h-full' : 'max-w-3xl max-h-[70vh] w-full h-full flex items-center justify-center'}`}
            onDoubleClick={handleDoubleClick}
          >
            <div className={`relative ${isMobile ? 'w-full h-full' : 'max-w-full max-h-full w-full h-full flex items-center justify-center'}`}>
              <img
                ref={imageRef}
                src={currentImage}
                alt={`Imagen ${currentSlideIndex + 1}`}
                className={`${isMobile ? 'w-full h-full' : 'max-w-full max-h-full'} object-contain transition-transform duration-200 ease-out`}
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoomScale})`,
                  cursor: zoomScale > 1 ? 'grab' : 'default'
                }}
                draggable="false"
              />
              
              {/* Flechas de navegación (solo cuando no hay zoom) */}
              {zoomScale === 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              {/* Indicador de zoom */}
              {zoomScale > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <button
                    onClick={resetZoom}
                    className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-sm backdrop-blur-sm"
                  >
                    <ZoomOut size={16} />
                    <span>Quitar zoom ({zoomScale.toFixed(1)}x)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Zonas táctiles para navegación en móvil (solo sin zoom) */}
        {isMobile && zoomScale === 1 && (
          <>
            {/* Zona izquierda para navegar anterior */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1/4 z-20"
              onClick={goToPrevious}
              style={{ cursor: 'pointer' }}
            />
            {/* Zona derecha para navegar siguiente */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-1/4 z-20"
              onClick={goToNext}
              style={{ cursor: 'pointer' }}
            />
          </>
        )}
        
        {/* Indicadores (solo móvil y sin zoom) */}
        {isMobile && zoomScale === 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
            {/* Indicador de imágenes */}
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentSlideIndex + 1} / {allImages.length}
            </div>
            
            {/* Puntos indicadores */}
            <div className="flex gap-2">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentSlideIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Miniaturas (solo desktop) */}
        {!isMobile && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto py-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  resetZoom();
                }}
                className={`w-12 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                  idx === currentSlideIndex ? 'border-white' : 'border-transparent hover:border-white/50'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Miniatura ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Instrucciones para móvil */}
        {isMobile && zoomScale === 1 && (
          <div className="absolute top-20 left-0 right-0 flex justify-center">
            <div className="bg-black/60 text-white/90 text-xs px-3 py-2 rounded-full">
              Toca los lados para navegar • Pellizca para zoom
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
