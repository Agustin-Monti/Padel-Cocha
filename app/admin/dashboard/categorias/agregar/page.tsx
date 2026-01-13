"use client";
import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import { createCategoryAction } from "@/actions/categorias-actions";
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, X, Loader2, FolderOpen } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [categoria, setCategoria] = useState({
    nombre: "",
    imagen: null as File | null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoria(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoria(prev => ({
        ...prev,
        imagen: file,
      }));

      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCategoria(prev => ({
        ...prev,
        imagen: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire({
        title: "Formato inválido",
        text: "Por favor, selecciona solo archivos de imagen.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
    }
  };

  const removeImage = () => {
    setCategoria(prev => ({ ...prev, imagen: null }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoria.nombre.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "El nombre de la categoría es obligatorio.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!categoria.imagen) {
      Swal.fire({
        title: "Imagen requerida",
        text: "Por favor, selecciona una imagen para la categoría.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("nombre", categoria.nombre);
    formData.append("imagen", categoria.imagen);

    try {
      const success = await createCategoryAction(formData);
      
      if (success) {
        Swal.fire({
          title: "¡Éxito!",
          text: "La categoría se ha creado correctamente.",
          icon: "success",
          confirmButtonText: "Continuar",
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            confirmButton: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
          },
          didClose: () => {
            router.push('/admin/dashboard/categorias');
          }
        });
      } else {
        throw new Error("Error al crear la categoría");
      }
    } catch (error) {
      console.error("Error al crear la categoría:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al crear la categoría. Por favor, intenta de nuevo.",
        icon: "error",
        confirmButtonText: "Reintentar",
        customClass: {
          confirmButton: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <FolderOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Agregar Nueva Categoría</h1>
              <p className="text-gray-600 mt-1">Completa los datos para registrar una nueva categoría</p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-800">Información de la Categoría</h2>
            <p className="text-gray-600 text-sm mt-1">Todos los campos son obligatorios</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Nombre Field */}
            <div className="mb-8">
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-3">
                Nombre de la Categoría
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={categoria.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Paletas, Ropa, Accesorios..."
                  className="w-full px-4 py-3.5 pl-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FolderOpen className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                El nombre debe ser descriptivo y ayudará a organizar tus productos
              </p>
            </div>

            {/* Image Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Imagen de la Categoría
                <span className="text-red-500 ml-1">*</span>
              </label>

              {/* Preview Image */}
              {previewImage ? (
                <div className="mb-6">
                  <div className="relative bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="w-40 h-40 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                          <img 
                            src={previewImage} 
                            alt="Vista previa" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">Vista previa de la imagen</p>
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4" />
                        Cambiar imagen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Upload Area */
                <div
                  className={`border-3 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded-2xl p-8 transition-all duration-200 bg-gray-50 hover:bg-gray-100 cursor-pointer`}
                  onClick={triggerFileInput}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
                      <Upload className={`h-10 w-10 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-700">
                        {isDragging ? 'Suelta la imagen aquí' : 'Arrastra y suelta la imagen'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        o haz clic para seleccionar un archivo
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
                      <ImageIcon className="h-4 w-4" />
                      <span>PNG, JPG, WEBP • Máx. 5MB</span>
                    </div>
                    
                    <p className="mt-4 text-xs text-gray-400">
                      Se recomienda imágenes cuadradas (1:1) para mejor visualización
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !categoria.nombre.trim() || !categoria.imagen}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando categoría...
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-5 w-5" />
                    Crear Categoría
                  </>
                )}
              </button>
            </div>

            {/* Form Status */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Recomendaciones</p>
                  <p className="text-sm text-blue-600 mt-1">
                    • Usa imágenes representativas de la categoría
                    <br />
                    • Preferiblemente imágenes con fondo blanco o transparente
                    <br />
                    • El tamaño óptimo es 400x400px (formato cuadrado)
                    <br />
                    • Asegúrate de que la imagen sea de alta calidad
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-16 h-1 bg-blue-300 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
