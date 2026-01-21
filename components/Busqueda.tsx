"use client";

import { useState, useEffect, useRef } from "react";
import { buscarProductosPorNombre } from "@/actions/productos-actions";
import Link from "next/link";
import { Search, X, ChevronLeft, ChevronRight, Tag, CreditCard, Zap, ImageIcon } from "lucide-react";

interface BusquedaProps {
  isOpen: boolean;
  onClose: () => void;
}

const Busqueda = ({ isOpen, onClose }: BusquedaProps) => {
  const [query, setQuery] = useState("");
  const [productos, setProductos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = 6;

  // Focus en el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Click fuera para cerrar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        setIsLoading(true);
        buscarProductosPorNombre(query, page, limit).then(({ data, total }) => {
          setProductos(data);
          setTotal(total);
          setIsLoading(false);
        });
      } else {
        setProductos([]);
        setTotal(0);
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, page]);

  const totalPages = Math.ceil(total / limit);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const resetBusqueda = () => {
    setQuery("");
    setPage(1);
    setProductos([]);
    setTotal(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-[9999] p-0 md:p-4 animate-fadeIn overflow-y-auto">
      <div 
        ref={modalRef}
        className="rounded-none md:rounded-2xl w-full min-h-screen md:min-h-auto md:max-w-6xl md:p-6 relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 shadow-2xl border-0 md:border border-white/10 animate-slideUp"
      >
        {/* Header - Sticky en móvil */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-0 md:relative md:bg-transparent">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Buscar productos
                </h2>
                <p className="text-xs md:text-sm text-gray-300">Encuentra lo que necesitas rápidamente</p>
              </div>
            </div>
            
            <button
              onClick={resetBusqueda}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 group"
              aria-label="Cerrar búsqueda"
            >
              <X className="w-6 h-6 text-gray-300 group-hover:text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-6 md:mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Escribe al menos 2 letras para buscar..."
              className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-10 py-3 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-base md:text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido desplazable */}
        <div className="px-4 pb-20 md:px-0 md:pb-6 overflow-y-auto max-h-[calc(100vh-180px)] md:max-h-[60vh]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">Buscando productos...</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && productos.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-300">
                  <span className="font-semibold text-white">{total}</span> productos encontrados
                </p>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="w-4 h-4" />
                  <span>Tiempo real</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6">
                {productos.map((producto) => {
                  const mostrarOferta = producto.precio_oferta != null;
                  const precioEfectivo = mostrarOferta
                    ? producto.precio_oferta * 0.85
                    : producto.precio * 0.85;
                  const cuotas = mostrarOferta
                    ? producto.precio_oferta / 3
                    : producto.precio / 3;

                  return (
                    <Link
                      key={producto.id}
                      href={`/products/${producto.id}`}
                      prefetch={false}
                      onClick={onClose}
                    >
                      <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/10 hover:border-cyan-400/30 hover:shadow-xl md:hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                        {/* Badge de Oferta */}
                        {mostrarOferta && (
                          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                              <Tag className="w-3 h-3" />
                              <span>
                                -{Math.round(
                                  100 - (producto.precio_oferta * 100) / producto.precio
                                )}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Imagen */}
                        <div className="relative mb-4 flex-grow min-h-[180px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
                          <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="max-h-[180px] w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '140px'
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          
                          {!producto.imagen && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                              <ImageIcon className="w-10 h-10 md:w-12 md:h-12 mb-2" />
                              <span className="text-xs md:text-sm">Sin imagen</span>
                            </div>
                          )}
                        </div>

                        {/* Contenido de texto */}
                        <div className="flex flex-col flex-grow">
                          {/* Nombre */}
                          <h3 className="text-sm font-semibold text-white mb-2 md:mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors min-h-[40px] flex items-start">
                            {producto.nombre}
                          </h3>

                          {/* Precios */}
                          <div className="space-y-2 mt-auto">
                            {mostrarOferta ? (
                              <div className="flex items-center gap-2 md:gap-3">
                                <span className="text-base md:text-lg line-through text-gray-400">
                                  ${producto.precio.toLocaleString("es-ES")}
                                </span>
                                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                                  ${producto.precio_oferta.toLocaleString("es-ES")}
                                </span>
                              </div>
                            ) : (
                              <p className="text-xl md:text-2xl font-bold text-white">
                                ${producto.precio.toLocaleString("es-ES")}
                              </p>
                            )}

                            {/* Efectivo */}
                            <div className="flex items-center gap-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-2 rounded-lg">
                              <div className="w-7 h-7 md:w-8 md:h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-emerald-300">$</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-gray-300 truncate">EFECTIVO 15% OFF</p>
                                <p className="text-sm font-bold text-emerald-300 truncate">
                                  ${precioEfectivo.toLocaleString("es-ES", {
                                    minimumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Cuotas */}
                            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-2 rounded-lg">
                              <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-3 h-3 md:w-4 md:h-4 text-blue-300" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-gray-300 truncate">3 CUOTAS SIN INTERÉS</p>
                                <p className="text-sm font-bold text-blue-300 truncate">
                                  ${cuotas.toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                  })}
                                  <span className="text-xs font-normal text-gray-400"> c/u</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Paginación - Mejorada para móvil */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 md:mt-8 pt-6 border-t border-white/10 gap-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 group order-2 md:order-1"
                  >
                    <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
                    <span className="text-white">Anterior</span>
                  </button>
                  
                  <div className="flex items-center gap-1 md:gap-2 order-1 md:order-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number; // ← Aquí declaras el tipo
                  
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all duration-200 text-sm md:text-base ${
                            page === pageNum
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                              : "bg-white/5 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span className="text-gray-400 px-2">...</span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 group order-3"
                  >
                    <span className="text-white">Siguiente</span>
                    <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && productos.length === 0 && (
            <div className="text-center py-12 md:py-16">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No se encontraron productos</h3>
              <p className="text-gray-400 max-w-md mx-auto px-4">
                No hay resultados para "<span className="text-white font-medium">{query}</span>".
                Intenta con otras palabras o busca productos similares.
              </p>
            </div>
          )}

          {/* Sugerencias */}
          {!isLoading && query.length < 2 && (
            <div className="text-center py-8 md:py-12">
              <div className="inline-block p-3 md:p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl mb-4 md:mb-6">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Comienza a buscar</h3>
              <p className="text-gray-400 mb-6 md:mb-8 px-4">
                Escribe al menos 2 caracteres para ver resultados en tiempo real
              </p>
            </div>
          )}
        </div>

        {/* Espacio para el botón en móvil */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
          <button
            onClick={resetBusqueda}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 backdrop-blur-sm"
          >
            Cerrar búsqueda
          </button>
        </div>
      </div>
    </div>
  );
};

export default Busqueda;

