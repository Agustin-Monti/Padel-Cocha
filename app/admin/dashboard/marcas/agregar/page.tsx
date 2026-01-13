"use client";
import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import { createMarcasAction } from "@/actions/marcas-actions";
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, X, Loader2, Tag } from 'lucide-react';

export default function CreateMarcaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [marca, setMarca] = useState({
    nombre: "",
    imagen: null as File | null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMarca(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMarca(prev => ({
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
      setMarca(prev => ({
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
    setMarca(prev => ({ ...prev, imagen: null }));
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
    
    if (!marca.nombre.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "El nombre de la marca es obligatorio.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!marca.imagen) {
      Swal.fire({
        title: "Imagen requerida",
        text: "Por favor, selecciona una imagen para la marca.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("nombre", marca.nombre);
    formData.append("imagen", marca.imagen);

    try {
      const success = await createMarcasAction(formData);
      
      if (success) {
        Swal.fire({
          title: "¡Éxito!",
          text: "La marca se ha creado correctamente.",
          icon: "success",
          confirmButtonText: "Continuar",
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
          didClose: () => {
            router.push('/admin/dashboard/marcas');
          }
        });
      } else {
        throw new Error("Error al crear la marca");
      }
    } catch (error) {
      console.error("Error al crear la marca:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al crear la marca. Por favor, intenta de nuevo.",
        icon: "error",
        confirmButtonText: "Reintentar",
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
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <Tag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Agregar Nueva Marca</h1>
              <p className="text-gray-600 mt-1">Completa los datos para registrar una nueva marca</p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-800">Información de la Marca</h2>
            <p className="text-gray-600 text-sm mt-1">Todos los campos son obligatorios</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Nombre Field */}
            <div className="mb-8">
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-3">
                Nombre de la Marca
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={marca.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Nike, Adidas, Puma..."
                  className="w-full px-4 py-3.5 pl-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                El nombre debe ser descriptivo y único
              </p>
            </div>

            {/* Image Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Logo de la Marca
                <span className="text-red-500 ml-1">*</span>
              </label>

              {/* Preview Image */}
              {previewImage ? (
                <div className="mb-6">
                  <div className="relative bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="w-48 h-24 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                          <img 
                            src={previewImage} 
                            alt="Vista previa" 
                            className="w-full h-full object-contain p-2"
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
                      <p className="text-sm text-gray-600">Vista previa del logo</p>
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-2"
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
                  className={`border-3 ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-gray-300'} rounded-2xl p-8 transition-all duration-200 bg-gray-50 hover:bg-gray-100 cursor-pointer`}
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
                    <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
                      <Upload className={`h-10 w-10 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-700">
                        {isDragging ? 'Suelta la imagen aquí' : 'Arrastra y suelta el logo'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        o haz clic para seleccionar un archivo
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
                      <ImageIcon className="h-4 w-4" />
                      <span>PNG, JPG, WEBP o SVG • Máx. 5MB</span>
                    </div>
                    
                    <p className="mt-4 text-xs text-gray-400">
                      Se recomienda fondo transparente para mejores resultados
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
                disabled={isLoading || !marca.nombre.trim() || !marca.imagen}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando marca...
                  </>
                ) : (
                  <>
                    <Tag className="h-5 w-5" />
                    Crear Marca
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
                    • Usa logos con fondo transparente para mejor integración
                    <br />
                    • Asegúrate de que el nombre sea claro y reconocible
                    <br />
                    • El tamaño óptimo para logos es 400x200px
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <div className="w-16 h-1 bg-emerald-300 rounded-full"></div>
            <div className="w-3 h-3 bg-emerald-300 rounded-full"></div>
            <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
