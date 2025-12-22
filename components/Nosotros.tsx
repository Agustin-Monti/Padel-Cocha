"use client";

import Image from "next/image";
import Instagram from "@/components/Instagram";

export default function Nosotros() {
  return (
    <section className="w-full bg-gradient-to-br from-[#f9f5f0] to-[#e6dfd6] py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header del section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Nuestra Comunidad
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conectamos con nuestra comunidad a través de las redes sociales y compartimos nuestra pasión por el pádel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start relative">
          {/* Línea divisoria vertical solo en desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c4b8a9] to-transparent z-0" />

          {/* Columna izquierda: Instagram - Más ancha */}
          <div className="z-10 lg:-ml-4">
            <Instagram />
          </div>

          {/* Columna derecha: Relato del propietario */}
          <div className="flex flex-col gap-8 text-gray-800 z-10 lg:pl-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <div className="relative">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden relative ring-4 ring-white shadow-xl">
                    <Image
                      src="/cocha.jpeg"
                      alt="Luciano Forti - Fundador"
                      fill
                      sizes="(max-width: 768px) 128px, 144px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Fundador
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Luciano Forti
                  </h3>
                  <p className="text-amber-600 font-medium mb-4">
                    Fundador de Punto Padel LF
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">5+</div>
                      <div className="text-sm text-gray-600">Años de experiencia</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">1000+</div>
                      <div className="text-sm text-gray-600">Clientes satisfechos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">50+</div>
                      <div className="text-sm text-gray-600">Marcas asociadas</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <p className="leading-relaxed text-gray-700 text-lg">
                  En <span className="font-semibold text-amber-700">Punto Padel LF</span>, nuestra misión es ofrecer productos de la más alta calidad y asesoramiento personalizado a cada cliente. Somos apasionados del pádel y creemos en la cercanía con nuestra comunidad.
                </p>
                
                <p className="leading-relaxed text-gray-700">
                  Cada artículo que ves en nuestra tienda fue cuidadosamente seleccionado pensando en vos, en tu juego y en tu experiencia. Desde paletas hasta accesorios, todo pasa por un riguroso proceso de selección.
                </p>
                
                <p className="leading-relaxed text-gray-700 font-medium">
                  ¡Gracias por ser parte de esta historia y por confiar en nosotros para acompañarte en cada punto!
                </p>
              </div>

              {/* Firma */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Seguime en:</span>
                  <div className="flex gap-3 mt-2">
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition">
                      Instagram
                    </a>
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition">
                      LinkedIn
                    </a>
                    <a href="#" className="text-gray-600 hover:text-amber-600 transition">
                      Twitter
                    </a>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-amber-700 font-signature text-xl">Luciano Forti</div>
                  <div className="text-xs text-gray-500">Fundador & CEO</div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
}

