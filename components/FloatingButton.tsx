import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa"; // Importamos el icono de WhatsApp

export default function FloatingButton() {
  const phoneNumber = "+5493445532916"; // Reemplaza con tu número de WhatsApp (sin espacios ni símbolos)
  const message = encodeURIComponent("¡Hola! Vengo de la Pagina y Me gustaría obtener más información."); // Mensaje predeterminado

  return (
    <Link
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 bg-green-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg 
                 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
                 border-2 border-transparent flex items-center gap-2 animate-bounce-light"
    >
      <FaWhatsapp size={24} className="animate-glow" /> {/* Ícono con efecto de brillo */}
      Asesoramiento Personalizado
    </Link>
  );
}