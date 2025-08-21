import type { Metadata } from "next";
import ForgotPasswordClient from "@/components/ForgotPasswordClient";

export const metadata: Metadata = {
  title: "• Punto Padel LF • Recuperar contraseña",
  description: "Ingresa tu email para recibir un enlace de recuperación de contraseña en Punto Padel LF.",
};

export default function ForgotPasswordPage({ searchParams }: { searchParams: any }) {
  return <ForgotPasswordClient searchParams={searchParams} />;
}
