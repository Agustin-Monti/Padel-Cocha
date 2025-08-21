import type { Metadata } from "next";
import Tabs from '@/components/Tabs';

export const metadata: Metadata = {
  title: "• Punto Padel LF • Perfil",
  description: "Accedé a la información de tu cuenta, pedidos y más en tu perfil de Punto Padel LF.",
};

export default function ProfilePage() {
  return (
    <main className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mi perfil</h1>
      <Tabs />
    </main>
  );
}
