"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import {
  getCategorias,
  getTipos,
  getMarcas,
} from "@/actions/productos-actions";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import FormularioPaleta from "@/components/formularios/FormularioPaleta";
import FormularioIndumentaria from "@/components/formularios/FormularioIndumentaria";
import FormularioBolsos from "@/components/formularios/FormularioBolsos";
import FormularioAccesorios from "@/components/formularios/FormularioAccesorios";
import FormularioZapatillas from "@/components/formularios/FormularioZapatillas";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Product {
  nombre: string;
  precio: string;
  stock: string;
  imagen: File | string;
  categoria_id: string;
  tipo_id: string;
  marca_id: string;
  grupo_variantes: string;
  color: string;
  peso: string;
  descripcion: string;
  marcaIndumentaria?: string;
  modelo?: string;
  origen?: string;
  materiales?: string;
  talles?: Record<string, number>;
  medidas?: string;
  textura?: string;
  ancho?: string;
  largo?: string;
  capacidad?: string;
}

export default function ContactClient() {
  const [product, setProduct] = useState<Product>({
    nombre: "",
    precio: "",
    stock: "",
    imagen: "",
    categoria_id: "",
    tipo_id: "",
    marca_id: "",
    grupo_variantes: "",
    color: "",
    peso: "",
    descripcion: "",
    talles: {},
  });

  const [categorias, setCategorias] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [categoriasData, tiposData, marcasData] = await Promise.all([
        getCategorias(),
        getTipos(),
        getMarcas(),
      ]);
      setCategorias(categoriasData);
      setTipos(tiposData);
      setMarcas(marcasData);
    };
    fetchData();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTalle = (talle: string, cantidad: number) => {
    setProduct((prev) => {
      const nuevosTalles = { ...prev.talles, [talle]: cantidad };
      return { ...prev, talles: nuevosTalles };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProduct((prev) => ({ ...prev, imagen: file }));
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
          text: "El producto usado fue enviado al negocio. Te contactaremos pronto.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        setProduct({
          nombre: "",
          precio: "",
          stock: "",
          imagen: "",
          categoria_id: "",
          tipo_id: "",
          marca_id: "",
          grupo_variantes: "",
          color: "",
          peso: "",
          descripcion: "",
          talles: {},
        });
      } else {
        throw new Error(data.message || "Error desconocido");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo enviar el producto. Intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-md"
    >

        {/* Flecha volver */}
        <div className="mb-4">
            <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
            <ArrowLeft size={20} />
            <span>Volver a la Pagina Principal</span>
            </Link>
        </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Formulario para Producto Usado</h1>

      {/* Pestañas de categoría */}
        <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Seleccione una categoría
            </h2>

            <div className="flex gap-4 border-b pb-2 overflow-x-auto">
                {categorias.map((cat) => (
                <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                    setSelectedCategoria(cat);
                    setProduct((prev) => ({ ...prev, categoria_id: cat.id }));
                    }}
                    className={`px-4 py-2 rounded-t text-sm font-semibold transition ${
                    selectedCategoria?.id === cat.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                >
                    {cat.nombre}
                </button>
                ))}
            </div>
        </div>


      {/* Campos comunes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label>Nombre</Label>
          <Input
            name="nombre"
            value={product.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Precio</Label>
          <Input
            type="number"
            step="0.01"
            name="precio"
            value={product.precio}
            onChange={handleChange}
            required
          />
        </div>

        {/* Ocultar stock para indumentaria */}
        {selectedCategoria?.nombre.toLowerCase() !== "indumentaria" && (
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div>
          <Label>Peso</Label>
          <Input
            type="number"
            step="0.01"
            name="peso"
            value={product.peso}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Color</Label>
          <Input name="color" value={product.color} onChange={handleChange} />
        </div>
        <div>
          <Label>Grupo Variantes</Label>
          <Input
            name="grupo_variantes"
            value={product.grupo_variantes}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <select
            name="tipo_id"
            value={product.tipo_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Selecciona un tipo</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Marca</Label>
          <select
            name="marca_id"
            value={product.marca_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Selecciona una marca</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>
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
        <Label>Descripción</Label>
        <textarea
          name="descripcion"
          rows={4}
          className="w-full border p-2 rounded"
          value={product.descripcion}
          onChange={handleChange}
        />
      </div>

      {/* Formularios específicos */}
      {selectedCategoria?.nombre.toLowerCase() === "paletas" && (
        <FormularioPaleta product={product} onChange={handleChange} />
      )}

      {selectedCategoria?.nombre.toLowerCase() === "indumentaria" && (
        <FormularioIndumentaria
          product={product}
          onChange={handleChange}
          onChangeTalle={handleChangeTalle}
        />
      )}

      {selectedCategoria?.nombre.toLowerCase() === "bolsos" && (
        <FormularioBolsos product={product} onChange={handleChange} />
      )}

      {selectedCategoria?.nombre.toLowerCase() === "accesorios" && (
        <FormularioAccesorios product={product} onChange={handleChange} />
      )}

      {selectedCategoria?.nombre.toLowerCase() === "zapatillas" && (
            <FormularioZapatillas
                product={product}
                onChange={handleChange}
                onChangeTalle={handleChangeTalle}
            />
        )}




      {/* Botón submit */}
      <div className="mt-6">
        <SubmitButton type="submit" pendingText="Creando..." disabled={loading}>
          Agregar Producto
        </SubmitButton>
      </div>
    </form>
  );
}
