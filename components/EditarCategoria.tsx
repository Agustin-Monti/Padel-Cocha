import React, { useState, useEffect } from 'react';
import { guardarEditCategoria } from '@/actions/categorias-actions';
import { createClient } from "@/utils/supabase/client";
import { X, Upload, Save, Loader2 } from 'lucide-react';

export type Categoria = {
  id: string;
  nombre: string;
  imagen: string;
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (categoriaDetalles) {
      setCategoria(categoriaDetalles);
      setPreviewImagen(categoriaDetalles.imagen);
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

      const reader = new FileReader();
      reader.onload = () => setPreviewImagen(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!categoria) return;
    
    setIsLoading(true);

    const supabase = createClient();
    let imageUrl = categoria.imagen;

    if (nuevaImagen && nuevaImagen.name) {
      const file = nuevaImagen;
      const fileName = `${Date.now()}_${file.name}`;
      const pathToUpload = `categorias/${fileName}`;

      if (categoria.imagen?.includes("/storage/v1/object/public/productos/")) {
        const partes = categoria.imagen.split("/storage/v1/object/public/productos/");
        const rutaAEliminar = partes[1];

        if (rutaAEliminar) {
          try {
            const response = await fetch("/api/delete-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: rutaAEliminar }),
            });

            if (!response.ok) {
              const result = await response.json();
              console.warn("⚠️ No se pudo eliminar imagen anterior:", result.message);
            }
          } catch (error) {
            console.warn("Error al eliminar imagen anterior:", error);
          }
        }
      }

      try {
        const { error: uploadError } = await supabase.storage
          .from("productos")
          .upload(pathToUpload, file);

        if (uploadError) {
          alert("Error al subir imagen: " + uploadError.message);
          setIsLoading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("productos")
          .getPublicUrl(pathToUpload);

        imageUrl = urlData.publicUrl;
      } catch (error) {
        alert("Error al subir la imagen");
        setIsLoading(false);
        return;
      }
    }

    try {
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
    } catch (error) {
      alert("Error al guardar los cambios");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !categoria) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con blur */}
      <div 
        className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Editar Categoría</h2>
                <p className="text-blue-100 text-sm mt-1">Modifica los detalles de la categoría</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Nombre Input */}
            <div className="mb-6">
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la categoría
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={categoria.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Escribe el nombre de la categoría"
              />
            </div>

            {/* Imagen Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imagen de la categoría
              </label>
              
              {/* Preview */}
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  {previewImagen ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-3">
                        <img 
                          src={previewImagen} 
                          alt="Vista previa" 
                          className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Vista previa de la imagen
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">No hay imagen seleccionada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Input */}
              <div className="relative">
                <input
                  id="imagen"
                  name="imagen"
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="imagen"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg hover:from-gray-100 hover:to-gray-200 cursor-pointer transition-all group"
                >
                  <Upload size={18} className="text-gray-600 group-hover:text-blue-600" />
                  <span className="text-gray-700 font-medium">
                    {previewImagen ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  PNG, JPG, WEBP hasta 5MB
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarCategoria;
