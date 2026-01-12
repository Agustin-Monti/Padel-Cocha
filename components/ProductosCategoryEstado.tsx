"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { getProductosPorCategoriaYEstado } from "@/actions/productos-actions";
import Link from 'next/link';

type Producto = {
  id: any;
  nombre: any;
  precio: any;
  imagen: any;
  tipo_id: any;
  color: any;
  estado: any;
  oferta_activa: any;
  precio_oferta: any;
  categoria_nombre?: any;
  marca_nombre?: any; // Cambiado de marcas a marca_nombre
  tipo_nombre?: any;
  marca_id?: any; // Opcional si no viene siempre
};

export default function ProductosCategoryEstado() {
  const params = useParams() as Record<string, string | undefined>;
  const categoriaId = params?.id ?? null;
  const estado = params?.estado ?? null;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<string[]>([]);
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(1000000);
  const [filtroColorSeleccionado, setFiltroColorSeleccionado] = useState<string | null>(null);
  const [filtroMarcaSeleccionada, setFiltroMarcaSeleccionada] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreEstado, setNombreEstado] = useState<string>("");

  useEffect(() => {
    console.log("useEffect ejecutado con categoriaId:", categoriaId, "estado:", estado);
    
    if (categoriaId && estado) {
      // Capitalizar el nombre del estado para mostrarlo
      const estadoCapitalizado = estado.charAt(0).toUpperCase() + estado.slice(1);
      setNombreEstado(estadoCapitalizado);

      getProductosPorCategoriaYEstado(categoriaId, estado).then((productos) => {
        console.log("Productos recibidos en cliente:", productos);
        setProductos(productos);
        
        // Obtener colores únicos
        const colores = Array.from(new Set(productos.map((p) => p.color)));
        setColoresDisponibles(colores);
        
        // Obtener marcas únicas - USANDO marca_nombre en lugar de marcas
        const marcasMap = new Map<string, string>();
        productos.forEach((producto) => {
          if (producto.marca_nombre) {
            // Si no tenemos marca_id, generamos un ID temporal basado en el nombre
            const marcaId = producto.marca_nombre.toLowerCase().replace(/\s+/g, '-');
            marcasMap.set(marcaId, producto.marca_nombre);
          }
        });
        
        // Convertir el Map a array de objetos
        const marcasArray = Array.from(marcasMap.entries()).map(([id, nombre]) => ({ id, nombre }));
        setMarcasDisponibles(marcasArray);
      });
    }
  }, [categoriaId, estado]);

  const productosFiltrados = productos.filter((p) => {
    const dentroRango = p.precio >= precioMinimo && p.precio <= precioMaximo;
    const cumpleColor = filtroColorSeleccionado ? p.color === filtroColorSeleccionado : true;
    
    // Filtrar por marca - usando marca_nombre si no hay marca_id
    let cumpleMarca = true;
    if (filtroMarcaSeleccionada) {
      if (p.marca_id) {
        cumpleMarca = p.marca_id === filtroMarcaSeleccionada;
      } else if (p.marca_nombre) {
        const marcaIdDeProducto = p.marca_nombre.toLowerCase().replace(/\s+/g, '-');
        cumpleMarca = marcaIdDeProducto === filtroMarcaSeleccionada;
      }
    }
    
    return dentroRango && cumpleColor && cumpleMarca;
  });

  const filtros = (
    <>
      <h2 className="text-lg font-semibold mb-4">Filtrar:</h2>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 font-medium">Mostrando productos: <span className="font-bold">{nombreEstado}</span></p>
      </div>

      {/* Filtro por colores */}
      <h3 className="text-md font-medium mt-4 mb-2">Colores</h3>
      <ul className="border-b-2">
        <li key="todos-colores" className="mb-4">
          <label className="flex items-center space-x-4">
            <input
              type="radio"
              name="color"
              className="form-radio scale-150"
              checked={filtroColorSeleccionado === null}
              onChange={() => setFiltroColorSeleccionado(null)}
            />
            <span className="text-xl font-medium">Todos los colores</span>
          </label>
        </li>
        
        {coloresDisponibles.map((color) => (
          <li key={color} className="mb-4">
            <label className="flex items-center space-x-4">
              <input
                type="radio"
                name="color"
                className="form-radio scale-150"
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

      {/* Filtro por marcas */}
      {marcasDisponibles.length > 0 && (
        <>
          <h3 className="text-md font-medium mt-4 mb-2">Marcas</h3>
          <ul className="border-b-2">
            <li key="todas-marcas" className="mb-4">
              <label className="flex items-center space-x-4">
                <input
                  type="radio"
                  name="marca"
                  className="form-radio scale-150"
                  checked={filtroMarcaSeleccionada === null}
                  onChange={() => setFiltroMarcaSeleccionada(null)}
                />
                <span className="text-xl font-medium">Todas las marcas</span>
              </label>
            </li>
            
            {marcasDisponibles.map((marca) => (
              <li key={marca.id} className="mb-4">
                <label className="flex items-center space-x-4">
                  <input
                    type="radio"
                    name="marca"
                    className="form-radio scale-150"
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
        </>
      )}

      {/* Filtro por rango de precio */}
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

      {/* Botón para reiniciar filtros */}
      <button
        onClick={() => {
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

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-6 items-start">
      {/* Título de estado en móvil */}
      <div className="lg:hidden w-full mb-4">
        <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded-r">
          <h1 className="text-xl font-bold text-blue-800">
            Productos: <span className="font-extrabold">{nombreEstado}</span>
          </h1>
          <p className="text-blue-600 mt-1">
            Mostrando {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} {nombreEstado.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Botón para filtros en móvil */}
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
      <aside className="hidden lg:block w-1/4 pr-6">
        {filtros}
      </aside>

      {/* Modal de filtros en móvil */}
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
                    
                    {/* Etiqueta de estado */}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md z-10">
                      {nombreEstado}
                    </div>
                    
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

                  {/* Marca si está disponible */}
                  {producto.marca_nombre && (
                    <p className="text-sm font-medium text-gray-600">
                      {producto.marca_nombre}
                    </p>
                  )}

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
          <div className="w-full col-span-4 flex justify-center items-center text-center py-20">
            <div className="bg-white p-8 rounded-xl shadow-md max-w-md">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                No hay productos {nombreEstado.toLowerCase()} disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                No encontramos productos {nombreEstado.toLowerCase()} con los filtros aplicados.
              </p>
              <button
                onClick={() => {
                  setFiltroColorSeleccionado(null);
                  setFiltroMarcaSeleccionada(null);
                  setPrecioMinimo(0);
                  setPrecioMaximo(1000000);
                }}
                className="inline-block bg-[#816b4b] text-white px-4 py-2 rounded hover:bg-[#6b563c] transition-all mr-2"
              >
                Reiniciar filtros
              </button>
              <Link 
                href={`/products-category/${categoriaId}`}
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
              >
                Ver todos los productos
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

