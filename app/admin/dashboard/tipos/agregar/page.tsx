"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import { createTipoAction, getCategorias } from "@/actions/tipos-actions";
import { useRouter } from 'next/navigation';
import { Loader2, Layers, Tag, ChevronDown, Check, FolderOpen } from 'lucide-react';

type Categoria = {
  id: string;
  nombre: string;
};

type Tipo = {
  nombre: string;
  categoria_id: string;
};

export default function CreateProductPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>({
    nombre: "",
    categoria_id: "", 
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Obtener categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoadingCategorias(true);
        const categoriasData = await getCategorias();
        setCategorias(categoriasData || []);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar las categorías.",
          icon: "error",
          confirmButtonText: "Reintentar",
        });
      } finally {
        setIsLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTipo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectCategoria = (categoriaId: string, categoriaNombre: string) => {
    setTipo(prev => ({
      ...prev,
      categoria_id: categoriaId,
    }));
    setIsDropdownOpen(false);
  };

  const getCategoriaSeleccionada = () => {
    return categorias.find(cat => cat.id === tipo.categoria_id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipo.categoria_id) {
      Swal.fire({
        title: "Categoría requerida",
        text: "Por favor, selecciona una categoría.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!tipo.nombre.trim()) {
      Swal.fire({
        title: "Nombre requerido",
        text: "El nombre del tipo de producto es obligatorio.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("nombre", tipo.nombre);
    formData.append("categoria_id", tipo.categoria_id);

    try {
      const success = await createTipoAction(formData);
      
      if (success) {
        Swal.fire({
          title: "¡Éxito!",
          text: "El tipo de producto se ha creado correctamente.",
          icon: "success",
          confirmButtonText: "Continuar",
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            confirmButton: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
          },
          didClose: () => {
            router.push('/admin/dashboard/tipos');
          }
        });
      } else {
        throw new Error("Error al crear el tipo de producto");
      }
    } catch (error) {
      console.error("Error al crear el tipo de producto:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al crear el tipo de producto. Por favor, intenta de nuevo.",
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
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Agregar Tipo de Producto</h1>
              <p className="text-gray-600 mt-1">Crea una nueva clasificación para organizar tus productos</p>
            </div>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-800">Información del Tipo</h2>
            <p className="text-gray-600 text-sm mt-1">Define las características de este tipo de producto</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Categoría Dropdown */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Categoría Asociada
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              <div className="relative">
                {/* Selected Category Display */}
                <div
                  onClick={() => !isLoadingCategorias && setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3.5 pl-12 bg-gray-50 border ${isDropdownOpen ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-300'} rounded-xl cursor-pointer transition-all flex items-center justify-between ${isLoadingCategorias ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-gray-400" />
                    {tipo.categoria_id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {getCategoriaSeleccionada()?.nombre}
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          Seleccionada
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Selecciona una categoría</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoadingCategorias && (
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    )}
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Dropdown Options */}
                {isDropdownOpen && !isLoadingCategorias && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {categorias.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No hay categorías disponibles
                      </div>
                    ) : (
                      <div className="py-2">
                        {categorias.map((categoria) => (
                          <div
                            key={categoria.id}
                            onClick={() => handleSelectCategoria(categoria.id, categoria.nombre)}
                            className={`px-4 py-3 flex items-center justify-between hover:bg-purple-50 cursor-pointer transition-colors ${tipo.categoria_id === categoria.id ? 'bg-purple-50' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <FolderOpen className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="font-medium text-gray-800">{categoria.nombre}</span>
                            </div>
                            {tipo.categoria_id === categoria.id && (
                              <Check className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                El tipo de producto pertenecerá a esta categoría
              </p>
            </div>

            {/* Nombre Field */}
            <div className="mb-8">
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-3">
                Nombre del Tipo
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={tipo.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Paletas Control, Ropa Deportiva, Zapatillas..."
                  className="w-full px-4 py-3.5 pl-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-500"
                  disabled={isLoading || isLoadingCategorias}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Un nombre descriptivo ayudará a identificar este tipo de producto
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading || isLoadingCategorias}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isLoadingCategorias || !tipo.categoria_id || !tipo.nombre.trim()}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando tipo...
                  </>
                ) : (
                  <>
                    <Layers className="h-5 w-5" />
                    Crear Tipo de Producto
                  </>
                )}
              </button>
            </div>

            {/* Form Status */}
            <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Layers className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">¿Qué es un tipo de producto?</p>
                  <p className="text-sm text-purple-600 mt-1">
                    • Los tipos son subclasificaciones dentro de una categoría
                    <br />
                    • Ejemplo: En "Paletas" puedes tener "Control", "Potencia", "Infantil"
                    <br />
                    • Ayudan a organizar mejor tu inventario
                    <br />
                    • Mejoran la experiencia de búsqueda para tus clientes
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Category Info */}
            {tipo.categoria_id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-300">
                      <FolderOpen className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Categoría seleccionada
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {getCategoriaSeleccionada()?.nombre}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTipo(prev => ({ ...prev, categoria_id: "" }))}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Progress Steps */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="w-16 h-1 bg-purple-300 rounded-full"></div>
            <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
            <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
