'use client';
import { useEffect, useState } from 'react';
import { fetchMetodos } from '@/actions/metodos-actions';
import TableMetodos from '@/components/TableMetodos';
import MetodoModal from '@/components/MetodoModal';

export default function MetodosPage() {
  const [metodos, setMetodos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const loadMetodos = async () => {
    try {
      const data = await fetchMetodos();
      setMetodos(data);
    } catch (error) {
      console.error('Error al cargar métodos:', error);
    }
  };

  useEffect(() => {
    loadMetodos();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Métodos de Envío</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          + Agregar Método
        </button>
      </div>
      <TableMetodos metodos={metodos} />
      {showModal && (
        <MetodoModal
          onClose={() => setShowModal(false)}
          onCreated={loadMetodos}
        />
      )}
    </div>
  );
}
