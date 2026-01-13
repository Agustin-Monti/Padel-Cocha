import React, { useState, useEffect } from 'react';
import { guardarEditCategoria, getCategorias } from '@/actions/tipos-actions';
import { X, Save, Loader2, Layers, FolderOpen, Check, ChevronDown } from 'lucide-react';

export type Tipos = {
  id: string;
  categoria_id: string;
  nombre: string; 
};

type Categoria = {
  id: string;
  nombre: string;
  imagen?: string;
};

interface EditarTiposProps {
  isOpen: boolean;
  onClose: () => void;
  tipoId: string | null;
  tiposDetalles: Tipos | null;
  onSave: () => Promise<void>;
}

const EditarTipos: React.FC<EditarTiposProps> = ({
  isOpen,
  onClose,
  tipoId,
  tiposDetalles,
  onSave,
}) => {
  const [tipo, setTipo] = useState<Tipos | null>(tiposDetalles);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setIsLoadingCategorias(true);
        const data = await getCategorias();
        setCategorias(data || []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setIsLoadingCategorias(false);
      }
    };

    cargarCategorias();
  }, []);

  useEffect(() => {
    if (tiposDetalles) {
      setTipo(tiposDetalles);
    }
  }, [tiposDetalles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tipo) {
      setTipo({
        ...tipo,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSelectCategoria = (categoriaId: string) => {
    if (tipo) {
      setTipo({
        ...tipo,
        categoria_id: categoriaId,
      });
    }
    setIsDropdownOpen(false);
  };

  const getCategoriaSeleccionada = () => {
    return categorias.find(cat => cat.id === tipo?.categoria_id);
  };

  const handleSave = async () => {
    if (!tipo) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('id', tipo.id);
      formData.append('categoria_id', tipo.categoria_id);
      formData.append('nombre', tipo.nombre);

      const result = await guardarEditCategoria(formData);

      if (result) {
        await onSave();
        onClose();
      } else {
        alert('Hubo un error al guardar el tipo de producto');
      }
    } catch (error) {
      console.error('Error al guardar tipo:', error);
      alert('Error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !tipo) return null;

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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Layers className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Editar Tipo de Producto</h2>
                  <p className="text-purple-100 text-sm mt-1">Actualiza la clasificación del producto</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Categoría Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              
              <div className="relative">
                {/* Selected Category Display */}
                <div
                  onClick={() => !isLoading && !isLoadingCategorias && setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 pl-12 bg-gray-50 border ${isDropdownOpen ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-300'} rounded-lg cursor-pointer transition-all flex items-center justify-between ${isLoading || isLoadingCategorias ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-gray-400 absolute left-4" />
                    {tipo.categoria_id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {getCategoriaSeleccionada()?.nombre}
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          Actual
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
                {isDropdownOpen && !isLoading && !isLoadingCategorias && (
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
                            onClick={() => handleSelectCategoria(categoria.id)}
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
                Categoría a la que pertenece este tipo de producto
              </p>
            </div>

            {/* Nombre Field */}
            <div className="mb-6">
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Tipo
              </label>
              <div className="relative">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={tipo.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="Escribe el nombre del tipo"
                  disabled={isLoading}
                />
                <Layers className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Nombre descriptivo para identificar este tipo
              </p>
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
                disabled={isLoading || !tipo.nombre.trim() || !tipo.categoria_id}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Information Box */}
            <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Layers className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">Tipos de producto</p>
                  <p className="text-sm text-purple-600 mt-1">
                    Los tipos son subclasificaciones que ayudan a organizar mejor los productos dentro de una categoría.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};  

export default EditarTipos;
