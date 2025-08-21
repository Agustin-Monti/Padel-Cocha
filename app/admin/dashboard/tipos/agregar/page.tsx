"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import { createTipoAction, getCategorias } from "@/actions/tipos-actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateProductPage() {
  const [tipos, setTipos] = useState<any>({
    nombre: "",
    categoria_id: "", 
  });

  const [categorias, setCategorias] = useState<any[]>([]); // Estado para guardar las categorías
  const [loading, setLoading] = useState(false);

  // Obtener categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);
    };

    fetchCategorias();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTipos({
      ...tipos,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("nombre", tipos.nombre);
    formData.append("categoria_id", tipos.categoria_id);

    try {
      const success = await createTipoAction(formData);
      if (success) {
        Swal.fire({
          title: "¡Éxito!",
          text: "El Tipo de Producto se ha agregado correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al agregar el Tipo de Producto.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      console.error("Error al crear el tipo de producto:", error);
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
      <h1 className="text-2xl font-medium text-black">Agregar Tipo de Producto</h1>
      <div className="flex flex-col gap-4 mt-8">
        {/* Campo para seleccionar categoría */}
        <Label htmlFor="categoria_id" className="text-black">Selecciona la Categoría</Label>
        <select
          name="categoria_id"
          id="categoria_id"
          value={tipos.categoria_id}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>

        {/* Campo para nombre del tipo */}
        <Label htmlFor="nombre" className="text-black">Nombre del Tipo</Label>
        <Input
          name="nombre"
          placeholder="Nombre del Tipo de Producto"
          required
          value={tipos.nombre}
          onChange={handleChange}
        />

        <SubmitButton className="bg-blue-500" pendingText="Creando..." type="submit">
          Agregar Tipo de Producto
        </SubmitButton>
      </div>
    </form>
  );
}
