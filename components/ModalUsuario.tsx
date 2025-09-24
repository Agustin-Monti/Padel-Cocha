"use client";


import { useEffect, useState } from "react";
import { getDirecciones } from "@/actions/usuarios-actions";

interface ModalUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario: any | null;
}

export default function ModalUsuario({ open, onClose, usuario }: ModalUsuarioProps) {
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);

  useEffect(() => {
    if (usuario?.id && open) {
      setLoadingDirecciones(true);
      getDirecciones(usuario.id)
        .then(setDirecciones)
        .catch((err) => console.error("Error al cargar direcciones", err))
        .finally(() => setLoadingDirecciones(false));
    } else {
      setDirecciones([]);
    }
  }, [usuario, open]);

  if (!open || !usuario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* Imagen tipo carnet */}
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative">
          <img
            src={usuario.foto || "/default.png"}
            alt="Foto Usuario"
            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
          />

          {/* Botón cerrar sobre la imagen */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        {/* Contenido estilo carnet */}
        <div className="p-6 text-gray-700">
          <h2 className="text-2xl font-bold text-center mb-4">{usuario.nombre} {usuario.apellido}</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {usuario.email || "No tiene Email registrado"}</p>
            <p><strong>Teléfono:</strong> {usuario.telefono || "No tiene Teléfono registrado"}</p>
            <p><strong>Registrado:</strong> {new Date(usuario.created_at).toLocaleDateString()}</p>
            {/* Direcciones */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Direcciones</h3>
              {loadingDirecciones ? (
                <p className="text-gray-500 text-sm">Cargando direcciones...</p>
              ) : direcciones.length > 0 ? (
                <ul className="list-disc list-inside text-sm space-y-1">
                  {direcciones.map((dir, i) => (
                    <li key={i}>
                      {dir.direccion}
                      {dir.piso ? `, Piso ${dir.piso}` : ""}, 
                      {dir.codigo_postal} - {dir.ciudad}, {dir.provincia}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No tiene direcciones registradas</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-center text-xs text-gray-500">
          ID: {usuario.id}
        </div>
      </div>
    </div>

  );
}
