"use client";

import { TrashIcon } from "@heroicons/react/24/solid";
import { useFavoritos } from "@/context/FavoritosContext";
import { useRouter } from "next/navigation";
import { Instagram, Facebook, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";



export default function Favorito({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { favoritos, removeFavorito } = useFavoritos();
  const router = useRouter();

  const handleEliminarFavorito = async (id: string) => {
    await removeFavorito(id);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white rounded-l-xl shadow-lg p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">❤️ Favoritos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        {/* Contenido */}
        {favoritos.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p>No tenés productos en favoritos.</p>
            <p className="mt-2 text-sm">¡Explorá y añadí tus preferidos!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {favoritos.map((item) => {
              const { producto } = item;
              if (!producto) return null;

              const mostrarOferta = producto.oferta_activa && producto.precio_oferta;
              const porcentajeDescuento = mostrarOferta
                ? Math.round(100 - (producto.precio_oferta! * 100) / producto.precio)
                : 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4 hover:bg-gray-50 p-2 rounded-md cursor-pointer"
                  onClick={() => router.push(`/products/${producto.id}`)}
                >
                  <img src={producto.imagen} alt={producto.nombre} className="w-16 h-16 object-cover rounded-lg" />

                  <div className="flex-1">
                    <h3 className="text-md font-semibold text-gray-800">{producto.nombre}</h3>
                    {mostrarOferta ? (
                      <div className="text-sm text-gray-600">
                        <span className="text-red-600 font-semibold">
                          ${producto.precio_oferta!.toLocaleString('es-AR')}
                        </span>
                        <span className="ml-2 line-through text-xs text-gray-400">
                          ${producto.precio.toLocaleString()}
                        </span>
                        <span className="ml-2 text-green-600 text-xs">
                          -{porcentajeDescuento}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        ${producto.precio.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarFavorito(producto.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}

            {/* Mensaje final */}
            <div className="text-center mt-6 text-sm text-gray-600">
              ¡Guardá tus favoritos para volver a ellos más tarde! 💖
            </div>
          </div>
        )}

        {/* Footer con redes */}
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">¿Querés saber más de nosotros?</p>
          <div className="flex justify-center gap-6">
            <a
              href="https://wa.me/5493445532916" // ← poné tu número real en formato internacional sin espacios
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
            >
              <FaWhatsapp size={24} className="mb-1" />
              <span className="text-xs">WhatsApp</span>
            </a>

            <a
              href="https://www.instagram.com/puntopadel_lf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-gray-700 hover:text-pink-600 transition"
            >
              <Instagram className="w-6 h-6 mb-1" />
              <span className="text-xs">Instagram</span>
            </a>

            <a
              href="https://www.facebook.com/tu_cuenta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition"
            >
              <Facebook className="w-6 h-6 mb-1" />
              <span className="text-xs">Facebook</span>
            </a>

            <a
              href="mailto:puntopadellf@gmail.com"
              className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
            >
              <Mail className="w-6 h-6 mb-1" />
              <span className="text-xs">Email</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
