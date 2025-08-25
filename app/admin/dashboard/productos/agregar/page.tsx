"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { ArrowLeft } from "lucide-react";

import {
  createProductAction,
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
  // Campos específicos indumentaria
  marcaIndumentaria?: string;
  modelo?: string;
  origen?: string;
  materiales?: string;
  talles?: Record<string, number>;
  // Campos específicos bolsos
  medidas?: string;
  textura?: string;
  ancho?: string;
  largo?: string;
  capacidad?: string;
}

export default function CreateProductPage() {
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
    talles: {}, // para indumentaria
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

  // Maneja cambio en talles (para indumentaria)
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
      let imageUrl = "";

      if (product.imagen && typeof product.imagen !== "string") {
        const file = product.imagen;
        const fileName = `${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
          .from("productos")
          .upload(`productos/${fileName}`, file);
        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("productos")
          .getPublicUrl(`productos/${fileName}`);
        imageUrl = urlData.publicUrl;
      } else if (typeof product.imagen === "string") {
        imageUrl = product.imagen;
      }

      let stockTotal = Number(product.stock) || 0;

      // Si es indumentaria o zapatillas, el stock se calcula con la suma de talles
      if (
        selectedCategoria?.nombre.toLowerCase() === "indumentaria" ||
        selectedCategoria?.nombre.toLowerCase() === "zapatillas"
      ) {
        stockTotal = Object.values(product.talles || {}).reduce(
          (acc, val) => acc + val,
          0
        );
      }


      // Conversión explícita a números para evitar error de tipos
      const nuevoProducto = {
        ...product,
        imagen: imageUrl,
        stock: stockTotal,
        precio: parseFloat(product.precio),
        peso: parseFloat(product.peso) || 0,
        categoria_id: Number(product.categoria_id),
        tipo_id: Number(product.tipo_id),
        marca_id: Number(product.marca_id),

        // Campos opcionales para indumentaria (solo si existe)
        modelo: product.modelo || undefined,
        origen: product.origen || undefined,
        material: product.materiales || undefined,
        genero: product.marcaIndumentaria || undefined,

        // Convertir talles a string si existen
        talle: product.talles ? JSON.stringify(product.talles) : undefined,

        // Campos que falta para bolsos
        medidas: product.medidas || undefined,
        capacidad: product.capacidad || undefined,

        // Campos que falta para accesorios
        ancho: product.ancho || undefined,
        largo: product.largo || undefined,
        textura: product.textura || undefined,
      };


      await createProductAction(nuevoProducto);

      Swal.fire({
        title: "¡Éxito!",
        text: "El producto se ha agregado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        router.push("/admin/dashboard/productos");
      });
    } catch (error) {
      console.error("Error al crear el producto:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al agregar el producto.",
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

      {/* Botón volver */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard/productos")}
          className="flex items-center gap-2 text-blue-600"
        >
          <ArrowLeft size={20} />
          <span>Volver a Productos</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Agregar Producto</h1>

      {/* Pestañas de categoría */}
      <div className="flex gap-4 mb-8 border-b pb-2 overflow-x-auto">
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

        {/* Ocultar stock para indumentaria y zapatillas */}
        {selectedCategoria?.nombre.toLowerCase() !== "indumentaria" &&
        selectedCategoria?.nombre.toLowerCase() !== "zapatillas" && (
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
