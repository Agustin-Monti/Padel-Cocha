"use client";

import { useState, useEffect } from "react";
import { forgotPasswordAction } from "@/actions/auth-actions/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import Alerta from "@/components/alerta";

export default function ForgotPasswordClient({ searchParams }: { searchParams: { message?: string; error?: string } }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (searchParams.message) {
      if (searchParams.error) {
        setMessage({ error: searchParams.message });
      } else {
        setAlertMessage(searchParams.message);
        setShowAlert(true);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (formData: FormData) => {
    const result = await forgotPasswordAction(formData);
    if ("error" in result) {
      setMessage({ error: result.error });
    } else if ("success" in result) {
      setAlertMessage("Te hemos enviado un email para restablecer tu contraseña.");
      setShowAlert(true);
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
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Recuperar Contraseña</h1>
          <p className="mt-5 text-sm text-gray-600">
            Ingresa tu email para recibir un enlace de recuperación.
            <br />
            <br />
            ¿Ya tienes una cuenta?{" "}
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
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@correo.com"
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <SubmitButton
            pendingText="Enviando email..."
            className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 py-2 text-white font-semibold hover:opacity-90 transition"
          >
            Enviar enlace
          </SubmitButton>
        </form>

      </div>

      <Alerta
        mensaje={alertMessage}
        visible={showAlert}
        onClose={() => {
          setShowAlert(false);
          if (!message) window.location.href = "/sign-in";
        }}
      />
    </div>
  );
}
