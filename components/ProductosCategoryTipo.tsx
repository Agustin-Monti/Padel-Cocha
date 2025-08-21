"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { getProductosPorCategoriaYTipo, getTiposDeProductosPorCategoria } from "@/actions/products-category-actions";
import Link from 'next/link';


type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  tipo_id: string;
  color: string;
  oferta_activa?: boolean;
  precio_oferta: number;
};

type TipoProducto = {
  id: string;
  nombre: string;
};

export default function ProductosCategoryTipo() {
  const params = useParams() as Record<string, string | string[]>;
  const categoriaId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const tipoId = Array.isArray(params?.tipo) ? params.tipo[0] : params?.tipo || null;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiposProductos, setTiposProductos] = useState<TipoProducto[]>([]);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string | null>(null);
  const [coloresDisponibles, setColoresDisponibles] = useState<string[]>([]);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(1000000);
  const [filtroColorSeleccionado, setFiltroColorSeleccionado] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (categoriaId && tipoId) {
      getProductosPorCategoriaYTipo(categoriaId, tipoId).then((productos) => {
        setProductos(productos);
        const colores = Array.from(new Set(productos.map((p) => p.color)));
        setColoresDisponibles(colores);
      });

      getTiposDeProductosPorCategoria(categoriaId).then((tipos) => {
        setTiposProductos(tipos);
      });
    }
  }, [categoriaId, tipoId]);

  const productosFiltrados = productos.filter((p) => {
    const dentroRangoPrecio = p.precio >= precioMinimo && p.precio <= precioMaximo;
    const cumpleFiltroTipo = filtroSeleccionado ? p.tipo_id === filtroSeleccionado : true;
    const cumpleFiltroColor = filtroColorSeleccionado ? p.color === filtroColorSeleccionado : true;
    return cumpleFiltroTipo && cumpleFiltroColor && dentroRangoPrecio;
  });

  const filtros = (
    <>
      <h2 className="text-lg font-semibold mb-4">Filtrar:</h2>

      <h3 className="text-md font-medium mt-4 mb-2">Colores</h3>
      <ul className="border-b-2">
        {coloresDisponibles.map((color) => (
          <li key={color} className="mb-4">
            <label className="flex items-center space-x-4">
              <input
                type="checkbox"
                className="form-checkbox scale-150"
                checked={filtroColorSeleccionado === color}
                onChange={() =>
                  setFiltroColorSeleccionado(filtroColorSeleccionado === color ? null : color)
                }
              />
              <span className="text-xl font-medium">{color}</span>
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
          setPrecioMinimo(0);
          setPrecioMaximo(1000000);
        }}
        className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 rounded-md transition-all"
      >
        Reiniciar filtros
      </button>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-6 items-start">
      {/* Botón para abrir modal en móvil */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#816b4b] text-white px-4 py-2 rounded shadow hover:bg-[#6b563c] transition-all"
        >
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Sidebar de filtros en desktop */}
      <aside className="hidden lg:block w-1/4 pr-6">{filtros}</aside>

      {/* Modal en móvil */}
      {isModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#e6dfd6] w-full rounded-t-xl p-6 shadow-xl animate-slideUp z-50">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-4 text-gray-600 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
            {filtros}
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <section
        className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 pb-8"
        style={{ backgroundColor: '#e6dfd6' }}
      >
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => {
            const mostrarOferta = producto.oferta_activa && producto.precio_oferta;
            const porcentajeDescuento = mostrarOferta
              ? Math.round(100 - (producto.precio_oferta! * 100) / producto.precio)
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
          <div className="w-full flex justify-center items-center text-center py-20">
            <p className="text-xl font-semibold text-gray-500">No hay productos disponibles.</p>
          </div>
        )}
      </section>
    </div>
  );
}
