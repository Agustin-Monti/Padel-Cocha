"use client";

import React, { useEffect, useState , useCallback } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { fetchProductos, getProductoById, eliminarProductoById, guardarOferta, guardarValorado, buscarProductosAdmin  } from '@/actions/productos-actions';
import Link from "next/link";
import EditarProducto from "@/components/EditarProducto";
import { PencilIcon, TrashIcon, PhotoIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import GaleriaModal from '@/components/GaleriaModal';
import ModalOferta from "@/components/ModalOferta";
import { XCircle, AlertTriangle, CheckCircle } from "lucide-react";

type Producto = {
  id: number; // CAMBIADO: de string a number
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  grupo_variantes: string;
  color: string;
  categoria_id: string;
  marca_id: string;
  tipo_id: string;
  oferta_activa: boolean;
  precio_oferta: number;
  peso: string;
  descripcion: string;
  estado: string;
  valorado: boolean;
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [ofertaModalOpen, setOfertaModalOpen] = useState(false);
  const [productoId, setProductoId] = useState<number | null>(null); // CAMBIADO: de string a number
  const [productoDetalles, setProductoDetalles] = useState<Producto | null>(null);
  const [precioBase, setPrecioBase] = useState<number>(0);
  const [ofertaActiva, setOfertaActiva] = useState<boolean>(false);
  const [precioOferta, setPrecioOferta] = useState<number>(0);
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const obtenerProductos = async () => {
      setLoading(true);
      const data = await fetchProductos();
      setProductos(data);
      setProductosFiltrados(data);
      setLoading(false);
    };

    obtenerProductos();
  }, []);

  const buscarProductos = useCallback(async (termino: string) => {
    setLoading(true);
    
    if (termino.trim() === '') {
      // Si la búsqueda está vacía, mostrar todos los productos
      const data = await fetchProductos();
      setProductosFiltrados(data);
    } else {
      // Buscar productos por nombre
      const resultados = await buscarProductosAdmin(termino);
      setProductosFiltrados(resultados);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      buscarProductos(busqueda);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, buscarProductos]);

  // Función para limpiar búsqueda
  const limpiarBusqueda = () => {
    setBusqueda('');
  };

  // Función para manejar el cambio en la búsqueda
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  // CORREGIDO: Acepta number
  const openEditModal = async (id: number) => {
    try {
      setProductoId(id);
      setEditModalOpen(true);
      
      // Convertir a string para getProductoById si espera string
      const data = await getProductoById(String(id));
      setProductoDetalles({
        ...data,
        id: Number(data.id) // Asegurar que id sea number
      });
    } catch (error) {
      console.error('Error al obtener el producto:', error);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setProductoId(null);
    setProductoDetalles(null);
  };

  // CORREGIDO: Acepta number
  const openGalleryModal = (id: number) => {
    setProductoId(id);
    setGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setGalleryModalOpen(false);
    setProductoId(null);
  };

  // CORREGIDO: Acepta number
  const openOfertaModal = async (id: number) => {
    try {
      setProductoId(id);
      // Convertir a string si es necesario
      const producto = await getProductoById(String(id));
      setPrecioBase(producto.precio);

      if (producto.oferta_activa && producto.precio_oferta) {
        setOfertaActiva(true);
        setPrecioOferta(producto.precio_oferta);
      } else {
        setOfertaActiva(false);
        setPrecioOferta(0);
      }

      setOfertaModalOpen(true);
    } catch (error) {
      console.error('Error al obtener el producto:', error);
    }
  };

  const closeOfertaModal = () => {
    setOfertaModalOpen(false);
    setProductoId(null);
    setPrecioBase(0);
  };

  // CORREGIDO: Acepta number
  const handleValoradoToggle = async (id: number, nuevoValor: boolean) => {
    try {
      await guardarValorado(String(id), nuevoValor);
      const actualizados = await fetchProductos();
      setProductos(actualizados);

      Swal.fire({
        icon: 'success',
        title: nuevoValor ? 'Producto destacado' : 'Destacado quitado',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error al actualizar valorado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado de valorado.',
      });
    }
  };

  const handleSubmitOferta = async (oferta: { oferta_activa: boolean; precio_oferta: number }) => {
    try {
      if (productoId) {
        await guardarOferta(String(productoId), oferta);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Oferta guardada correctamente.',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
        closeOfertaModal();
      }
    } catch (error) {
      console.error('Error al guardar la oferta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar la oferta.',
      });
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = await fetchProductos();
      setProductos(updatedData);

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Producto actualizado correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el producto.',
      });
    }
  };

  // CORREGIDO: Acepta number
  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `El producto con ID ${id} será eliminado permanentemente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        const eliminado = await eliminarProductoById(id);

        if (eliminado) {
          const data = await fetchProductos();
          setProductos(data);

          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: `Producto con ID ${id} eliminado correctamente.`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el producto.',
          });
        }
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Cancelado',
          text: 'La acción de eliminación fue cancelada.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el producto.',
      });
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: (row: Producto) => row.id,
      sortable: true,
      width: '100px', // Más compacto
      center: true,
    },
    {
      name: 'Nombre',
      selector: (row: Producto) => row.nombre,
      sortable: true,
      wrap: true,
      cell: (row: Producto) => (
        <div className="py-2">
          <span className="font-medium text-gray-900">{row.nombre}</span>
        </div>
      ),
      minWidth: '400px', // Tamaño más razonable
      maxWidth: '450px', // Limitar el ancho máximo
    },
    {
      name: 'Precio',
      cell: (row: Producto) => (
        <div className="text-right w-full font-medium">
          ${row.precio.toLocaleString('es-AR')}
        </div>
      ),
      sortable: true,
      width: '200px',
      right: true,
    },
    {
      name: 'Stock',
      cell: (row: Producto) => {
        if (row.stock === 0) {
          return (
            <div className="flex items-center gap-1 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-lg shadow-sm w-fit">
              <XCircle size={14} />
              <span>Sin stock</span>
            </div>
          );
        } else if (row.stock <= 4) {
          return (
            <div className="flex items-center gap-1 text-yellow-700 text-xs bg-yellow-50 px-2 py-1 rounded-lg shadow-sm w-fit">
              <AlertTriangle size={14} />
              <span>Mínimo ({row.stock})</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-1 text-green-700 text-xs bg-green-50 px-2 py-1 rounded-lg shadow-sm w-fit">
              <CheckCircle size={14} />
              <span>Stock ({row.stock})</span>
            </div>
          );
        }
      },
      sortable: true,
      width: '300px',
      center: true,
    },
    {
      name: 'Imagen',
      cell: (row: Producto) => (
        <div className="flex justify-center">
          <img
            src={row.imagen}
            alt={row.nombre}
            width={50}
            height={50}
            className="rounded-md shadow object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
      ),
      width: '250px',
      center: true,
    },
    {
      name: "Acciones",
      cell: (row: Producto) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEditModal(row.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-md shadow w-8 h-8 flex items-center justify-center transition-colors"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md shadow w-8 h-8 flex items-center justify-center transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => openGalleryModal(row.id)}
            className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-md shadow w-8 h-8 flex items-center justify-center transition-colors"
            title="Galería"
          >
            <PhotoIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => openOfertaModal(row.id)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-1.5 rounded-md shadow w-8 h-8 flex items-center justify-center transition-colors"
            title="Ofertas"
          >
            <BuildingStorefrontIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleValoradoToggle(row.id, !row.valorado)}
            className={`${
              row.valorado ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 hover:bg-gray-500'
            } text-white p-1.5 rounded-md shadow w-8 h-8 flex items-center justify-center transition-colors`}
            title={row.valorado ? "Quitar destacado" : "Destacar producto"}
          >
            ⭐
          </button>
        </div>
      ),
      width: '350px',
      center: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontWeight: '600',
        fontSize: '13px',
        borderBottom: '2px solid #e2e8f0',
        paddingTop: '12px',
        paddingBottom: '12px',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        paddingTop: '10px',
        paddingBottom: '10px',
        color: '#1e293b', // Color más oscuro para mejor contraste
      },
    },
    rows: {
      style: {
        minHeight: '65px',
        backgroundColor: '#ffffff',
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #f1f5f9',
        },
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e2e8f0',
        paddingTop: '16px',
        paddingBottom: '16px',
        fontSize: '14px',
      },
      pageButtonsStyle: {
        color: '#3b82f6',
        fill: '#3b82f6',
        backgroundColor: 'transparent',
        '&:disabled': {
          color: '#94a3b8',
          cursor: 'not-allowed',
        },
        '&:hover:not(:disabled)': {
          backgroundColor: '#eff6ff',
        },
      },
    },
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">Administra tu catálogo de productos</p>
        </div>
        
        <Link href="/admin/dashboard/productos/agregar">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 w-full md:w-auto justify-center">
            <span className="font-semibold">+ Nuevo Producto</span>
          </button>
        </Link>
      </div>

      {/* Barra de búsqueda corregida */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={handleBusquedaChange}
              placeholder="Buscar por nombre de producto..."
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>
        
        {/* Información de resultados */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-700">
            {busqueda ? (
              <>
                <span className="font-semibold">{productosFiltrados.length}</span> resultado{productosFiltrados.length !== 1 ? 's' : ''} para "
                <span className="font-semibold text-blue-600">{busqueda}</span>"
              </>
            ) : (
              <>
                Total: <span className="font-semibold">{productosFiltrados.length}</span> producto{productosFiltrados.length !== 1 ? 's' : ''}
              </>
            )}
          </span>
          
          {busqueda && productosFiltrados.length > 0 && (
            <button
              onClick={limpiarBusqueda}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white hover:text-blue-800 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors min-w-[140px] justify-center"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Limpiar Busqueda</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Buscando productos...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={productosFiltrados}
            pagination
            paginationPerPage={7}
            paginationRowsPerPageOptions={[7, 15, 25, 50]}
            paginationComponentOptions={{
              rowsPerPageText: 'Filas por página:',
              rangeSeparatorText: 'de',
              selectAllRowsItem: true,
              selectAllRowsItemText: 'Todos',
            }}
            highlightOnHover
            responsive
            customStyles={customStyles}
            noDataComponent={
              <div className="text-center py-10 px-4">
                <div className="text-gray-400 mb-3">
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto opacity-50" />
                </div>
                {busqueda ? (
                  <>
                    <p className="text-gray-700 text-lg font-medium mb-2">No se encontraron productos</p>
                    <p className="text-gray-500">No hay resultados para "<span className="font-medium">{busqueda}</span>"</p>
                    <button
                      onClick={limpiarBusqueda}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      ← Ver todos los productos
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 text-lg font-medium mb-2">No hay productos</p>
                    <p className="text-gray-500">Comienza agregando tu primer producto</p>
                    <Link href="/admin/dashboard/productos/agregar">
                      <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Agregar primer producto
                      </button>
                    </Link>
                  </>
                )}
              </div>
            }
          />
        )}
      </div>

      {/* Modales (mantén los modales existentes) */}
      <EditarProducto
        isOpen={editModalOpen}
        onClose={closeEditModal}
        productoId={productoId ? String(productoId) : null}
        productoDetalles={productoDetalles}
        onSave={handleSave}
      />

      <GaleriaModal
        isOpen={galleryModalOpen}
        onClose={closeGalleryModal}
        productoId={productoId ? String(productoId) : ''}
      />

      <ModalOferta
        isOpen={ofertaModalOpen}
        onClose={closeOfertaModal}
        productoId={productoId ? String(productoId) : null}
        onSubmit={handleSubmitOferta}
        precioBase={precioBase}
        ofertaActiva={ofertaActiva}
        precioOferta={precioOferta}
      />
    </div>
  );
}
