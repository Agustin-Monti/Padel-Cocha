import type { Metadata } from "next";
import { signInAction } from "@/actions/auth-actions/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { PasswordInput } from "@/components/PasswordInput";

export const metadata: Metadata = {
  title: "• Punto Padel LF • Iniciar sesión",
  description: "Iniciá sesión para acceder a tu cuenta en Punto Padel LF.",
};

export default function Login({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  // Obtiene el mensaje de error de cualquiera de los dos parámetros
  const errorMessage = searchParams.error || searchParams.message;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Logo Punto Padel LF"
            className="mx-auto w-36 h-20 object-contain"
          />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tenés cuenta?{" "}
            <Link href="/sign-up" className="text-blue-600 font-medium hover:underline">
              Crear una
            </Link>
          </p>
        </div>

        <form className="space-y-5" action={signInAction}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="correo@correo.com"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <PasswordInput
              name="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Botón */}
          <SubmitButton
            pendingText="Ingresando..."
            className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 py-2 text-white font-semibold hover:opacity-90 transition"
          >
            Iniciar sesión
          </SubmitButton>

          {/* Mensaje - Siempre visible si hay un mensaje */}
          {errorMessage && (
            <FormMessage 
              message={{ error: errorMessage }}
            />
          )}
        </form>
      </div>
    </div>
  );
}
