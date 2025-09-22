import ContactClient from "@/components/ContactClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto - Vende tu producto usado",
  description: "Formulario de contacto para enviar tu producto usado al negocio",
};

export default function ContactPage() {
  return <ContactClient />;
}
