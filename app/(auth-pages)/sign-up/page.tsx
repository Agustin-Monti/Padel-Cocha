// app/sign-up/page.tsx
import type { Metadata } from "next";
import SignupClient from "@/components/SignupClient";

export const metadata: Metadata = {
  title: "• Punto Padel LF • Crear cuenta",
  description: "Registrate para acceder a tu cuenta en Punto Padel LF.",
};

export default function SignUpPage({ searchParams }: { searchParams: any }) {
  return <SignupClient searchParams={searchParams} />;
}
