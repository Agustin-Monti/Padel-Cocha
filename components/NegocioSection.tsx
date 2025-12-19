"use client";

import { Truck, RefreshCw, MessageCircle, ShieldCheck, Star, Zap, Users, Target } from "lucide-react";
import { useState } from "react";

const NegocioSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sections = [
    {
      icon: Truck,
      title: "Envío a Domicilio Express",
      description: "Recibí tu compra en 24/48hs en cualquier parte del país. Envíos gratuitos a partir de $50.000.",
      color: "from-blue-600 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      features: ["Seguimiento en tiempo real", "Envío express disponible", "Paquetería segura"],
      stat: "24-48hs"
    },
    {
      icon: RefreshCw,
      title: "Permutas y Venta de Usados",
      description: "Comprá, vendé o permutá tu equipo. Te asesoramos en la tasación y publicación.",
      color: "from-emerald-600 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      features: ["Tasación profesional", "Publicación gratuita", "Garantía en usados"],
      stat: "+500 transacciones"
    },
    {
      icon: MessageCircle,
      title: "Asesoramiento Personalizado",
      description: "Análisis de juego y recomendación experta para elegir tu paleta ideal.",
      color: "from-purple-600 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      features: ["Análisis de juego", "Prueba de paletas", "Seguimiento post-venta"],
      stat: "99% satisfacción"
    },
    {
      icon: ShieldCheck,
      title: "Garantía Extendida",
      description: "Garantía oficial + 6 meses extra y servicio técnico especializado.",
      color: "from-amber-600 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      features: ["Garantía extendida", "Service oficial", "Repuestos originales"],
      stat: "12+ meses"
    },
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-500/5 to-transparent rounded-full translate-x-1/3 translate-y-1/3" />
      
      {/* Patrón de puntos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-500 rounded-full" />
        <div className="absolute top-40 right-20 w-2 h-2 bg-purple-500 rounded-full" />
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-emerald-500 rounded-full" />
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-amber-500 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header con estadísticas */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
          <div className="text-center lg:text-left mb-8 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              <span>EXPERIENCIA PREMIUM</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Más que una tienda, 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                tu partner de pádel
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Servicios diseñados para jugadores exigentes que buscan la mejor experiencia de compra y asesoramiento.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">1K+</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Clientes satisfechos</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-bold text-gray-900">99%</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Recomiendan</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span className="text-2xl font-bold text-gray-900">24h</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Envío express</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">12+</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Meses garantía</p>
            </div>
          </div>
        </div>

        {/* Grid de beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map(({ icon: Icon, title, description, color, bgColor, features, stat }, index) => (
            <div
              key={index}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Card principal */}
              <div className={`h-full rounded-2xl border border-gray-200 ${bgColor} p-6 transition-all duration-300
                ${hoveredIndex === index ? 'shadow-2xl scale-[1.02] border-transparent' : 'shadow-lg hover:shadow-xl'}`}
              >
                {/* Badge de estadística */}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
                    {stat}
                  </div>
                </div>

                {/* Icono con efecto */}
                <div className="mb-6 relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${color} p-3 transform group-hover:rotate-12 transition-transform duration-300
                    ${hoveredIndex === index ? 'shadow-lg' : 'shadow-md'}`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  {/* Efecto de brillo */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`} />
                </div>

                {/* Contenido */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {description}
                </p>

                {/* Lista de features */}
                <ul className="space-y-2 mb-6">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${color}`} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
              </div>

              {/* Efecto de borde en hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 
                transition-opacity duration-500 -z-10 blur-md`} />
            </div>
          ))}
        </div>

        {/* Sección inferior */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">¿Necesitás ayuda para elegir?</h3>
              <p className="text-blue-100 opacity-90">
                Nuestros expertos están listos para asesorarte personalmente
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                WhatsApp Asesor
              </button>
            </div>
          </div>
          
          {/* Testimonios rápidos */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm italic">"La mejor atención, me ayudaron a elegir la paleta perfecta"</p>
              <p className="text-xs mt-2 text-blue-200">- Martín G.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm italic">"Envío super rápido y producto impecable"</p>
              <p className="text-xs mt-2 text-blue-200">- Ana L.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm italic">"Permuté mi paleta vieja por una nueva, excelente servicio"</p>
              <p className="text-xs mt-2 text-blue-200">- Carlos R.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegocioSection;
