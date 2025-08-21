"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function HeaderAdmin() {
  const supabase = createClient();
  const [userData, setUserData] = useState<{ nombre: string; apellido: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Buscar en la tabla "profiles" el nombre y apellido del usuario
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("nombre, apellido")
          .eq("id", user.id)
          .single();

        if (profile && !error) {
          setUserData(profile);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="flex items-center justify-between bg-gray-200 p-4 shadow-md">
      {/* Título */}
      <h1 className="text-lg font-bold text-gray-700">Admin Dashboard</h1>

      {/* Perfil */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">
          {userData ? `${userData.nombre} ${userData.apellido}` : "Cargando..."}
        </span>
        <img
          src="/default.png"
          alt="Perfil"
          className="w-8 h-8 rounded-full border border-gray-300"
        />
      </div>
    </header>
  );
}
