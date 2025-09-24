import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Punto Padel LF",
  description: "Leé nuestros términos y condiciones de uso del sitio.",
};

export default function TerminosPage() {
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
          Términos y Condiciones de Uso
        </h1>

        <p className="text-gray-600 text-center mb-10">
          Última actualización: 24 de Septiembre de 2025
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#816b4b] mb-2">
              Bienvenidos a Punto Padel LF
            </h2>
            <p>
              En nuestra empresa, nos dedicamos a ofrecer soluciones innovadoras
              y de alta calidad para nuestros clientes. Con años de experiencia
              en el sector, trabajamos incansablemente para brindar los mejores
              productos y servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#816b4b] mb-2">
              Nuestra Misión
            </h2>
            <p>
              Nuestra misión es transformar ideas en soluciones concretas que
              ayuden a nuestros clientes a alcanzar sus objetivos. Contamos con
              un equipo de profesionales altamente capacitados que están
              comprometidos con la excelencia y la innovación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#816b4b] mb-2">
              Nuestros Valores
            </h2>
            <p>
              Valoramos la transparencia, la honestidad y la responsabilidad en
              todos nuestros procesos. Nos aseguramos de que cada cliente reciba
              un servicio personalizado, adaptado a sus necesidades
              específicas.
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
