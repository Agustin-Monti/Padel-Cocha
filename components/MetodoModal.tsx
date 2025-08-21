'use client';
import { useState } from 'react';
import { crearMetodo } from '@/actions/metodos-actions';
import { createClient } from "@/utils/supabase/client";


type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function MetodoModal({ onClose, onCreated }: Props) {
  const [formData, setFormData] = useState({
    empresa: '',
    peso_max: 0,
    precio_nacional: 0,
    precio_regional: 0,
    imagen: '',
  });
  const supabase = createClient();
  
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'empresa' || name === 'imagen' ? value : parseFloat(value),
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const filePath = `metodos/${Date.now()}_${file.name}`;

  // Subir al bucket "productos"
  const { error } = await supabase.storage
    .from('productos')
    .upload(filePath, file);

  if (error) {
    alert('Error al subir imagen');
    console.error(error);
    return;
  }

  // Obtener la URL pública
  const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
  const publicUrl = data.publicUrl;

  // Setear en el estado de tu formulario
  setFormData((prev) => ({
    ...prev,
    imagen: publicUrl,
  }));
};

  const handleSubmit = async () => {
    try {
      await crearMetodo(formData);
      onCreated();
      onClose();
    } catch (error) {
      alert('Error al crear método de envío');
    }
  };



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Nuevo Método de Envío</h2>
        <div className="space-y-3">
          <input type="text" name="empresa" placeholder="Empresa" onChange={handleChange} className="input" />
          <input type="number" name="peso_max" placeholder="Peso Máximo (kg)" onChange={handleChange} className="input" />
          <input type="number" name="precio_nacional" placeholder="Precio Nacional" onChange={handleChange} className="input" />
          <input type="number" name="precio_regional" placeholder="Precio Regional" onChange={handleChange} className="input" />
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e)} className="input" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
        </div>
      </div>
    </div>
  );
}
