'use client';

import { Bold } from 'lucide-react';
import React from 'react';

interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
}

interface Props {
  categorias: Categoria[];
}

const Categorias: React.FC<Props> = ({ categorias }) => {
  const getCategoria = (nombre: string) =>
    categorias.find(cat => cat.nombre.toLowerCase() === nombre.toLowerCase());

  const paletas = getCategoria('paletas');
  const accesorios = getCategoria('accesorios');
  const zapatillas = getCategoria('zapatillas');
  const bolsos = getCategoria('bolsos');
  const indumentaria = getCategoria('indumentaria');

  const renderItem = (
    cat: Categoria | undefined,
    extraClasses = '',
    imageHeight = 'h-full',
    imagePosition = ''
  ) => {
    if (!cat) return null;
    return (
      <div
        key={cat.id}
        className={`relative overflow-hidden cursor-pointer group rounded-xl shadow-md ${extraClasses}`}
        onClick={() => window.location.href = `/products-category/${cat.id}`}
      >
        <img
          src={cat.imagen}
          alt={cat.nombre}
          className={`w-full ${imageHeight} object-cover ${imagePosition} transition-transform duration-300 group-hover:scale-105 group-hover:opacity-75`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <span className="text-white text-2xl font-bebas uppercase text-center">
            {cat.nombre}
          </span>
        </div>
      </div>
    );
  };


  return (
    <>
      {/* 🖥️ Versión desktop */}
      <div
        className="hidden lg:block w-full h-[800px] mx-auto p-4"
        style={{ backgroundColor: "#e6dfd6" }}
      >
        <div className="grid grid-cols-6 grid-rows-6 gap-2 w-full h-full">
          {renderItem(paletas, 'col-span-2 row-span-6')}
          {renderItem(accesorios, 'col-span-2 row-span-3')}
          {renderItem(zapatillas, 'col-span-2 row-span-3')}
          {renderItem(bolsos, 'col-span-2 row-span-3')}
          {renderItem(indumentaria, 'col-span-2 row-span-3')}
        </div>
      </div>

      {/* 📱 Versión móvil */}
      <div
        className="block lg:hidden w-full mx-auto p-4 space-y-4"
        style={{ backgroundColor: "#e6dfd6" }}
      >
        {[paletas, accesorios, zapatillas, bolsos, indumentaria].map((cat) => {
          const altura = cat?.nombre.toLowerCase() === 'paletas' ? 'h-64' : 'h-52';
          const posicion = cat?.nombre.toLowerCase() === 'paletas' ? 'object-[center_25%]' : '';
          return renderItem(cat, '', altura, posicion);
        })}
      </div>
    </>
  );
};

export default Categorias;
