"use client";

import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { fetchProductos, getProductoById, eliminarProductoById, guardarOferta, guardarValorado } from '@/actions/productos-actions';
import Link from "next/link";
import EditarProducto from "@/components/EditarProducto";
import { PencilIcon, TrashIcon, PhotoIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import GaleriaModal from '@/components/GaleriaModal';
import ModalOferta from "@/components/ModalOferta";
import { XCircle, AlertTriangle, CheckCircle } from "lucide-react";


type Producto = {
  id: string;
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
  valorado: boolean;
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [ofertaModalOpen, setOfertaModalOpen] = useState(false);
  const [productoId, setProductoId] = useState<string | null>(null);
  const [productoDetalles, setProductoDetalles] = useState<Producto | null>(null);
  const [precioBase, setPrecioBase] = useState<number>(0); // Nuevo estado para el precio base
  const [ofertaActiva, setOfertaActiva] = useState<boolean>(false);
  const [precioOferta, setPrecioOferta] = useState<number>(0);


  useEffect(() => {
    const obtenerProductos = async () => {
      const data = await fetchProductos();
      setProductos(data);
    };

    obtenerProductos();
  }, []);

  const openEditModal = async (id: string) => {
    try {
      setProductoId(id);
      setEditModalOpen(true);

      const data = await getProductoById(id);
      setProductoDetalles(data);
    } catch (error) {
      console.error('Error al obtener el producto:', error);
    }
  };


  const closeEditModal = () => {
    setEditModalOpen(false);
    setProductoId(null);
    setProductoDetalles(null);
  };

  const openGalleryModal = (id: string) => {
    setProductoId(id);
    setGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setGalleryModalOpen(false);
    setProductoId(null);
  };

  const openOfertaModal = async (id: string) => {
    try {
      setProductoId(id);
      const producto = await getProductoById(id); // Obtener detalles del producto
      setPrecioBase(producto.precio); // Establecer el precio base

      // Si el producto tiene una oferta activa, establecer los valores
      if (producto.oferta_activa && producto.precio_oferta) {
        setOfertaActiva(true);
        setPrecioOferta(producto.precio_oferta);
      } else {
        setOfertaActiva(false);
        setPrecioOferta(0); // Resetear precio oferta si no hay
      }

      setOfertaModalOpen(true);
    } catch (error) {
      console.error('Error al obtener el producto:', error);
    }
  };

  const closeOfertaModal = () => {
    setOfertaModalOpen(false);
    setProductoId(null);
    setPrecioBase(0); // Limpiar el precio base
  };

  const handleValoradoToggle = async (id: string, nuevoValor: boolean) => {
    try {
      await guardarValorado(id, nuevoValor);
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
          await guardarOferta(productoId, oferta); // Guardar la oferta
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Oferta guardada correctamente.',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload(); // Recargar la página después de la alerta
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

  const handleDelete = async (id: string) => {
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
    },
    {
      name: 'Nombre',
      selector: (row: Producto) => row.nombre,
      sortable: true,
    },
    {
      name: 'Precio',
      cell: (row: Producto) => (
        <div className="text-right w-full pr-2">
          ${row.precio.toFixed(2)}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Stock',
      cell: (row: Producto) => {
        if (row.stock === 0) {
          return (
            <div className="flex items-center gap-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded-lg shadow-sm">
              <XCircle size={16} />
              <span>Sin stock</span>
            </div>
          );
        } else if (row.stock <= 4) {
          return (
            <div className="flex items-center gap-1 text-yellow-700 text-sm bg-yellow-50 px-2 py-1 rounded-lg shadow-sm">
              <AlertTriangle size={16} />
              <span>Stock mínimo ({row.stock})</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-1 text-green-700 text-sm bg-green-50 px-2 py-1 rounded-lg shadow-sm">
              <CheckCircle size={16} />
              <span>Disponible ({row.stock})</span>
            </div>
          );
        }
      },
      sortable: true,
    },
    {
      name: 'Imagen',
      cell: (row: Producto) => (
        <img
          src={row.imagen}
          alt={row.nombre}
          width={50}
          className="rounded-md shadow"
        />
      ),
    },
    {
      name: "Acciones",
      cell: (row: Producto) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-md shadow w-8 h-8 flex items-center justify-center"
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md shadow w-8 h-8 flex items-center justify-center"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => openGalleryModal(row.id)}
            className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-md shadow w-8 h-8 flex items-center justify-center"
            title="Ver Galería"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => openOfertaModal(row.id)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded-md shadow w-8 h-8 flex items-center justify-center"
            title="Ofertas"
          >
            <BuildingStorefrontIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleValoradoToggle(row.id, !row.valorado)}
            className={`${
              row.valorado ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 hover:bg-gray-500'
            } text-white p-1 rounded-md shadow w-8 h-8 flex items-center justify-center`}
            title="Destacar producto"
          >
            ⭐
          </button>

        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f3f4f6',
        color: '#111827',
        fontWeight: '600',
        fontSize: '14px',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
        paddingTop: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f3f4f6',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        backgroundColor: '#ffffff',
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #f3f4f6',
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f9fafb',
        cursor: 'pointer',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e5e7eb',
        paddingTop: '12px',
        paddingBottom: '12px',
      },
    },
  };


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">Página de Productos</h1>

      <Link href="/admin/dashboard/productos/agregar">
        <p className="bg-green-500 text-white p-2 rounded mb-4 inline-block">
          Agregar Nuevo Producto
        </p>
      </Link>

      <DataTable
        columns={columns}
        data={productos}
        pagination
        highlightOnHover
        responsive
        customStyles={customStyles}
      />


      <EditarProducto
        isOpen={editModalOpen}
        onClose={closeEditModal}
        productoId={productoId}
        productoDetalles={productoDetalles}
        onSave={handleSave}
      />

      <GaleriaModal
        isOpen={galleryModalOpen}
        onClose={closeGalleryModal}
        productoId={productoId!}
      />

      <ModalOferta
        isOpen={ofertaModalOpen}
        onClose={closeOfertaModal}
        productoId={productoId}
        onSubmit={handleSubmitOferta} // Pasar la función onSubmit
        precioBase={precioBase} // Pasar el precio base
        ofertaActiva={ofertaActiva}  // Pasar la oferta activa
        precioOferta={precioOferta}
      />
    </div>
  );
}