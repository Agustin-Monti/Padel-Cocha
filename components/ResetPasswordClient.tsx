"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import Alerta from "@/components/alerta";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordClient() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("Hubo un error al actualizar la contraseña.");
      console.error(error.message);
      return;
    }

    setShowAlert(true);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Logo Punto Padel LF"
            className="mx-auto w-36 h-20 object-contain"
          />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Nueva Contraseña</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ingresá tu nueva contraseña para completar el proceso de recuperación.
          </p>
        </div>

        {message && (
          <div className="mb-4 text-sm text-red-600">{message}</div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Repetir Contraseña</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <SubmitButton
            pendingText="Guardando..."
            className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 py-2 text-white font-semibold hover:opacity-90 transition"
          >
            Guardar nueva contraseña
          </SubmitButton>
        </form>
      </div>

      <Alerta
        mensaje="¡Contraseña actualizada correctamente!"
        visible={showAlert}
        onClose={() => (window.location.href = "/sign-in")}
      />
    </div>
  );
}
