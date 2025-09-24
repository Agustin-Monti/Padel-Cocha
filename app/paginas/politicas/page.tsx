import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Punto Padel LF",
  description: "Conocé cómo protegemos y utilizamos tu información personal.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#f9f7f4] flex flex-col items-center py-12 px-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Punto Padel LF"
          width={120}
          height={120}
          className="mx-auto"
        />
      </div>

      {/* Contenido */}
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#816b4b] mb-6">
          Política de Privacidad
        </h1>

        <p className="text-gray-600 text-center mb-10">
          Última actualización: 24 de Septiembre de 2025
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#816b4b] mb-2">
              Introducción
            </h2>
            <p>
              En Punto Padel LF nos tomamos muy en serio la protección de tu
              información personal. Esta política explica cómo recopilamos,
              utilizamos y protegemos tus datos cuando utilizás nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#816b4b] mb-2">
              Información que recopilamos
            </h2>
            <p>
              Podemos recopilar datos como nombre, correo electrónico,
              información de contacto y datos de navegación para mejorar tu
              experiencia de usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#816b4b] mb-2">
              Uso de la información
            </h2>
            <p>
              La información recopilada se utiliza exclusivamente para
              brindarte un mejor servicio, gestionar tus compras y enviarte
              comunicaciones relevantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#816b4b] mb-2">
              Seguridad
            </h2>
            <p>
              Implementamos medidas técnicas y organizativas para proteger tus
              datos personales contra accesos no autorizados, pérdidas o
              alteraciones.
            </p>
          </section>
        </div>

        {/* Botón volver */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#816b4b] text-white rounded-xl shadow-md hover:bg-[#6b573c] transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
