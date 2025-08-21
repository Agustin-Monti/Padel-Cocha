import type { Metadata } from "next";
import CarritoClient from "@/components/CarritoClient";

export const metadata: Metadata = {
  title: "• La Guillerma • Carrito",
  description: "Revisá y gestioná los productos en tu carrito de compras en La Guillerma.",
};

export default function CartPage() {
  return <CarritoClient />;
}
