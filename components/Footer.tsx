"use client";
import { Facebook, Instagram, MapPin, Mail, Phone } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import SobreNosotrosModal  from "@/components/SobreNosotrosModal";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-gray-700 mt-16 border-t">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png" // Asegurate que tu logo esté en public/logo.png
            alt="Logo"
            width={150}
            height={150}
            className="rounded-xl"
          />
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contacto</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Gobernador Mansilla - Paraná Entre Rios, Argentina
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> puntopadellf@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +54 9 3445 532916
            </li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
          <ul className="flex space-x-4">
            <li>
              <a
                href="https://www.instagram.com/puntopadel_lf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 transition"
              >
                <Instagram size={24} />
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/tuusuario"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition"
              >
                <Facebook size={24} />
              </a>
            </li>
            <li>
                <a
                    href="https://www.tiktok.com/@tuusuario"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition"
                >
                    <FaTiktok size={24} />
                </a>
            </li>
          </ul>
        </div>

        {/* Enlaces útiles */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Enlaces útiles</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <SobreNosotrosModal />
            </li>
            <li>
              <a href="/paginas/terminos-y-condiciones" className="hover:underline">Términos y condiciones</a>
            </li>
            <li>
              <a href="/paginas/politicas" className="hover:underline">Política de privacidad</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Pie de página */}
      <div className="border-t text-center py-4 text-xs text-gray-500">
        © 2025 <span className="mx-1">•</span><span className="font-semibold">Punto Padel LF</span><span className="mx-1">•</span> Todos los derechos reservados.
      </div>
    </footer>
  );
}
