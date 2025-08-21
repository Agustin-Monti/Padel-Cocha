"use client";

import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { fetchCategorias, getCategoriaById, eliminarCategoriaById } from '@/actions/categorias-actions'; // Asegúrate de que la función fetchCategorias esté implementada correctamente.
import Link from "next/link";
import EditarCategoria from "@/components/EditarCategoria";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

type Categoria = {
  id: string;
  nombre: string;
  imagen: string;
};

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [categoriaDetalles, setCategoriaDetalles] = useState<Categoria | null>(null);

  useEffect(() => {
    const obtenerCategorias = async () => {
      const data = await fetchCategorias();
      setCategorias(data);
    };

    obtenerCategorias();
  }, []);

  const openEditModal = async (id: string) => {
    try {
      setCategoriaId(id);
      setModalOpen(true);

      const data = await getCategoriaById(id);
      setCategoriaDetalles(data);
    } catch (error) {
      console.log("Error al cargar los detalles de la categoría.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCategoriaId(null);
    setCategoriaDetalles(null); // Limpiamos los detalles cuando cerramos el modal
  };

  const handleSave = async () => {
    try {
          const updatedData = await fetchCategorias();
          setCategorias(updatedData);
          // Mostrar mensaje de éxito con SweetAlert2
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Categoria actualizada correctamente.',
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar la Categoria.',
          });
        }
  };
  

 const handleDelete = async (id: string) => {
     try {
       // Mostrar el cuadro de confirmación
       const result = await Swal.fire({
         title: '¿Estás seguro?',
         text: `La Categoria con ID ${id} será eliminado permanentemente.`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#3085d6',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar',
       });
   
       // Verificar si el usuario confirmó
       if (result.isConfirmed) {
         const eliminado = await eliminarCategoriaById(id);
   
         if (eliminado) {
           // Actualizar la lista de productos tras eliminar uno
           const data = await fetchCategorias();
           setCategorias(data);
   
           // Mostrar mensaje de éxito
           Swal.fire({
             icon: 'success',
             title: 'Eliminado',
             text: `Categoria con ID ${id} eliminada correctamente.`,
             timer: 2000,
             showConfirmButton: false,
           });
         } else {
           // Mostrar mensaje de error
           Swal.fire({
             icon: 'error',
             title: 'Error',
             text: 'No se pudo eliminar la Categoria.',
           });
         }
       } else {
         // El usuario canceló la acción
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
   
       // Mostrar mensaje de error
       Swal.fire({
         icon: 'error',
         title: 'Error',
         text: 'Error al eliminar la Categoria.',
       });
     }
   };

  const columns = [
    {
      name: 'ID',
      selector: (row: Categoria) => row.id,
      sortable: true,
    },
    {
      name: 'Nombre',
      selector: (row: Categoria) => row.nombre,
      sortable: true,
    },
    {
      name: 'Imagen',
      cell: (row: Categoria) => <img src={row.imagen} alt={row.nombre} width={50} />,
    },
    {
      name: "Acciones",
      cell: (row: Categoria) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row.id)}
            className="bg-blue-500 text-white p-1 rounded flex items-center justify-center w-8 h-8"
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 text-white p-1 rounded flex items-center justify-center w-8 h-8"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>

        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">Página de Categorías</h1>

      <Link href="/admin/dashboard/categorias/agregar">
        <p className="bg-green-500 text-white p-2 rounded mb-4 inline-block">
          Agregar Nueva Categoría
        </p>
      </Link>

      <DataTable
        columns={columns}
        data={categorias}
        pagination
        highlightOnHover
        responsive
      />

      <EditarCategoria
        isOpen={modalOpen}
        onClose={closeModal}
        categoriaId={categoriaId}
        categoriaDetalles={categoriaDetalles} // Pasa los detalles de la categoría aquí
        onSave={handleSave}
      />
    </div>
  );
}
