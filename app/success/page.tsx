"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react"; // usa Lucide para íconos modernos
import "./success.css"; // opcional si tenés clases personalizadas

export default function SuccessPage() {
  const router = useRouter();

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
          <span className="block mt-2 font-medium text-beige-700">¡Muchas gracias por confiar en nosotros!</span>
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
