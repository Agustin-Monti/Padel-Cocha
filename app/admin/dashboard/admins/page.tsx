"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface User {
  id: string;
  nombre: string;
  apellido: string;
  superadmin: boolean;
  admin: boolean;
}

export default function AdminsPage() {
  const [superAdmins, setSuperAdmins] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, nombre, apellido, superadmin, admin")
        .or("superadmin.eq.true, admin.eq.true");

      if (error) {
        console.error("Error al obtener perfiles:", error);
        return;
      }

      setSuperAdmins(profiles.filter((user) => user.superadmin));
      setAdmins(profiles.filter((user) => user.admin && !user.superadmin));
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const removeAdmin = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ admin: false }) // 🔹 Cambia el estado de admin a false
      .eq("id", id);

    if (error) {
      console.error("Error al quitar admin:", error);
      return;
    }

    // 🔹 Filtra los admins actualizando el estado
    setAdmins((prevAdmins) => prevAdmins.filter((user) => user.id !== id));
  };

  if (loading) {
    return <p className="text-center text-gray-600">Cargando usuarios...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Administradores</h1>

      {/* 🔹 SuperAdmins (Centrado) */}
      {superAdmins.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-blue-600 mb-4 text-center">SuperAdmins</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {superAdmins.map((user) => (
              <AdminCard key={user.id} user={user} isSuperAdmin />
            ))}
          </div>
        </section>
      )}

      {/* 🔹 Admins */}
      {admins.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-green-600 mb-4">Admins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((user) => (
              <AdminCard key={user.id} user={user} removeAdmin={removeAdmin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// 🔹 Componente de tarjeta con botón para quitar Admin
function AdminCard({
  user,
  isSuperAdmin = false,
  removeAdmin,
}: {
  user: User;
  isSuperAdmin?: boolean;
  removeAdmin?: (id: string) => void;
}) {
  return (
    <div className={`p-4 rounded-lg shadow-md border ${isSuperAdmin ? "bg-blue-100 border-blue-400" : "bg-green-100 border-green-400"}`}>
      <h3 className="text-lg font-semibold">{user.nombre} {user.apellido}</h3>
      <p className={`mt-2 text-sm font-bold ${isSuperAdmin ? "text-blue-700" : "text-green-700"}`}>
        {isSuperAdmin ? "SuperAdmin" : "Admin"}
      </p>
      
      {/* 🔹 Botón solo para Admins */}
      {!isSuperAdmin && removeAdmin && (
        <button
          onClick={() => removeAdmin(user.id)}
          className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Quitar Admin
        </button>
      )}
    </div>
  );
}
