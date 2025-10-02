"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  tipo_id: string;
  color: string;
  oferta_activa: boolean; 
  precio_oferta: number;
  marca_id: string;
  marcas?: { id: string; nombre: string };
};

export type TipoProducto = {
  id: string;
  nombre: string;
};

interface Props {
  productos: Producto[];
  tiposProductos: TipoProducto[];
}

export default function ProductoCategoryClient({ productos, tiposProductos }: Props) {
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string | null>(null);
  const [cantidadPorTipo, setCantidadPorTipo] = useState<Record<string, number>>({});
  const [coloresDisponibles, setColoresDisponibles] = useState<string[]>([]);
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [filtroColorSeleccionado, setFiltroColorSeleccionado] = useState<string | null>(null);
  const [filtroMarcaSeleccionada, setFiltroMarcaSeleccionada] = useState<string | null>(null);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(1000000);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const cantidadMap: Record<string, number> = {};
    productos.forEach((producto) => {
      cantidadMap[producto.tipo_id] = (cantidadMap[producto.tipo_id] || 0) + 1;
    });
    setCantidadPorTipo(cantidadMap);

    const colores = Array.from(new Set(productos.map((producto) => producto.color)));
    setColoresDisponibles(colores);

    const marcasMap = new Map<string, string>();
    productos.forEach((producto) => {
      if (producto.marcas) {
        marcasMap.set(producto.marcas.id, producto.marcas.nombre);
      }
    });
    setMarcasDisponibles(Array.from(marcasMap.entries()).map(([id, nombre]) => ({ id, nombre })));
  }, [productos]);

  const productosFiltrados = productos.filter((p) => {
    const dentroRangoPrecio = p.precio >= precioMinimo && p.precio <= precioMaximo;
    const cumpleFiltroTipo = filtroSeleccionado ? p.tipo_id === filtroSeleccionado : true;
    const cumpleFiltroColor = filtroColorSeleccionado ? p.color === filtroColorSeleccionado : true;
    const cumpleFiltroMarca = filtroMarcaSeleccionada ? p.marca_id === filtroMarcaSeleccionada : true;
    return cumpleFiltroTipo && cumpleFiltroColor && cumpleFiltroMarca && dentroRangoPrecio;
  });

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-6 items-start">
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg lg:hidden z-50"
      >
        Filtros
      </button>

      {isModalOpen && (
        <div onClick={handleOutsideClick} className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50 lg:hidden">
          <div className="bg-white w-3/4 h-full p-6 overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="text-gray-700 hover:text-gray-900 mb-4">
              &times; Cerrar
            </button>
            <Filtros
              tiposProductos={tiposProductos}
              cantidadPorTipo={cantidadPorTipo}
              filtroSeleccionado={filtroSeleccionado}
              setFiltroSeleccionado={setFiltroSeleccionado}
              coloresDisponibles={coloresDisponibles}
              filtroColorSeleccionado={filtroColorSeleccionado}
              setFiltroColorSeleccionado={setFiltroColorSeleccionado}
              marcasDisponibles={marcasDisponibles}
              filtroMarcaSeleccionada={filtroMarcaSeleccionada}
              setFiltroMarcaSeleccionada={setFiltroMarcaSeleccionada}
              precioMinimo={precioMinimo}
              setPrecioMinimo={setPrecioMinimo}
              precioMaximo={precioMaximo}
              setPrecioMaximo={setPrecioMaximo}
            />
          </div>
        </div>
      )}

      <aside className="hidden lg:block w-1/4 pr-6">
        <Filtros
          tiposProductos={tiposProductos}
          cantidadPorTipo={cantidadPorTipo}
          filtroSeleccionado={filtroSeleccionado}
          setFiltroSeleccionado={setFiltroSeleccionado}
          coloresDisponibles={coloresDisponibles}
          filtroColorSeleccionado={filtroColorSeleccionado}
          setFiltroColorSeleccionado={setFiltroColorSeleccionado}
          marcasDisponibles={marcasDisponibles}
          filtroMarcaSeleccionada={filtroMarcaSeleccionada}
          setFiltroMarcaSeleccionada={setFiltroMarcaSeleccionada}
          precioMinimo={precioMinimo}
          setPrecioMinimo={setPrecioMinimo}
          precioMaximo={precioMaximo}
          setPrecioMaximo={setPrecioMaximo}
        />
      </aside>

      <section
        className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 pb-8"
        style={{ backgroundColor: '#e6dfd6' }}
      >
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => {
            const mostrarOferta = producto.oferta_activa && producto.precio_oferta;
            const porcentajeDescuento = mostrarOferta
              ? Math.round(100 - (producto.precio_oferta * 100) / producto.precio)
              : 0;

            return (
              <div key={producto.id}>
                <div className="bg-[#f9f5f0] border border-[#e2dcd4] text-center rounded-3xl p-4 shadow-md hover:shadow-xl transition-all duration-300 h-full max-w-[340px] mx-auto flex flex-col gap-y-2">
                  
                  {/* Imagen con etiqueta de oferta */}
                  <div className="relative">
                    {mostrarOferta && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-10">
                        -{porcentajeDescuento}%
                      </div>
                    )}
                    <Link href={`/products/${producto.id}`} prefetch={false}>
                      <div className="w-full h-[300px] flex items-center justify-center">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="max-w-full max-h-full object-contain rounded-2xl transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </Link>
                  </div>

                  {/* Nombre truncado */}
                  <Link href={`/products/${producto.id}`} prefetch={false}>
                    <h3 className="font-amatic text-2xl tracking-wide text-[#4a3c2f] line-clamp-2 px-2 truncate">
                      {producto.nombre}
                    </h3>
                  </Link>

                  {/* Separador decorativo */}
                  <div className="w-10 h-[2px] bg-[#816b4b] mx-auto rounded-full" />

                  {/* Precio u oferta */}
                  {mostrarOferta ? (
                    <div className="flex justify-center items-center gap-2">
                      <span className="line-through text-gray-500 text-sm">
                        ${producto.precio.toLocaleString('es-ES')}
                      </span>
                      <span className="text-xl font-bold text-[#4a3c2f]">
                        ${producto.precio_oferta.toLocaleString('es-ES')}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl font-semibold text-[#4a3c2f]">
                      ${producto.precio.toLocaleString('es-ES')}
                    </p>
                  )}

                  {/* Precio con transferencia (si no hay oferta) */}
                  {!mostrarOferta ? (
                    <p className="text-sm font-medium text-green-700">
                      ${(producto.precio * 0.95).toLocaleString('es-ES', { minimumFractionDigits: 2 })} con transferencia
                    </p>
                  ): (
                    <p className="text-sm font-medium text-green-700">
                      Oferta Activa
                    </p>
                  )}

                  {/* Cuotas */}
                  <p className="text-sm font-poppins text-gray-700">💳 6 cuotas disponibles con tarjeta</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full flex justify-center items-center text-center py-20 col-span-full">
            <p className="text-xl font-semibold text-gray-500">No hay productos disponibles.</p>
          </div>
        )}
      </section>
    </div>
  );
}

