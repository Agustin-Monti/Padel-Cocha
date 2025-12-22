// components/ProductoOfertasClient.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from 'next/link';
import { Filter, X, Tag, Palette, DollarSign, Flame, Zap } from "lucide-react";

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

export default function ProductoOfertasClient({ productos, tiposProductos }: Props) {
  const [filtroColorSeleccionado, setFiltroColorSeleccionado] = useState<string | null>(null);
  const [filtroMarcaSeleccionada, setFiltroMarcaSeleccionada] = useState<string | null>(null);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(1000000);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Usar useMemo para evitar recalculos en cada render
  const productosConOferta = useMemo(() => 
    productos.filter(p => p.oferta_activa && p.precio_oferta),
    [productos]
  );

  const [coloresDisponibles, setColoresDisponibles] = useState<string[]>([]);
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    // Solo procesar si hay productos con oferta
    if (productosConOferta.length === 0) {
      setColoresDisponibles([]);
      setMarcasDisponibles([]);
      return;
    }

    const colores = Array.from(new Set(productosConOferta.map((producto) => producto.color)));
    setColoresDisponibles(colores);

    const marcasMap = new Map<string, string>();
    productosConOferta.forEach((producto) => {
      if (producto.marcas) {
        marcasMap.set(producto.marcas.id, producto.marcas.nombre);
      }
    });
    setMarcasDisponibles(Array.from(marcasMap.entries()).map(([id, nombre]) => ({ id, nombre })));
  }, [productosConOferta]); // Dependencia correcta

  // Memoizar productos filtrados para mejor performance
  const productosFiltrados = useMemo(() => 
    productosConOferta.filter((p) => {
      const dentroRangoPrecio = p.precio_oferta >= precioMinimo && p.precio_oferta <= precioMaximo;
      const cumpleFiltroColor = filtroColorSeleccionado ? p.color === filtroColorSeleccionado : true;
      const cumpleFiltroMarca = filtroMarcaSeleccionada ? p.marca_id === filtroMarcaSeleccionada : true;
      return cumpleFiltroColor && cumpleFiltroMarca && dentroRangoPrecio;
    }),
    [productosConOferta, filtroColorSeleccionado, filtroMarcaSeleccionada, precioMinimo, precioMaximo]
  );

  const handleResetFilters = () => {
    setFiltroColorSeleccionado(null);
    setFiltroMarcaSeleccionada(null);
    setPrecioMinimo(0);
    setPrecioMaximo(1000000);
  };

  const activeFiltersCount = [
    filtroColorSeleccionado,
    filtroMarcaSeleccionada,
    precioMinimo > 0 || precioMaximo < 1000000
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f5f0] to-[#e6dfd6]">
      {/* Header especial para ofertas */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">🔥 OFERTAS ESPECIALES</h1>
              </div>
              <p className="text-lg opacity-90 max-w-2xl">
                Aprovechá descuentos exclusivos en productos seleccionados. ¡Tiempo limitado!
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{productosConOferta.length}</div>
              <div className="text-sm">Productos en oferta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros y controles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {productosFiltrados.length} ofertas disponibles
            </h2>
            <p className="text-gray-600">
              Filtra por marca, color o precio para encontrar tu oferta ideal
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition"
              >
                <X size={18} />
                Limpiar filtros ({activeFiltersCount})
              </button>
            )}
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="md:hidden flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              <Filter size={20} />
              Filtros
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filtros - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Filter size={20} />
                Filtrar ofertas
              </h3>
              
              {/* Filtros específicos para ofertas */}
              <OfertasFiltros
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
          </aside>

          {/* Modal Filtros - Mobile */}
          {isModalOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden flex justify-end"
              onClick={() => setIsModalOpen(false)}
            >
              <div 
                className="bg-white w-full max-w-sm h-full overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Filtrar ofertas</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>
                <OfertasFiltros
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

          {/* Grid de Ofertas */}
          <div className="flex-1">
            {productosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {productosFiltrados.map((producto) => {
                  const porcentajeDescuento = Math.round(100 - (producto.precio_oferta * 100) / producto.precio);
                  
                  return (
                    <div key={producto.id} className="group">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-orange-100 h-full flex flex-col">
                        
                        {/* Badge de descuento grande */}
                        <div className="relative bg-gradient-to-r from-red-500 to-orange-500 p-4">
                          <div className="absolute top-4 right-4 bg-white text-red-600 font-bold text-xl px-3 py-1 rounded-lg shadow-lg">
                            -{porcentajeDescuento}%
                          </div>
                          <div className="text-white text-center">
                            <div className="text-sm font-semibold uppercase tracking-wider">OFERTA EXCLUSIVA</div>
                            <div className="text-2xl font-bold mt-1">${producto.precio_oferta.toLocaleString('es-ES')}</div>
                            <div className="text-sm opacity-90 line-through">
                              ${producto.precio.toLocaleString('es-ES')}
                            </div>
                          </div>
                        </div>

                        {/* Imagen */}
                        <div className="p-6">
                          <Link href={`/products/${producto.id}`} className="block">
                            <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          </Link>
                        </div>

                        {/* Info del producto */}
                        <div className="px-6 pb-6 flex-1">
                          {producto.marcas && (
                            <div className="mb-2">
                              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                                {producto.marcas.nombre}
                              </span>
                            </div>
                          )}
                          
                          <Link href={`/products/${producto.id}`}>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                              {producto.nombre}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-2 mb-4">
                            <Palette size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{producto.color}</span>
                          </div>

                          {/* Ahorro */}
                          <div className="mb-1 p-1 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap size={16} className="text-green-600" />
                                <span className="text-sm font-medium text-green-700">¡VOS AHORRÁS!</span>
                              </div>
                              <span className="font-bold text-green-700">
                                ${(producto.precio - producto.precio_oferta).toLocaleString('es-ES')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botón */}
                        <div className="px-2 pb-2">
                          <Link href={`/products/${producto.id}`}>
                            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                              VER OFERTA
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Flame size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {productosConOferta.length === 0 
                    ? "¡Ups! No hay ofertas disponibles en este momento" 
                    : "No hay ofertas que coincidan con tus filtros"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {productosConOferta.length === 0
                    ? "Vuelve pronto para descubrir nuestras próximas ofertas especiales."
                    : "Prueba ajustando los criterios de búsqueda o limpiando los filtros."}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Filtros para Ofertas
function OfertasFiltros({
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
    <div className="space-y-8">
      {/* Marcas */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Marcas</h3>
        <div className="space-y-2">
          {marcasDisponibles.map((marca) => (
            <button
              key={marca.id}
              onClick={() => setFiltroMarcaSeleccionada(filtroMarcaSeleccionada === marca.id ? null : marca.id)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                filtroMarcaSeleccionada === marca.id
                  ? 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                filtroMarcaSeleccionada === marca.id 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <Tag size={16} />
              </div>
              <span className={`font-medium ${
                filtroMarcaSeleccionada === marca.id ? 'text-orange-700' : 'text-gray-700'
              }`}>
                {marca.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Colores</h3>
        <div className="flex flex-wrap gap-2">
          {coloresDisponibles.map((color) => (
            <button
              key={color}
              onClick={() => setFiltroColorSeleccionado(filtroColorSeleccionado === color ? null : color)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative overflow-hidden ${
                filtroColorSeleccionado === color
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Precio */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Precio de oferta</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Mínimo: <span className="font-bold text-blue-600">${precioMinimo.toLocaleString('es-ES')}</span></span>
              <span className="text-gray-600">Máximo: <span className="font-bold text-blue-600">${precioMaximo.toLocaleString('es-ES')}</span></span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div 
                className="absolute h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                style={{ 
                  left: `${(precioMinimo / 1000000) * 100}%`, 
                  width: `${((precioMaximo - precioMinimo) / 1000000) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between mt-4">
              <input
                type="range"
                min="0"
                max="1000000"
                value={precioMinimo}
                onChange={(e) => setPrecioMinimo(Number(e.target.value))}
                className="w-1/2"
              />
              <input
                type="range"
                min="0"
                max="1000000"
                value={precioMaximo}
                onChange={(e) => setPrecioMaximo(Number(e.target.value))}
                className="w-1/2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ahorro estimado */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={20} className="text-green-600" />
          <h4 className="font-semibold text-green-800">¿Sabías que?</h4>
        </div>
        <p className="text-sm text-green-700">
          En promedio, nuestros clientes ahorran <span className="font-bold">25%</span> comprando productos en oferta.
        </p>
      </div>
    </div>
  );
}
