'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setIsLoading(false);
      if (loginError.message.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("Error al iniciar sesión. Inténtalo de nuevo.");
      }
      return;
    }

    if (!data.user) {
      setIsLoading(false);
      setError("Usuario no encontrado.");
      return;
    }

    const userId = data.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("admin, nombre")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      setIsLoading(false);
      setError("No se pudo obtener el perfil del usuario.");
      return;
    }

    if (!profile.admin) {
      setIsLoading(false);
      setError("No tienes permisos para acceder como administrador.");
      await supabase.auth.signOut();
      return;
    }

    setUserName(profile.nombre || "Admin");
    
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 2000);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {isLoading ? (
        <div className="bg-white p-6 rounded shadow-md w-96 text-center">
          <h2 className="text-xl font-bold">Hola, {userName} 👋</h2>
          <p className="text-gray-500 mt-2">Espera un momento, estamos preparando todo...</p>
        </div>
      ) : (
        <form className="bg-white p-8 rounded shadow-md w-96" onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold text-center mb-6">Inicio de Sesión</h2>
          {error && (
            <div className="bg-red-100 text-red-500 p-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Iniciar Sesión
          </button>
        </form>
      )}
    </div>
  );
}
