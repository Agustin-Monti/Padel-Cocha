"use client";

import { useState, useEffect } from "react";
import { buscarProductosPorNombre } from "@/actions/productos-actions";
import Link from "next/link";

interface BusquedaProps {
  isOpen: boolean;
  onClose: () => void;
}

const Busqueda = ({ isOpen, onClose }: BusquedaProps) => {
  const [query, setQuery] = useState("");
  const [productos, setProductos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        buscarProductosPorNombre(query, page, limit).then(({ data, total }) => {
          setProductos(data);
          setTotal(total);
        });
      } else {
        setProductos([]);
        setTotal(0);
      }
    }, 300);

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="rounded-lg w-full max-w-[1200px] p-6 relative max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#e6dfd6' }}>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
          onClick={resetBusqueda}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Buscar productos</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Nombre del producto..."
          className="w-full border rounded-md px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#816b4b]"
        />

        {/* Resultados */}
        {productos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map((producto) => {
                const mostrarOferta = producto.precio_oferta != null;
                const precioEfectivo = mostrarOferta
                  ? producto.precio_oferta * 0.85
                  : producto.precio * 0.85;
                const cuotas = mostrarOferta
                  ? producto.precio_oferta / 3
                  : producto.precio / 3;

                return (
                  <div
                    key={producto.id}
                    className="bg-white shadow-lg text-center rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300 max-w-[340px] mx-auto"
                  >
                    <div className="relative">
                      {mostrarOferta && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-10">
                          -{Math.round(
                            100 - (producto.precio_oferta * 100) / producto.precio
                          )}
                          %
                        </div>
                      )}
                      <Link href={`/products/${producto.id}`} prefetch={false}>
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-[300px] object-cover rounded-xl mb-4 hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    </div>

                    <Link href={`/products/${producto.id}`} prefetch={false}>
                      <h3 className="text-md font-medium text-gray-800 mb-1 uppercase">
                        {producto.nombre}
                      </h3>
                    </Link>

                    {mostrarOferta ? (
                      <div className="flex justify-center items-center gap-2 text-base">
                        <span className="line-through text-gray-500">
                          ${producto.precio.toLocaleString("es-ES")}
                        </span>
                        <span className="text-xl font-semibold text-black">
                          ${producto.precio_oferta.toLocaleString("es-ES")}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-black mt-2">
                        ${producto.precio.toLocaleString("es-ES")}
                      </p>
                    )}

                    <p className="text-sm font-semibold text-green-800 mt-1">
                      ${precioEfectivo.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      con EFECTIVO 15% OFF
                    </p>
                    <p className="text-sm mt-2 font-medium text-gray-700">
                      3 <span className="font-semibold">cuotas sin interés</span>{" "}
                      de{" "}
                      <span className="font-bold">
                        ${cuotas.toLocaleString("es-ES", {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700 self-center">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : query.length >= 2 ? (
          <p className="text-gray-500 text-center">No se encontraron productos</p>
        ) : null}
      </div>
    </div>
  );
};

export default Busqueda;
