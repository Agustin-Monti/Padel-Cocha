// components/SobreNosotrosModal.tsx
"use client";

import { useState } from "react";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export default function SobreNosotrosModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Link que abre el modal */}
      <button
        onClick={() => setOpen(true)}
        className="hover:underline text-sm"
      >
        Sobre nosotros
      </button>

      {/* Fondo oscuro */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* Contenido del modal */}
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Sobre Nosotros
            </h2>

            {/* Tarjeta tipo carnet */}
            <div className="border rounded-xl p-4 shadow-md flex flex-col items-center space-y-4">
              <img
                src="/logo.png" // tu logo
                alt="Logo"
                className="w-20 h-20 rounded-full border"
              />
              <p className="text-center text-gray-600">
                Síguenos en nuestras redes sociales
              </p>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </a>
                <a href="https://www.instagram.com/puntopadel_lf" target="_blank">
                  <Instagram className="w-6 h-6 text-pink-500" />
                </a>
                <a href="https://twitter.com" target="_blank">
                  <Twitter className="w-6 h-6 text-sky-500" />
                </a>
                <a href="mailto:puntopadellf@gmail.com">
                  <Mail className="w-6 h-6 text-gray-500" />
                </a>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full bg-gray-800 text-white py-2 rounded-xl hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
