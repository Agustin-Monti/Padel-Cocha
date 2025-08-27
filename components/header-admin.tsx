"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";

export default function HeaderAdmin() {
  const supabase = createClient();
  const [userData, setUserData] = useState<{ nombre: string; apellido: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // fuerza reload completo
  };


  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-3 shadow-sm">
      {/* Título */}
      <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>

      {/* Derecha */}
      <div className="flex items-center gap-8">
        {/* Perfil */}
        <div className="flex items-center gap-2">
          <img
            src="/default.png"
            alt="Perfil"
            className="w-9 h-9 rounded-full border border-gray-300"
          />
          <span className="text-gray-700 font-medium whitespace-nowrap">
            {userData ? `${userData.nombre} ${userData.apellido}` : "Cargando..."}
          </span>
        </div>

        {/* Logout en otro bloque */}
        <div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
