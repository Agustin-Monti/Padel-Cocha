'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { guardarEdit } from '@/actions/metodos-actions';

type Metodo = {
  id: string;
  empresa: string;
  peso_max: number;
  precio_nacional: number;
  precio_regional: number;
  imagen: string;
};

type Props = {
  metodo: Metodo;
  onClose: () => void;
  onUpdate: () => void;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MetodoModalEdicion({ metodo, onClose, onUpdate }: Props) {
  const [formData, setFormData] = useState({ ...metodo });
  const [imagenAnterior, setImagenAnterior] = useState(metodo.imagen);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaImagen(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      form.append('id', metodo.id);
      form.append('empresa', formData.empresa);
      form.append('peso_max', String(formData.peso_max));
      form.append('precio_nacional', String(formData.precio_nacional));
      form.append('precio_regional', String(formData.precio_regional));
      form.append('imagenAnterior', imagenAnterior || '');

      if (nuevaImagen) {
        form.append('nuevaImagen', nuevaImagen);
      }

      const res = await fetch('/api/actualizar_imagen_metodo', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al actualizar');
        return;
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar');
    }
  };

  return (
    <div className="modal bg-white p-4 rounded shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Editar Método de Envío</h2>

      <input
        type="text"
        name="empresa"
        value={formData.empresa}
        onChange={handleChange}
        placeholder="Empresa"
        className="input mb-2 w-full border p-2 rounded"
      />
      <input
        type="number"
        name="peso_max"
        value={formData.peso_max}
        onChange={handleChange}
        placeholder="Peso máximo"
        className="input mb-2 w-full border p-2 rounded"
      />
      <input
        type="number"
        name="precio_nacional"
        value={formData.precio_nacional}
        onChange={handleChange}
        placeholder="Precio nacional"
        className="input mb-2 w-full border p-2 rounded"
      />
      <input
        type="number"
        name="precio_regional"
        value={formData.precio_regional}
        onChange={handleChange}
        placeholder="Precio regional"
        className="input mb-2 w-full border p-2 rounded"
      />

      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
      {formData.imagen && (
        <img src={formData.imagen} alt="Vista previa" className="h-24 mb-2" />
      )}

      <div className="flex gap-2">
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
          Actualizar
        </button>
        <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </div>
  );
}
