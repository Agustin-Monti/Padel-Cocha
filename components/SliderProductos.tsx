'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  precio_oferta: number | null;
  oferta_activa: boolean;
  imagen: string;
}

function CustomPrevArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-[#816b4b] text-white p-2 rounded-full hover:scale-110 transition"
      onClick={onClick}
    >
      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
  );
}

function CustomNextArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-[#816b4b] text-white p-2 rounded-full hover:scale-110 transition"
      onClick={onClick}
    >
      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
  );
}




export default function SliderProductos({ productos }: { productos: Producto[] }) {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="w-full py-10 px-4 md:px-8 lg:px-16" style={{ backgroundColor: '#e6dfd6' }}>
      {/* Título decorado */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 w-full max-w-[150px]">
          <div className="w-2 h-2 bg-[#816b4b] rounded-full" />
          <div className="h-[2px] bg-[#816b4b] flex-1" />
        </div>
        <h2 className="text-2xl md:text-3xl font-amatic font-bold text-[#816b4b] mx-4 text-center whitespace-nowrap">
          Productos más valorados
        </h2>
        <div className="flex items-center gap-2 w-full max-w-[150px]">
          <div className="h-[2px] bg-[#816b4b] flex-1" />
          <div className="w-2 h-2 bg-[#816b4b] rounded-full" />
        </div>
      </div>

      <Slider {...settings}>
        {productos.map((producto) => {
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
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-[300px] object-cover rounded-2xl mb-4 hover:scale-105 transition-transform duration-300"
                    />
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
  );
}
