// app/success/page.tsx
import SuccessClient from "@/components/success";
import type { Metadata } from "next";

export const metadata = {
  title: "Pago Exitoso - Punto Padel LF",
  description: "Tu pago ha sido procesado correctamente.",
};

export default function SuccessPage() {
  return <SuccessClient />;
}
