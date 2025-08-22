"use client";

import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export default function Contacto() {
  return (
    <section className="relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-6 rounded-2xl shadow-lg overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-20">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          fill="none"
          viewBox="0 0 1200 800"
        >
          <path
            d="M0 0L1200 0L1200 800L0 800Z"
            fill="url(#paint0_radial)"
          />
          <defs>
            <radialGradient
              id="paint0_radial"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(600 400) rotate(90) scale(800 1200)"
            >
              <stop stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Texto */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Tenés un producto usado?
          </h2>
          <p className="text-lg md:text-xl mb-6">
            Ponelo en manos de alguien que lo necesite. Contactanos y subí tu
            producto usado fácilmente con nuestro formulario.
          </p>

          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-gray-100 transition"
          >
            <Package size={20} />
            Vender mi producto
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Dibujo / ilustración */}
        <div className="flex-1 flex justify-center">
          <img
            src="/sell-illustration.svg"
            alt="Vender producto"
            className="w-72 md:w-96 drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
