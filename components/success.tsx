// app/success/SuccessClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useCarrito } from "@/context/CarritoContext";


export default function SuccessClient() {
  const router = useRouter();
  const { vaciarCarrito } = useCarrito();

  useEffect(() => {
    vaciarCarrito();
  }, [vaciarCarrito]);

  const goToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-6">
          El pago ha sido procesado correctamente. <br />
          Se han enviado los detalles de su compra a su correo electrónico.
          <br />
          <span className="block mt-2 font-medium text-beige-700">
            ¡Muchas gracias por confiar en nosotros!
          </span>
        </p>
        <button
          onClick={goToHome}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
        >
          Ir al Inicio
        </button>
      </div>
    </div>
  );
}
