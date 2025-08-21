import type { Metadata } from "next";
import ResetPasswordClient from "@/components/ResetPasswordClient";

export const metadata: Metadata = {
  title: "• Punto Padel LF • Nueva contraseña",
  description: "Ingresá tu nueva contraseña para completar la recuperación en Punto Padel LF.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
