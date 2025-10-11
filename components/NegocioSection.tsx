import { Truck, RefreshCw, MessageCircle, ShieldCheck  } from "lucide-react";

const NegocioSection = () => {
  const sections = [
    {
      icon: Truck,
      title: "Envío a Domicilio",
      description: "Recibí tu compra en cualquier parte del país.",
    },
    {
      icon: RefreshCw,
      title: "Permutas y Publicar mi Producto",
      description: "Tanto comprar como vender tu producto en nuestra pagina.",
    },
    {
      icon: MessageCircle,
      title: "Asesoramiento Personalizado",
      description: "Te ayudamos a elegir el producto ideal para vos.",
    },
    {
      icon: ShieldCheck,
      title: "Garantía Oficial",
      description: "Todos nuestros productos cuentan con garantía oficial.",
    },
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-10 bg-gradient-to-br from-[#f9f5f0] to-[#e6dfd6]">
      {/* Título */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2 w-full max-w-[150px]">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-full" />
          <div className="h-[2px] bg-gradient-to-r from-blue-800 to-indigo-900 flex-1" />
        </div>
        <h2 className="text-2xl md:text-3xl font-anton font-bold text-[#303ec5] mx-4 text-center whitespace-nowrap">
          Conocé Nuestros Beneficios
        </h2>
        <div className="flex items-center gap-2 w-full max-w-[150px]">
          <div className="h-[2px] bg-gradient-to-r from-blue-800 to-indigo-900 flex-1" />
          <div className="w-2 h-2 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-full" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {sections.map(({ icon: Icon, title, description }, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm transition-transform hover:scale-105"
          >
            <div className="w-20 h-20 flex items-center justify-center mb-4 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-full shadow-inner">
              <Icon className="w-10 h-10 text-[#f8f8f8]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NegocioSection;
