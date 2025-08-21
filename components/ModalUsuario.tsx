"use client";

interface ModalUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario: any | null;
}

export default function ModalUsuario({ open, onClose, usuario }: ModalUsuarioProps) {
  if (!open || !usuario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        {/* Título */}
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Detalle del Usuario</h2>

        {/* Contenido en 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-base">
          <p><strong>Nombre:</strong> {usuario.nombre || "—"}</p>
          <p><strong>Apellido:</strong> {usuario.apellido || "—"}</p>
          <p><strong>Email:</strong> {usuario.email || "—"}</p>
          <p><strong>Teléfono:</strong> {usuario.telefono || "—"}</p>
          <p><strong>Dirección:</strong> {usuario.direccion || "—"}</p>
          <p><strong>Fecha de registro:</strong> {new Date(usuario.created_at).toLocaleString()}</p>
          {/* Agregá más campos si es necesario */}
        </div>
      </div>
    </div>
  );
}
