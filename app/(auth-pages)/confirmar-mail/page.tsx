// app/(auth-pages)/confirmar-mail/page.tsx
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "• Punto Padel LF • Confirmacion de Email",
  description: "Confirmacion de Email de Punto Padel LF.",
};

export default function ConfirmarMail() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 p-6">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md text-center animate-fadeIn">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 drop-shadow-lg" />
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          ¡Email confirmado!
        </h1>
        
        <p className="text-gray-700 mb-8 leading-relaxed">
          Tu dirección de email ha sido verificada correctamente.  
          Ya puedes iniciar sesión en tu cuenta.
        </p>
        
        <Link
          href="/sign-in"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
