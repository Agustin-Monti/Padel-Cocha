import type { Metadata } from "next";
import Tabs from '@/components/Tabs';

export const metadata: Metadata = {
  title: "• Punto Padel LF • Perfil",
  description: "Accedé a la información de tu cuenta, pedidos y más en tu perfil de Punto Padel LF.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header del perfil */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Mi Perfil
              </h1>
              <p className="text-gray-600 text-lg">
                Administra tu información personal, seguridad y actividad
              </p>
            </div>
          </div>
          
          {/* Progress bar decorativa */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-2"></div>
          <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-70"></div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <Tabs />
        </div>
      </div>
    </div>
  );
}
