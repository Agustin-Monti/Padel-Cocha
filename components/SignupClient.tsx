"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/actions/auth-actions/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Alerta from "@/components/alerta";

export default function SignupClient({ searchParams }: { searchParams: { message?: string; error?: string } }) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (searchParams.message) {
      if (searchParams.error) {
        setMessage({ error: searchParams.message });
      } else {
        setMessage({ success: searchParams.message });
      }
    }
  }, [searchParams]);

  const handleSubmit = async (formData: FormData) => {
    const result = await signUpAction(formData);

    if (result?.error) {
      setMessage({ error: result.error });
    } else if (result?.success) {
      setAlertMessage("¡Registro exitoso! Por favor verifica tu email.");
      setShowAlert(true);
      setTimeout(() => router.push("/sign-in"), 3000);
    }
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
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tenés una cuenta?{" "}
            <Link href="/sign-in" className="text-blue-600 font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>

        {message && (
          <div className="mb-4">
            <FormMessage message={message} />
          </div>
        )}

        <form className="space-y-5" action={handleSubmit}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="correo@ejemplo.com"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Tu contraseña"
              minLength={6}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Botón */}
          <SubmitButton
            pendingText="Registrando..."
            className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 py-2 text-white font-semibold hover:opacity-90 transition"
          >
            Registrarse
          </SubmitButton>
        </form>
      </div>

      <Alerta mensaje={alertMessage} visible={showAlert} onClose={() => setShowAlert(false)} />
    </div>
  );
}
