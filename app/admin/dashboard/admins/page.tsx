"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  superadmin: boolean;
  admin: boolean;
}

export default function AdminsPage() {
  const [superAdmins, setSuperAdmins] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      try {
        // 1. Verificar autenticación
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error('Error de autenticación:', authError);
          router.push('/auth/login');
          return;
        }

        // 2. Verificar si es superadmin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, nombre, apellido, email, superadmin, admin')
          .eq('id', authUser.id)
          .single();

        if (profileError || !profile) {
          console.error('Error al cargar perfil:', profileError);
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        if (!profile.superadmin) {
          console.log('Usuario no es superadmin, acceso denegado');
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        // 3. Usuario es superadmin, cargar datos
        setCurrentUser(profile);
        await fetchUsersData();

      } catch (error) {
        console.error('Error inesperado:', error);
        setAccessDenied(true);
        setLoading(false);
      }
    };

    checkAccessAndLoadData();
  }, [router]);

  const fetchUsersData = async () => {
    try {
      const response = await fetch('/api/admin-users');
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const profiles: User[] = await response.json();
      console.log("Perfiles cargados:", profiles);

      const superAdminsList = profiles.filter((user) => user.superadmin);
      const adminsList = profiles.filter((user) => user.admin && !user.superadmin);
      const usersList = profiles.filter((user) => !user.admin && !user.superadmin);

      setSuperAdmins(superAdminsList);
      setAdmins(adminsList);
      setUsers(usersList);
      setLoading(false);

    } catch (error) {
      console.error("Error al obtener perfiles:", error);
      setLoading(false);
    }
  };

  const removeAdmin = async (id: string) => {
    try {
      const response = await fetch('/api/admin-users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, admin: false }),
      });

      if (!response.ok) {
        throw new Error('Error al quitar admin');
      }

      setAdmins((prev) => prev.filter((user) => user.id !== id));
      const removedAdmin = admins.find((u) => u.id === id);
      if (removedAdmin) {
        setUsers((prev) => [...prev, { ...removedAdmin, admin: false }]);
      }
    } catch (error) {
      console.error("Error al quitar admin:", error);
    }
  };

  const makeAdmin = async (id: string) => {
    try {
      const response = await fetch('/api/admin-users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, admin: true }),
      });

      if (!response.ok) {
        throw new Error('Error al asignar admin');
      }

      const newAdmin = users.find((u) => u.id === id);
      if (newAdmin) {
        setAdmins((prev) => [...prev, { ...newAdmin, admin: true }]);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error("Error al asignar admin:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Cargando...</p>;
  }

  if (accessDenied) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
          <p>No tienes permisos de SuperAdmin para acceder a esta página.</p>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // JSX normal de tu página (el que ya tenías)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Administradores</h1>

      {/* 🔹 SuperAdmins */}
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
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-600 mb-4">Admins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((user) => (
              <AdminCard key={user.id} user={user} removeAdmin={removeAdmin} />
            ))}
          </div>
        </section>
      )}

      {/* 🔹 Solo superadmin puede gestionar */}
      {currentUser?.superadmin && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Usuarios disponibles</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No hay usuarios disponibles para asignar como admin.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-lg shadow-md border bg-gray-100 border-gray-300"
                >
                  <h3 className="text-lg font-semibold">
                    {user.nombre} {user.apellido}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">Usuario</p>
                  <button
                    onClick={() => makeAdmin(user.id)}
                    className="mt-3 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Hacer Admin
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// Componente AdminCard (sin cambios)
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
    <div
      className={`p-4 rounded-lg shadow-md border ${
        isSuperAdmin
          ? "bg-blue-100 border-blue-400"
          : "bg-green-100 border-green-400"
      }`}
    >
      <h3 className="text-lg font-semibold">
        {user.nombre} {user.apellido}
      </h3>
      <h3 className="text-lg">
        {user.email} 
      </h3>
      <p
        className={`mt-2 text-sm font-bold ${
          isSuperAdmin ? "text-blue-700" : "text-green-700"
        }`}
      >
        {isSuperAdmin ? "SuperAdmin" : "Admin"}
      </p>

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