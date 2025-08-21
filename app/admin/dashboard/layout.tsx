"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import HeaderAdmin from "@/components/header-admin"; 
import Sidebar from "@/components/sidebar"; 
import "./dashboard.css"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/admin"); // Redirigir al login si no hay sesión
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("admin")
        .eq("id", session.user.id)
        .single();

      if (error || !profile?.admin) {
        router.push("/admin"); // Redirigir si no es administrador
        return;
      }

      setLoading(false); // Deja de cargar cuando se autentica
    };

    checkAuth();
  }, [router]);

  // Mostrar un loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex flex-col flex-1 bg-gray-100">
        <HeaderAdmin />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

      </div>
    </div>
  );
}