// ⬇️ COMPONENTE FILTROS CORREGIDO
function Filtros({
  tiposProductos,
  cantidadPorTipo,
  filtroSeleccionado,
  setFiltroSeleccionado,
  coloresDisponibles,
  filtroColorSeleccionado,
  setFiltroColorSeleccionado,
  marcasDisponibles,
  filtroMarcaSeleccionada,
  setFiltroMarcaSeleccionada,
  precioMinimo,
  setPrecioMinimo,
  precioMaximo,
  setPrecioMaximo,
}: {
  tiposProductos: TipoProducto[];
  cantidadPorTipo: Record<string, number>;
  filtroSeleccionado: string | null;
  setFiltroSeleccionado: (value: string | null) => void;
  coloresDisponibles: string[];
  filtroColorSeleccionado: string | null;
  setFiltroColorSeleccionado: (value: string | null) => void;
  marcasDisponibles: { id: string; nombre: string }[];
  filtroMarcaSeleccionada: string | null;
  setFiltroMarcaSeleccionada: (value: string | null) => void;
  precioMinimo: number;
  setPrecioMinimo: (value: number) => void;
  precioMaximo: number;
  setPrecioMaximo: (value: number) => void;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Filtrar:</h2>

      <h3 className="text-md font-medium mb-2">Tipos de productos</h3>
      <ul className="border-b-2">
        {tiposProductos.map((tipo) => (
          <li key={tipo.id} className="mb-4"> {/* KEY AGREGADO */}
            <label className="flex items-center space-x-4">
              <input
                type="checkbox"
                className="form-checkbox scale-150"
                checked={filtroSeleccionado === tipo.id}
                onChange={() => setFiltroSeleccionado(filtroSeleccionado === tipo.id ? null : tipo.id)}
              />
              <span className="text-xl font-medium">{tipo.nombre}</span>
              {cantidadPorTipo[tipo.id] && (
                <span className="ml-2 text-sm text-gray-500">({cantidadPorTipo[tipo.id]})</span>
              )}
            </label>
          </li>
        ))}
      </ul>

      <h3 className="text-md font-medium mt-4 mb-2">Colores</h3>
      <ul className="border-b-2">
        {coloresDisponibles.map((color) => (
          <li key={color} className="mb-4"> {/* KEY AGREGADO */}
            <label className="flex items-center space-x-4">
              <input
                type="checkbox"
                className="form-checkbox scale-150"
                checked={filtroColorSeleccionado === color}
                onChange={() => setFiltroColorSeleccionado(filtroColorSeleccionado === color ? null : color)}
              />
              <span className="text-xl font-medium">{color}</span>
            </label>
          </li>
        ))}
      </ul>

      <h3 className="text-md font-medium mt-4 mb-2">Marcas</h3>
      <ul className="border-b-2">
        {marcasDisponibles.map((marca) => (
          <li key={marca.id} className="mb-4"> {/* KEY AGREGADO */}
            <label className="flex items-center space-x-4">
              <input
                type="checkbox"
                className="form-checkbox scale-150"
                checked={filtroMarcaSeleccionada === marca.id}
                onChange={() =>
                  setFiltroMarcaSeleccionada(filtroMarcaSeleccionada === marca.id ? null : marca.id)
                }
              />
              <span className="text-xl font-medium">{marca.nombre}</span>
            </label>
          </li>
        ))}
      </ul>

      <h3 className="text-md font-medium mt-4 mb-2">Rango de precio</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Desde: ${precioMinimo}</span>
          <span className="text-sm">Hasta: ${precioMaximo}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1000000}
          value={precioMinimo}
          onChange={(e) => setPrecioMinimo(Number(e.target.value))}
          className="w-full"
        />
        <input
          type="range"
          min={0}
          max={1000000}
          value={precioMaximo}
          onChange={(e) => setPrecioMaximo(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={() => {
          setFiltroSeleccionado(null);
          setFiltroColorSeleccionado(null);
          setFiltroMarcaSeleccionada(null);
          setPrecioMinimo(0);
          setPrecioMaximo(1000000);
        }}
        className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 rounded-md transition-all"
      >
        Reiniciar filtros
      </button>
    </>
  );
}
