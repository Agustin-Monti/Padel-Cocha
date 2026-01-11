'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useFavoritos } from "@/context/FavoritosContext";
import { Heart, CheckCircle, AlertTriangle, XCircle, MessageCircle } from "lucide-react";
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
  material : string;
  capacidad : string;
  origen : string;
  talle : string;
  modelo : string;
  medidas : string;
  forma : string;
  balance : string;
  nucleo : string;
  acabado : string;
  marco : string;
  potencia : number;
  control : number;
  juego : string;
  ancho : string;
  largo : string;
  textura : string;
  color : string;
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
  const [cantidad, setCantidad] = useState(1);
  const [isCarritoOpen, setIsCarritoOpen] = useState(false);
  const [carritoModificado, setCarritoModificado] = useState(false);
  const [openDevolucion, setOpenDevolucion] = useState(false);
  const [openGarantia, setOpenGarantia] = useState(false);
  const [showModalGaleria, setShowModalGaleria] = useState(false);
  const [categoriaNombre, setCategoriaNombre] = useState<string | null>(null);
  const [marcaNombre, setMarcaNombre] = useState<string | null>(null);
  const [talleSeleccionado, setTalleSeleccionado] = useState<string | null>(null);
  const [tallesDisponibles, setTallesDisponibles] = useState<Record<string, number>>({});

  const router = useRouter();
  const supabase = createClient();
  const [showBurst, setShowBurst] = useState(false);

  const { esFavorito, verificarFavorito, addFavorito, removeFavorito } = useFavoritos();

  useEffect(() => {
    const fetchCategoriaNombre = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("nombre")
        .eq("id", producto.categoria_id)
        .single();

      if (error) {
        console.error("Error obteniendo categoría:", error);
      } else {
        console.log("Nombre de categoría:", data.nombre);
        setCategoriaNombre(data.nombre);
      }
    };

    fetchCategoriaNombre();
  }, [producto.categoria_id]);

  useEffect(() => {
    const fetchMarcaNombre = async () => {
      const { data, error } = await supabase
        .from("marcas")
        .select("nombre")
        .eq("id", producto.marca_id)
        .single();

      if (error) {
        console.error("Error obteniendo marca:", error);
      } else {
        console.log("Nombre de marca:", data.nombre);
        setMarcaNombre(data.nombre);
      }
    };

    fetchMarcaNombre();
  }, [producto.marca_id]);

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

  // Función para generar mensaje de WhatsApp
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

  // Número de WhatsApp (reemplaza con tu número real)
  const whatsappNumber = "5493445532916"; // Formato internacional sin + o espacios

  const handleWhatsAppClick = () => {
    const mensaje = generarMensajeWhatsApp();
    const url = `https://wa.me/${whatsappNumber}?text=${mensaje}`;
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
        <p className="text-sm text-gray-500 font-medium mb-2 items-center text-center">{label}</p>
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
                onClick={() => setImagenPrincipal(img.imagen_galeria)}
              >
                <img src={img.imagen_galeria} alt={`Img ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
          
          {/* Imagen principal - MOBILE (slider) */}
          <div className="w-full lg:hidden">
            <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1} arrows={false}>
              {[producto.imagen, ...producto.galeria.map(g => g.imagen_galeria)].map((img, idx) => (
                <div key={idx}>
                  <img
                    src={img}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-[500px] object-contain rounded-xl"
                    onClick={() => setShowModalGaleria(true)}
                  />
                </div>
              ))}
            </Slider>
          </div>

          {/* Imagen principal - DESKTOP */}
          <div className="w-full lg:w-1/2 hidden lg:block">
            <img
              src={imagenPrincipal || producto.imagen}
              alt={producto.nombre}
              className="max-w-full max-h-[850px] object-contain rounded-lg cursor-zoom-in hover:opacity-95 transition"
              onClick={() => setShowModalGaleria(true)}
            />
          </div>

          {/* Detalles */}
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

            {/* Selección de talle (solo para indumentaria y zapatillas) */}
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

            {/* Sección comentada: Cantidad y carrito */}
            {/*
            <div className="mt-8">
              <h3 className="text-md font-medium text-gray-800 mb-2">Cantidad</h3>
              <div className="flex items-center space-x-4 mb-4">
                <button 
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))} 
                  className="w-10 h-10 text-xl bg-gray-200 rounded-full"
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <span className="text-lg font-semibold">{cantidad}</span>
                <button
                  onClick={handleIncrementarCantidad}
                  className="w-10 h-10 text-xl bg-gray-200 rounded-full"
                  disabled={
                    categoriaNombre?.toLowerCase() === "indumentaria y calzado" 
                      ? !talleSeleccionado || cantidad >= tallesDisponibles[talleSeleccionado]
                      : cantidad >= producto.stock
                  }
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAñadirAlCarrito}
                disabled={
                  producto.stock === 0 || 
                  (categoriaNombre?.toLowerCase() === "indumentaria y calzado" && !talleSeleccionado) ||
                  (categoriaNombre?.toLowerCase() === "indumentaria y calzado" && tallesDisponibles[talleSeleccionado!] === 0)
                }
                className={`w-full py-3 rounded-lg text-base transition 
                  ${producto.stock === 0 || 
                    (categoriaNombre?.toLowerCase() === "indumentaria y calzado" && 
                     (!talleSeleccionado || tallesDisponibles[talleSeleccionado] === 0))
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
                    : "bg-black text-white hover:bg-gray-800"}`}
              >
                {producto.stock === 0 
                  ? "Sin stock" 
                  : categoriaNombre?.toLowerCase() === "indumentaria y calzado" && !talleSeleccionado
                    ? "Selecciona un talle"
                    : categoriaNombre?.toLowerCase() === "indumentaria y calzado" && tallesDisponibles[talleSeleccionado!] === 0
                      ? "Sin stock en este talle"
                      : "Añadir al carrito"}
              </button>
            </div>
            */}

            {/* Botón de WhatsApp para consultar disponibilidad */}
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-2">
          <div className="relative w-full max-w-[95vw] max-h-[95vh]">
            <button
              onClick={() => setShowModalGaleria(false)}
              className="absolute top-2 right-4 text-3xl text-white hover:text-gray-300 z-50"
            >
              ×
            </button>
            <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1} arrows>
              {[producto.imagen, ...producto.galeria.map(g => g.imagen_galeria)].map((img, idx) => (
                <div key={idx} className="flex justify-center items-center w-full h-[80vh]">
                  <img src={img} alt={`Galería ${idx + 1}`} className="w-full h-full object-contain rounded-none" />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

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
              const cuotas = producto.precio / 3;

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

                    {/* Separador decorativo */}
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
