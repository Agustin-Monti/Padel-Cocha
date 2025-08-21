"use client";

import Link from "next/link";

interface ModalUserProps {
  isOpen: boolean; // 'isOpen' debe ser un booleano
  onClose: () => void; // 'onClose' es una función sin parámetros que no retorna nada
}

export default function ModalUser({ isOpen, onClose }: ModalUserProps) {
  if (!isOpen) return null; // Si isOpen es falso, no renderizar el modal

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Botón para cerrar el modal */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✖
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">Bienvenido</h2>
        <div className="flex flex-col space-y-4">
          {/* Botón para redirigir a iniciar sesión */}
          <Link href="/sign-in">
            <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full">
              Iniciar Sesión
            </button>
          </Link>
          {/* Botón para redirigir a registrarse */}
          <Link href="/sign-up">
            <button className="bg-green-500 text-white p-2 rounded hover:bg-green-600 w-full">
              Registrarse
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
