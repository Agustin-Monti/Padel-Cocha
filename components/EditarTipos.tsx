import React, { useState, useEffect } from 'react';
import { guardarEditCategoria } from '@/actions/categorias-actions';

export type Tipos = {
  id: string;
  categoria_id: string;
  nombre: string; 
};

interface EditarTiposProps {
  isOpen: boolean;
  onClose: () => void;
  tipoId: string | null;
  tiposDetalles: Tipos | null;
  onSave: (tipos: Tipos) => Promise<void>;
}

const EditarTipos: React.FC<EditarTiposProps> = ({
  isOpen,
  onClose,
  tipoId,
  tiposDetalles,
  onSave,
}) => {
  const [tipos, setTipos] = useState<Tipos | null>(tiposDetalles);

  useEffect(() => {
    if (tiposDetalles) {
        setTipos(tiposDetalles);
    }
  }, [tiposDetalles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tipos) {
        setTipos({
        ...tipos,
        [e.target.name]: e.target.value,
      });
    }
  };

  

  const handleSave = async () => {
    if (tipos) {
      const formData = new FormData();
      formData.append('id', tipos.id);
      formData.append('nombre', tipos.nombre);
  
      
  
      const result = await guardarEditCategoria(formData);
  
      if (result) {
        onSave(tipos);
        onClose();
      } else {
        alert('Hubo un error al guardar el producto');
      }
    }
  };
  

  if (!isOpen || !tipos) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-black">Editar Tipo de Producto</h2>
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-black">Categorias</label>
          
        </div>
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-black">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={tipos.nombre}
            onChange={handleChange}
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

export default EditarTipos;
