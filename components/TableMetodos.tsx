

import { useState } from 'react';
import { fetchMetodos } from '@/actions/metodos-actions';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import MetodoModalEdicion from "@/components/MetodoModalEdicion";


type Metodo = {
  id: string;
  empresa: string;
  peso_max: number;
  precio_nacional: number;
  precio_regional: number;
  imagen: string;
};

type Props = {
  metodos: Metodo[];
  onEdit?: (metodo: Metodo) => void;
  onDelete?: (id: string) => void;
};

export default function TableMetodos({ metodos, onEdit, onDelete }: Props) {
    const [metodoSeleccionado, setMetodoSeleccionado] = useState<Metodo | null>(null);
    const [abrirModalEdicion, setAbrirModalEdicion] = useState(false);

    const handleOpenEditarModal = (metodo: Metodo) => {
    setMetodoSeleccionado(metodo);
    setAbrirModalEdicion(true);
    };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Empresa</th>
            <th className="p-2">Peso Máx</th>
            <th className="p-2">Precio Nacional</th>
            <th className="p-2">Precio Regional</th>
            <th className="p-2">Imagen</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {metodos.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2">{m.empresa}</td>
              <td className="p-2">{m.peso_max} kg</td>
              <td className="p-2">${m.precio_nacional}</td>
              <td className="p-2">${m.precio_regional}</td>
              <td className="p-2">
                <img
                  src={m.imagen}
                  alt={m.empresa}
                  className="h-12 w-auto object-contain border rounded"
                />
              </td>
              <td className="p-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditarModal?.(m)}
                    className="bg-blue-500 text-white p-1 rounded flex items-center justify-center w-8 h-8"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete?.(m.id)}
                    className="bg-red-500 text-white p-1 rounded flex items-center justify-center w-8 h-8"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {abrirModalEdicion && metodoSeleccionado && (
        <MetodoModalEdicion
            metodo={metodoSeleccionado}
            onClose={() => setAbrirModalEdicion(false)}
            onUpdate={fetchMetodos}
        />
        )}


    </div>
  );
}
