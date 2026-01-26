"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  tipo_id: string;
  forma: string; // Cambiado de "color" a "forma"
  estado: string;
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
  const [formatosDisponibles, setFormatosDisponibles] = useState<string[]>([]); // Cambiado de colores a formatos
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [estadosDisponibles, setEstadosDisponibles] = useState<string[]>([]);
  const [filtroFormatoSeleccionado, setFiltroFormatoSeleccionado] = useState<string | null>(null); // Cambiado de color a formato
  const [filtroMarcaSeleccionada, setFiltroMarcaSeleccionada] = useState<string | null>(null);
  const [filtroEstadoSeleccionado, setFiltroEstadoSeleccionado] = useState<string | null>(null);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(1000000);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const cantidadMap: Record<string, number> = {};
    const estadosSet = new Set<string>();
    const formatosSet = new Set<string>(); // Cambiado de colores a formatos
    
    productos.forEach((producto) => {
      cantidadMap[producto.tipo_id] = (cantidadMap[producto.tipo_id] || 0) + 1;
      
      // Agregar estado al set si existe
      if (producto.estado) {
        estadosSet.add(producto.estado);
      }
      
      // Agregar formato al set si existe
      if (producto.forma) {
        formatosSet.add(producto.forma);
      }
    });
    
    setCantidadPorTipo(cantidadMap);

    // Ordenar formatos alfabéticamente
    const formatosOrdenados = Array.from(formatosSet).sort();
    setFormatosDisponibles(formatosOrdenados);

    const marcasMap = new Map<string, string>();
    productos.forEach((producto) => {
      if (producto.marcas) {
        marcasMap.set(producto.marcas.id, producto.marcas.nombre);
      }
    });
    setMarcasDisponibles(Array.from(marcasMap.entries()).map(([id, nombre]) => ({ id, nombre })));
    
    // Ordenar estados alfabéticamente
    const estadosOrdenados = Array.from(estadosSet).sort();
    setEstadosDisponibles(estadosOrdenados);
  }, [productos]);

  const productosFiltrados = productos.filter((p) => {
    const dentroRangoPrecio = p.precio >= precioMinimo && p.precio <= precioMaximo;
    const cumpleFiltroTipo = filtroSeleccionado ? p.tipo_id === filtroSeleccionado : true;
    const cumpleFiltroFormato = filtroFormatoSeleccionado ? p.forma === filtroFormatoSeleccionado : true; // Cambiado de color a formato
    const cumpleFiltroMarca = filtroMarcaSeleccionada ? p.marca_id === filtroMarcaSeleccionada : true;
    const cumpleFiltroEstado = filtroEstadoSeleccionado ? p.estado === filtroEstadoSeleccionado : true;
    
    return cumpleFiltroTipo && cumpleFiltroFormato && cumpleFiltroMarca && cumpleFiltroEstado && dentroRangoPrecio;
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
              formatosDisponibles={formatosDisponibles} // Cambiado
              filtroFormatoSeleccionado={filtroFormatoSeleccionado} // Cambiado
              setFiltroFormatoSeleccionado={setFiltroFormatoSeleccionado} // Cambiado
              marcasDisponibles={marcasDisponibles}
              filtroMarcaSeleccionada={filtroMarcaSeleccionada}
              setFiltroMarcaSeleccionada={setFiltroMarcaSeleccionada}
              estadosDisponibles={estadosDisponibles}
              filtroEstadoSeleccionado={filtroEstadoSeleccionado}
              setFiltroEstadoSeleccionado={setFiltroEstadoSeleccionado}
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
          formatosDisponibles={formatosDisponibles} // Cambiado
          filtroFormatoSeleccionado={filtroFormatoSeleccionado} // Cambiado
          setFiltroFormatoSeleccionado={setFiltroFormatoSeleccionado} // Cambiado
          marcasDisponibles={marcasDisponibles}
          filtroMarcaSeleccionada={filtroMarcaSeleccionada}
          setFiltroMarcaSeleccionada={setFiltroMarcaSeleccionada}
          estadosDisponibles={estadosDisponibles}
          filtroEstadoSeleccionado={filtroEstadoSeleccionado}
          setFiltroEstadoSeleccionado={setFiltroEstadoSeleccionado}
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
                    
                    {/* Etiqueta de estado si existe */}
                    {producto.estado && (
                      <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-10">
                        {producto.estado.charAt(0).toUpperCase() + producto.estado.slice(1).toLowerCase()}
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

// ⬇️ COMPONENTE FILTROS ACTUALIZADO CON NUEVO ORDEN Y FORMATOS
function Filtros({
  tiposProductos,
  cantidadPorTipo,
  filtroSeleccionado,
  setFiltroSeleccionado,
  formatosDisponibles, // Cambiado de colores a formatos
  filtroFormatoSeleccionado, // Cambiado
  setFiltroFormatoSeleccionado, // Cambiado
  marcasDisponibles,
  filtroMarcaSeleccionada,
  setFiltroMarcaSeleccionada,
  estadosDisponibles,
  filtroEstadoSeleccionado,
  setFiltroEstadoSeleccionado,
  precioMinimo,
  setPrecioMinimo,
  precioMaximo,
  setPrecioMaximo,
}: {
  tiposProductos: TipoProducto[];
  cantidadPorTipo: Record<string, number>;
  filtroSeleccionado: string | null;
  setFiltroSeleccionado: (value: string | null) => void;
  formatosDisponibles: string[]; // Cambiado
  filtroFormatoSeleccionado: string | null; // Cambiado
  setFiltroFormatoSeleccionado: (value: string | null) => void; // Cambiado
  marcasDisponibles: { id: string; nombre: string }[];
  filtroMarcaSeleccionada: string | null;
  setFiltroMarcaSeleccionada: (value: string | null) => void;
  estadosDisponibles: string[];
  filtroEstadoSeleccionado: string | null;
  setFiltroEstadoSeleccionado: (value: string | null) => void;
  precioMinimo: number;
  setPrecioMinimo: (value: number) => void;
  precioMaximo: number;
  setPrecioMaximo: (value: number) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">Filtrar:</h2>

      {/* 1. FILTRO POR ESTADO (PRIMERO) */}
      <div>
        <h3 className="text-md font-medium mb-2">Estado</h3>
        <ul className="border-b-2 pb-4">
          <li key="todos-estados" className="mb-3">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="radio"
                  name="estado"
                  className="sr-only"
                  checked={filtroEstadoSeleccionado === null}
                  onChange={() => setFiltroEstadoSeleccionado(null)}
                />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${filtroEstadoSeleccionado === null 
                    ? 'border-blue-600 bg-blue-600' 
                    : 'border-gray-400 bg-white'}`}>
                  {filtroEstadoSeleccionado === null && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-lg font-medium">Todos los estados</span>
            </label>
          </li>
          
          {estadosDisponibles.map((estado) => (
            <li key={estado} className="mb-3">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="radio"
                    name="estado"
                    className="sr-only"
                    checked={filtroEstadoSeleccionado === estado}
                    onChange={() => setFiltroEstadoSeleccionado(filtroEstadoSeleccionado === estado ? null : estado)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${filtroEstadoSeleccionado === estado 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-400 bg-white'}`}>
                    {filtroEstadoSeleccionado === estado && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <span className="text-lg font-medium">
                  {estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. FILTRO POR MARCA (SEGUNDO) */}
      <div>
        <h3 className="text-md font-medium mb-2">Marcas</h3>
        <ul className="border-b-2 pb-4">
          {marcasDisponibles.map((marca) => (
            <li key={marca.id} className="mb-3">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="form-checkbox w-5 h-5 md:scale-150 touch-manipulation"
                  checked={filtroMarcaSeleccionada === marca.id}
                  onChange={() =>
                    setFiltroMarcaSeleccionada(filtroMarcaSeleccionada === marca.id ? null : marca.id)
                  }
                />
                <span className="text-lg font-medium">{marca.nombre}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. FILTRO POR FORMATO (TERCERO - REEMPLAZA A COLORES) */}
      <div>
        <h3 className="text-md font-medium mb-2">Formatos</h3>
        <ul className="border-b-2 pb-4">
          {formatosDisponibles.map((formato) => (
            <li key={formato} className="mb-3">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="form-checkbox w-5 h-5 md:scale-150 touch-manipulation"
                  checked={filtroFormatoSeleccionado === formato}
                  onChange={() => setFiltroFormatoSeleccionado(filtroFormatoSeleccionado === formato ? null : formato)}
                />
                <span className="text-lg font-medium">
                  {formato.charAt(0).toUpperCase() + formato.slice(1).toLowerCase()}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. FILTRO POR RANGO DE PRECIO */}
      <div>
        <h3 className="text-md font-medium mb-2">Rango de precio</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm">Desde: ${precioMinimo}</span>
            <span className="text-sm">Hasta: ${precioMaximo}</span>
          </div>
          <div className="space-y-4">
            <input
              type="range"
              min={0}
              max={1000000}
              step={1000}
              value={precioMinimo}
              onChange={(e) => setPrecioMinimo(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min={0}
              max={1000000}
              step={1000}
              value={precioMaximo}
              onChange={(e) => setPrecioMaximo(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Botón para reiniciar filtros */}
      <button
        onClick={() => {
          setFiltroSeleccionado(null);
          setFiltroFormatoSeleccionado(null); // Cambiado
          setFiltroMarcaSeleccionada(null);
          setFiltroEstadoSeleccionado(null);
          setPrecioMinimo(0);
          setPrecioMaximo(1000000);
        }}
        className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-md transition-all active:bg-gray-400"
      >
        Reiniciar filtros
      </button>
    </div>
  );
}
