'use client';

import { Loader2 } from 'lucide-react';

interface ModalCargandoProps {
  abierto: boolean;
  mensaje?: string;
}

export default function ModalCargando({ abierto, mensaje }: ModalCargandoProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center space-y-4 w-72">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-800 font-medium text-center">
          {mensaje || 'Procesando...'}
        </p>
      </div>
    </div>
  );
}
