import React, { useState, useEffect } from 'react';
import { guardarEditCategoria } from '@/actions/categorias-actions';
import { createClient } from "@/utils/supabase/client";


export type Categoria = {
  id: string;
  nombre: string;
  imagen: string; // URL o Base64 de la imagen actual
};

interface EditarCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  categoriaId: string | null;
  categoriaDetalles: Categoria | null;
  onSave: (categoria: Categoria) => Promise<void>;
}

const EditarCategoria: React.FC<EditarCategoriaProps> = ({
  isOpen,
  onClose,
  categoriaId,
  categoriaDetalles,
  onSave,
}) => {
  const [categoria, setCategoria] = useState<Categoria | null>(categoriaDetalles);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);

  useEffect(() => {
    if (categoriaDetalles) {
        setCategoria(categoriaDetalles);
      setPreviewImagen(categoriaDetalles.imagen); // Vista previa inicial
    }
  }, [categoriaDetalles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (categoria) {
        setCategoria({
        ...categoria,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaImagen(file);

      // Generar vista previa de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = () => setPreviewImagen(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!categoria) return;

    const supabase = createClient();
    let imageUrl = categoria.imagen;

    if (nuevaImagen && nuevaImagen.name) {
      const file = nuevaImagen;
      const fileName = `${Date.now()}_${file.name}`;
      const pathToUpload = `categorias/${fileName}`;

      // 🗑 Llamar a la API para eliminar la imagen anterior
      if (categoria.imagen?.includes("/storage/v1/object/public/productos/")) {
        const partes = categoria.imagen.split("/storage/v1/object/public/productos/");
        const rutaAEliminar = partes[1]; // "categorias/xyz.jpg"

        if (rutaAEliminar) {
          console.log("🗑 Intentando eliminar imagen anterior:", rutaAEliminar);

          const response = await fetch("/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: rutaAEliminar }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.warn("⚠️ No se pudo eliminar imagen anterior:", result.message);
          } else {
            console.log("🗑 Imagen anterior eliminada con éxito");
          }
        }
      }

      // ⬆️ Subir nueva imagen
      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(pathToUpload, file);

      if (uploadError) {
        alert("Error al subir imagen: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("productos")
        .getPublicUrl(pathToUpload);

      imageUrl = urlData.publicUrl;
    }

    // 📝 Guardar cambios
    const formData = new FormData();
    formData.append("id", categoria.id);
    formData.append("nombre", categoria.nombre);
    formData.append("url", imageUrl);

    const result = await guardarEditCategoria(formData);

    if (result) {
      setNuevaImagen(null);
      onSave({ ...categoria, imagen: imageUrl });
      onClose();
    } else {
      alert("Hubo un error al guardar la categoría");
    }
  };


  if (!isOpen || !categoria) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-black">Editar Producto</h2>
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-black">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={categoria.nombre}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="imagen" className="block text-sm font-medium text-black">Imagen</label>
          {previewImagen && (
            <div className="mb-2">
              <img src={previewImagen} alt="Vista previa" className="h-32 w-32 object-cover" />
            </div>
          )}
          <input
            id="imagen"
            name="imagen"
            type="file"
            onChange={handleImageChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded m-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded m-2"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarCategoria;
