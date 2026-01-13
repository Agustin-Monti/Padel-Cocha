"use client";

import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { fetchMarcas, getMarcaById, eliminarMarcasById } from '@/actions/marcas-actions'; // Asegúrate de que la función fetchCategorias esté implementada correctamente.
import Link from "next/link";
import EditarMarcas from "@/components/EditarMarcas";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

type Marca = {
  id: string;
  nombre: string;
  imagen: string;
};

export default function Marcas() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [marcaId, setMarcaId] = useState<string | null>(null);
  const [marcaDetalles, setMarcaDetalles] = useState<Marca | null>(null);

  useEffect(() => {
    const obtenerMarcas = async () => {
      const data = await fetchMarcas();
      setMarcas(data);
    };

    obtenerMarcas();
  }, []);

  const openEditModal = async (id: string) => {
    try {
        setMarcaId(id);
        setModalOpen(true);

        const data = await getMarcaById(id); // ✅ corregido
        setMarcaDetalles(data);
    } catch (error) {
        console.log("Error al cargar los detalles de la marca.");
    }
    };


  const closeModal = () => {
    setModalOpen(false);
    setMarcaId(null);
    setMarcaDetalles(null); // Limpiamos los detalles cuando cerramos el modal
  };

  const handleSave = async () => {
    try {
          const updatedData = await fetchMarcas();
          setMarcas(updatedData);
          // Mostrar mensaje de éxito con SweetAlert2
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Marca actualizada correctamente.',
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar la Marca.',
          });
        }
  };
  

 const handleDelete = async (id: string) => {
     try {
       // Mostrar el cuadro de confirmación
       const result = await Swal.fire({
         title: '¿Estás seguro?',
         text: `La Marca con ID ${id} será eliminado permanentemente.`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#3085d6',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar',
       });
   
       // Verificar si el usuario confirmó
       if (result.isConfirmed) {
         const eliminado = await eliminarMarcasById(id);
   
         if (eliminado) {
           // Actualizar la lista de productos tras eliminar uno
           const data = await fetchMarcas();
           setMarcas(data);
   
           // Mostrar mensaje de éxito
           Swal.fire({
             icon: 'success',
             title: 'Eliminado',
             text: `Marca con ID ${id} eliminada correctamente.`,
             timer: 2000,
             showConfirmButton: false,
           });
         } else {
           // Mostrar mensaje de error
           Swal.fire({
             icon: 'error',
             title: 'Error',
             text: 'No se pudo eliminar la Marca.',
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
         text: 'Error al eliminar la Marca.',
       });
     }
   };

  const columns = [
    {
      name: 'ID',
      selector: (row: Marca) => row.id,
      sortable: true,
    },
    {
      name: 'Nombre',
      selector: (row: Marca) => row.nombre,
      sortable: true,
    },
    {
      name: 'Imagen',
      cell: (row: Marca) => <img src={row.imagen} alt={row.nombre} width={50} />,
    },
    {
      name: "Acciones",
      cell: (row: Marca) => (
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
      <h1 className="text-2xl font-bold mb-4 text-black">Página de Marcas</h1>

      <Link href="/admin/dashboard/marcas/agregar">
        <p className="bg-green-500 text-white p-2 rounded mb-4 inline-block">
          Agregar Nueva Marca
        </p>
      </Link>

      <DataTable
        columns={columns}
        data={marcas}
        pagination
        highlightOnHover
        responsive
      />

      <EditarMarcas
        isOpen={modalOpen}
        onClose={closeModal}
        marcaId={marcaId}
        marcaDetalles={marcaDetalles} // Pasa los detalles de la marca aquí
        onSave={handleSave}
      />
    </div>
  );
}
