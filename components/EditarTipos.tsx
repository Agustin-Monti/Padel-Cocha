import React, { useState, useEffect } from 'react';
import { guardarEditCategoria, getCategorias } from '@/actions/tipos-actions';

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
  const [tipos, setTipos] = useState<Tipos | null>(tiposDetalles);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      const data = await getCategorias();
      setCategorias(data);
    };

    cargarCategorias();
  }, []);

  useEffect(() => {
    if (tiposDetalles) {
      setTipos(tiposDetalles);
    }
  }, [tiposDetalles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (tipos) {
      setTipos({
        ...tipos,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSave = async () => {
    if (tipos) {
      setLoading(true);
      const formData = new FormData();
      formData.append('id', tipos.id);
      formData.append('categoria_id', tipos.categoria_id);
      formData.append('nombre', tipos.nombre);

      const result = await guardarEditCategoria(formData);

      if (result) {
        await onSave();
        onClose();
      } else {
        alert('Hubo un error al guardar el tipo de producto');
      }
      setLoading(false);
    }
  };

  if (!isOpen || !tipos) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-black">Editar Tipo de Producto</h2>
        
        <div className="mb-4">
          <label htmlFor="categoria_id" className="block text-sm font-medium text-black">
            Categoría
          </label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={tipos.categoria_id}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded bg-white text-black"
            disabled={loading}
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          {tipos.categoria_id && categorias.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Actual: {categorias.find(c => c.id === tipos.categoria_id)?.nombre || 'No encontrada'}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-black">
            Nombre del Tipo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={tipos.nombre}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            disabled={loading}
          />
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded m-2 hover:bg-gray-600 disabled:opacity-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded m-2 hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};  

export default EditarTipos;
