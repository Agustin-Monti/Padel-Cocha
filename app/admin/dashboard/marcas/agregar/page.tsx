"use client";
import React, { useState } from "react";

import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import { createMarcasAction } from "@/actions/marcas-actions"; // Acción para crear el producto
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';


export default function CreateMarcaPage() {
  const router = useRouter();
  const [marcas, setMarcas] = useState<any>({
    nombre: "",
    imagen: null,
  });


  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMarcas({
      ...marcas,
      [name]: value,
    });
  };

  // Para manejar el cambio del archivo de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMarcas((prev: any) => ({
        ...prev,
        imagen: file,
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("nombre", marcas.nombre);
    formData.append("imagen", marcas.imagen); // Enviar archivo de imagen

    try {
      // Llamar a la acción para crear el producto
      await createMarcasAction(formData);
      Swal.fire({
              title: "¡Éxito!",
              text: "La Marca se ha agregado correctamente.",
              icon: "success",
              confirmButtonText: "Aceptar",
              customClass: {
                confirmButton: "bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600",
              },
            }).then(() => {
              router.push('/admin/dashboard/marcas');
            });
    } catch (error) {
      console.error("Error al crear el producto:", error);
      Swal.fire({
              title: "Error",
              text: "Hubo un problema al agregar la Marca.",
              icon: "error",
              confirmButtonText: "Aceptar",
              customClass: {
                confirmButton: "bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600",
              },
            });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col max-w-xl mx-auto"
      style={{ width: "700px" }}
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-medium text-black">Agregar Marca</h1>
      <div className="flex flex-col gap-4 mt-8">
        <Label htmlFor="nombre" className="text-black">Nombre de la Marca</Label>
        <Input
          name="nombre"
          placeholder="Nombre de la Categoria"
          required
          value={marcas.nombre}
          onChange={handleChange}
        />

        <Label htmlFor="imagen" className="text-black">Imagen de la Marca</Label>
        <Input
          className="text-white"
          name="imagen"
          type="file"
          accept="image/*" // Acepta solo imágenes
          required
          onChange={handleImageChange}
        />

        <SubmitButton className="bg-blue-500" pendingText="Creando..." type="submit">
          Agregar Categoria
        </SubmitButton>
      </div>
    </form>
  );
}
