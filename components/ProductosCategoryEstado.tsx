"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { getProductosPorCategoriaYEstado } from "@/actions/products-category-actions";
import Link from 'next/link';

type Producto = {
  id: any;
  nombre: any;
  precio: any;
  imagen: any;
  tipo_id: any;
  forma: any; // Cambiado de color a forma
  estado: any;
  oferta_activa: any;
  precio_oferta: any;
  categoria_nombre?: any;
  marca_nombre?: any;
  tipo_nombre?: any;
  marca_id?: any;
  marcas?: { id: string; nombre: string }; // Agregado para manejar marcas mejor
};

export default function ProductosCategoryEstado() {
  const params = useParams() as Record<string, string | undefined>;
  const categoriaId = params?.id ?? null;
  const estado = params?.estado ?? null;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [formatosDisponibles, setFormatosDisponibles] = useState<string[]>([]); // Cambiado de colores a formatos
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(1000000);
  const [filtroFormatoSeleccionado, setFiltroFormatoSeleccionado] = useState<string | null>(null); // Cambiado
  const [filtroMarcaSeleccionada, setFiltroMarcaSeleccionada] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreEstado, setNombreEstado] = useState<string>("");
  const [cargando, setCargando] = useState(true);

  // Función para normalizar texto (igual que en el componente anterior)
  const normalizarTexto = (texto: string): string => {
    if (!texto) return '';
    return texto
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Función para obtener formatos únicos y normalizados
  const obtenerFormatosUnicos = (productos: Producto[]): string[] => {
    const formatosMap = new Map<string, string>();
    
    productos.forEach((producto) => {
      if (producto.forma) {
        const formatoNormalizado = normalizarTexto(producto.forma);
        const formatoOriginal = producto.forma.toString().trim();
        
        if (!formatosMap.has(formatoNormalizado)) {
          formatosMap.set(formatoNormalizado, formatoOriginal);
        }
      }
    });
    
    return Array.from(formatosMap.values())
      .sort((a, b) => a.localeCompare(b, 'es'));
  };

  // Función para obtener marcas únicas
  const obtenerMarcasUnicas = (productos: Producto[]): { id: string; nombre: string }[] => {
    const marcasMap = new Map<string, { id: string; nombre: string }>();
    
    productos.forEach((producto) => {
      if (producto.marca_id && producto.marca_nombre) {
        const marcaId = producto.marca_id.toString();
        const marcaNombre = producto.marca_nombre.toString().trim();
        
        if (!marcasMap.has(marcaId)) {
          marcasMap.set(marcaId, { id: marcaId, nombre: marcaNombre });
        }
      }
    });
    
    return Array.from(marcasMap.values())
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  };

  // Función para comparar si dos formatos son iguales (normalizados)
  const formatosSonIguales = (formato1: string | null, formato2: string | null): boolean => {
    if (!formato1 && !formato2) return true;
    if (!formato1 || !formato2) return false;
    return normalizarTexto(formato1) === normalizarTexto(formato2);
  };

  // Formatear texto para mostrar (primera letra mayúscula)
  const formatearTexto = (texto: string): string => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  useEffect(() => {
    console.log("useEffect ejecutado con categoriaId:", categoriaId, "estado:", estado);
    
    const cargarDatos = async () => {
      if (categoriaId && estado) {
        setCargando(true);
        try {
          const estadoCapitalizado = formatearTexto(estado);
          setNombreEstado(estadoCapitalizado);

          const productosData = await getProductosPorCategoriaYEstado(categoriaId, estado);
          console.log("Productos recibidos en cliente:", productosData);
          
          setProductos(productosData);
          
          // Obtener formatos únicos
          const formatosUnicos = obtenerFormatosUnicos(productosData);
          setFormatosDisponibles(formatosUnicos);
          
          // Obtener marcas únicas usando el ID real
          const marcasUnicas = obtenerMarcasUnicas(productosData);
          setMarcasDisponibles(marcasUnicas);
          
        } catch (error) {
          console.error("Error al cargar productos por estado:", error);
        } finally {
          setCargando(false);
        }
      }
    };

    cargarDatos();
  }, [categoriaId, estado]);

  const productosFiltrados = productos.filter((p) => {
    const dentroRango = p.precio >= precioMinimo && p.precio <= precioMaximo;
    const cumpleFormato = filtroFormatoSeleccionado 
      ? formatosSonIguales(p.forma, filtroFormatoSeleccionado) 
      : true;
    
    const cumpleMarca = filtroMarcaSeleccionada 
      ? p.marca_id?.toString() === filtroMarcaSeleccionada
      : true;
    
    return dentroRango && cumpleFormato && cumpleMarca;
  });

  const filtros = (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">Filtrar:</h2>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 font-medium">Mostrando productos: <span className="font-bold">{nombreEstado}</span></p>
        <p className="text-sm text-blue-600 mt-1">
          {productos.length} producto{productos.length !== 1 ? 's' : ''} {nombreEstado.toLowerCase()}
        </p>
      </div>

      {/* 1. FILTRO POR MARCAS */}
      {marcasDisponibles.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Marcas</h3>
          <ul className="border-b-2 pb-4">
            <li key="todas-marcas" className="mb-3">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="radio"
                    name="marca"
                    className="sr-only"
                    checked={filtroMarcaSeleccionada === null}
                    onChange={() => setFiltroMarcaSeleccionada(null)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${filtroMarcaSeleccionada === null 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-400 bg-white'}`}>
                    {filtroMarcaSeleccionada === null && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <span className="text-lg font-medium">Todas las marcas</span>
              </label>
            </li>
            
            {marcasDisponibles.map((marca) => (
              <li key={marca.id} className="mb-3">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="radio"
                      name="marca"
                      className="sr-only"
                      checked={filtroMarcaSeleccionada === marca.id}
                      onChange={() =>
                        setFiltroMarcaSeleccionada(filtroMarcaSeleccionada === marca.id ? null : marca.id)
                      }
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${filtroMarcaSeleccionada === marca.id 
                        ? 'border-blue-600 bg-blue-600' 
                        : 'border-gray-400 bg-white'}`}>
                      {filtroMarcaSeleccionada === marca.id && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-medium">{marca.nombre}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. FILTRO POR FORMATOS (REEMPLAZA COLORES) */}
      {formatosDisponibles.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Formatos</h3>
          <ul className="border-b-2 pb-4">
            <li key="todos-formatos" className="mb-3">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="radio"
                    name="formato"
                    className="sr-only"
                    checked={filtroFormatoSeleccionado === null}
                    onChange={() => setFiltroFormatoSeleccionado(null)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${filtroFormatoSeleccionado === null 
                      ? 'border-blue-600 bg-blue-600' 
                      : 'border-gray-400 bg-white'}`}>
                    {filtroFormatoSeleccionado === null && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <span className="text-lg font-medium">Todos los formatos</span>
              </label>
            </li>
            
            {formatosDisponibles.map((formato) => (
              <li key={formato} className="mb-3">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="radio"
                      name="formato"
                      className="sr-only"
                      checked={formatosSonIguales(filtroFormatoSeleccionado, formato)}
                      onChange={() =>
                        setFiltroFormatoSeleccionado(
                          formatosSonIguales(filtroFormatoSeleccionado, formato) ? null : formato
                        )
                      }
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${formatosSonIguales(filtroFormatoSeleccionado, formato) 
                        ? 'border-blue-600 bg-blue-600' 
                        : 'border-gray-400 bg-white'}`}>
                      {formatosSonIguales(filtroFormatoSeleccionado, formato) && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-medium">
                    {formatearTexto(formato)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. FILTRO POR RANGO DE PRECIO */}
      <div>
        <h3 className="text-md font-medium mb-2">Rango de precio</h3>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Desde: ${precioMinimo}</span>
            <span className="text-sm">Hasta: ${precioMaximo}</span>
          </div>
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

      {/* Botón para reiniciar filtros */}
      <button
        onClick={() => {
          setFiltroFormatoSeleccionado(null);
          setFiltroMarcaSeleccionada(null);
          setPrecioMinimo(0);
          setPrecioMaximo(1000000);
        }}
        className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-md transition-all active:bg-gray-400"
      >
        Reiniciar filtros
      </button>
    </div>
  );

  // Si está cargando, muestra un loading
  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#816b4b] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos {estado}...</p>
        </div>
      </div>
    );
  }

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

                  {/* Formato si está disponible */}
                  {producto.forma && (
                    <p className="text-sm font-medium text-[#816b4b]">
                      Formato: {formatearTexto(producto.forma.toString())}
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
                  setFiltroFormatoSeleccionado(null);
                  setFiltroMarcaSeleccionada(null);
                  setPrecioMinimo(0);
                  setPrecioMaximo(1000000);
                }}
                className="inline-block bg-[#816b4b] text-white px-4 py-2 rounded hover:bg-[#6b563c] transition-all mr-2 mb-2"
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
