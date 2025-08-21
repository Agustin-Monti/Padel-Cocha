"use client";

import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { fetchTipos, getTiposById, eliminarTipoById } from '@/actions/tipos-actions'; // Asegúrate de que la función fetchCategorias esté implementada correctamente.
import Link from "next/link";
import EditarTipos from "@/components/EditarTipos";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

type Tipos = {
    id: string;
    categoria_id: string;
    nombre: string;
    
};
  

export default function Tipos() {
  const [tipos, setTipos] = useState<Tipos[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoId, setTipoId] = useState<string | null>(null);
  const [tiposDetalles, setTiposDetalles] = useState<Tipos | null>(null);

  useEffect(() => {
    const obtenerTipos = async () => {
      const data = await fetchTipos();
      setTipos(data);
    };

    obtenerTipos();
  }, []);

  const openEditModal = async (id: string) => {
    try {
        setTipoId(id);
      setModalOpen(true);

      const data = await getTiposById(id);
      setTiposDetalles(data);
    } catch (error) {
      console.log("Error al cargar los detalles de la categoría.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setTipoId(null);
    setTiposDetalles(null); // Limpiamos los detalles cuando cerramos el modal
  };

  const handleSave = async () => {
    try {
          const updatedData = await fetchTipos();
          setTipos(updatedData);
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
         const eliminado = await eliminarTipoById(id);
   
         if (eliminado) {
           // Actualizar la lista de productos tras eliminar uno
           const data = await fetchTipos();
           setTipos(data);
   
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
      selector: (row: Tipos) => row.id,
      sortable: true,
    },
    {
      name: 'Categoría',
      selector: (row: Tipos) => row.categoria_id,
      sortable: true,
    },
    {
        name: 'Nombre',
        selector: (row: Tipos) => row.nombre,
        sortable: true,
      },
    {
      name: "Acciones",
      cell: (row: Tipos) => (
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
      <h1 className="text-2xl font-bold mb-4 text-black">Página de Tipos de Productos</h1>

      <Link href="/admin/dashboard/tipos/agregar">
        <p className="bg-green-500 text-white p-2 rounded mb-4 inline-block">
          Agregar Nuevo Tipo de Producto
        </p>
      </Link>

      <DataTable
        columns={columns}
        data={tipos}
        pagination
        highlightOnHover
        responsive
      />

      <EditarTipos
        isOpen={modalOpen}
        onClose={closeModal}
        tipoId={tipoId}
        tiposDetalles={tiposDetalles} // Pasa los detalles de la categoría aquí
        onSave={handleSave}
      />
    </div>
  );
}
