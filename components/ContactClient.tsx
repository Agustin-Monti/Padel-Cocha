"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProductUsed {
  nombre: string;
  color: string;
  descripcion: string;
  imagen: File | string;
  propietario: string;
  telefono: string;
  email: string;
}

export default function ContactClient() {
  const [product, setProduct] = useState<ProductUsed>({
    nombre: "",
    color: "",
    descripcion: "",
    imagen: "",
    propietario: "",
    telefono: "",
    email: "",
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((prev) => ({ ...prev, imagen: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mostrar loading
    Swal.fire({
      title: "Enviando producto...",
      text: "Por favor espera un momento",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("/api/send-used-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "¡Enviado!",
          text: "El producto usado fue enviado. El equipo lo revisará y te contactaremos pronto.",
          icon: "success",
          buttonsStyling: false, // 🔹 desactiva estilos por defecto
          customClass: {
            confirmButton: "bg-blue-600 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded",
          },
        });
        setProduct({
          nombre: "",
          color: "",
          descripcion: "",
          imagen: "",
          propietario: "",
          telefono: "",
          email: "",
        });
        setPreviewUrl(null);
      } else {
        throw new Error(data.message || "Error desconocido");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo enviar el producto. Intenta nuevamente.",
        icon: "error",
        buttonsStyling: false, // 🔹 desactiva estilos por defecto
        customClass: {
          confirmButton: "bg-blue-600 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md"
    >
      {/* Flecha volver */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft size={20} />
          <span>Volver a la Página Principal</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">
        Formulario de Producto Usado
      </h1>

      {/* Nombre del producto */}
      <div className="mb-4">
        <Label>Nombre del producto</Label>
        <Input
          name="nombre"
          value={product.nombre}
          onChange={handleChange}
          required
        />
      </div>

      {/* Color */}
      <div className="mb-4">
        <Label>Color</Label>
        <Input
          name="color"
          value={product.color}
          onChange={handleChange}
          required
        />
      </div>

      {/* Imagen */}
      <div className="mb-6">
        <Label>Imagen</Label>
        <div className="flex gap-4 items-center">
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition">
            Seleccionar Imagen
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {previewUrl && (
            <img
              src={previewUrl}
              className="w-24 h-24 object-cover rounded"
              alt="Vista previa"
            />
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-6">
        <Label>Descripción y Detalles del Producto</Label>
        <textarea
          name="descripcion"
          rows={4}
          className="w-full border p-2 rounded"
          value={product.descripcion}
          onChange={handleChange}
        />
      </div>

      {/* Datos del propietario */}
      <h2 className="text-xl font-semibold mb-4">Datos del propietario</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label>Tu Nombre</Label>
          <Input
            name="propietario"
            value={product.propietario}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Tu Teléfono</Label>
          <Input
            type="tel"
            name="telefono"
            value={product.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label>Tu Email</Label>
          <Input
            type="email"
            name="email"
            value={product.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Botón submit */}
      <div className="mt-6">
        <SubmitButton type="submit" pendingText="Enviando..." disabled={loading}>
          Enviar Producto
        </SubmitButton>
      </div>
    </form>
  );
}
