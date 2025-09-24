"use client";

import { useEffect, useState } from "react";
import { getUsuarios } from "@/actions/usuarios-actions";
import { Eye, Trash2 } from "lucide-react";
import ModalUsuario from "@/components/ModalUsuario";

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const data = await getUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener usuarios", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsuarios();
  }, []);

  const handleOpenEditarModal = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  };

  const handleCloseModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
  };

  const onDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      // Lógica para eliminar (por ahora simulado)
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    }
  };

  if (loading) return <p className="text-gray-600">Cargando usuarios...</p>;

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white text-sm text-left text-gray-800">
        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3">Nombre</th>
            <th className="px-6 py-3">Apellido</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-6 py-4">{usuario.nombre || "—"}</td>
              <td className="px-6 py-4">{usuario.apellido || "—"}</td>
              <td className="px-6 py-4">{usuario.email || "—"}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenEditarModal(usuario)}
                    className="bg-blue-500 text-white p-1 rounded flex items-center justify-center w-8 h-8"
                    title="Ver"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(usuario.id)}
                    className="bg-red-500 text-white p-1 rounded flex items-center justify-center w-8 h-8"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalUsuario
        open={modalAbierto}
        onClose={handleCloseModal}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
}
