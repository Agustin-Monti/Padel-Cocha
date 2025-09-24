"use client";

import Image from "next/image";
import Instagram from "@/components/Instagram";

export default function Nosotros() {
  return (
    <section className="w-full bg-gradient-to-br from-[#f9f5f0] to-[#e6dfd6] py-12 px-4 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start relative">
        {/* Línea divisoria vertical solo en desktop */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-[#c4b8a9] z-0" />

        {/* Columna izquierda: Instagram */}
        <div className="z-10">
          <Instagram />
        </div>

        {/* Columna derecha: Relato del propietario */}
        <div className="flex flex-col gap-6 text-gray-800 z-10">
          <div className="flex flex-col items-center md:flex-row md:items-center gap-4 text-center md:text-left">
            <div className="w-24 h-24 rounded-full overflow-hidden relative">
              <Image
                src="/propietario.png"
                alt="Propietario"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold">Luciano Forti</h3>
              <p className="text-sm text-gray-500">Fundador de Punto Padel LF</p>
            </div>
          </div>

          <p className="leading-relaxed text-justify md:text-left">
            En Punto Padel LF, nuestra misión es ofrecer productos de calidad y asesoramiento personalizado a cada
            cliente. Somos apasionados del pádel y creemos en la cercanía con nuestra comunidad. Cada artículo que ves
            en nuestra tienda fue seleccionado pensando en vos. ¡Gracias por ser parte de esta historia!
          </p>
        </div>
      </div>
    </section>
  );
}
