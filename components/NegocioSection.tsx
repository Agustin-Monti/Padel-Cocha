import { Truck, RefreshCw, CreditCard, Store } from "lucide-react";

const NegocioSection = () => {
  const sections = [
    {
      icon: Truck,
      title: "Envío a Domicilio",
      description: "Recibí tu compra en cualquier parte del país.",
    },
    {
      icon: RefreshCw,
      title: "Cambios y Devoluciones",
      description: "Hasta 30 días después de recibida la compra",
    },
    {
      icon: CreditCard,
      title: "Financiación",
      description: "3 & 6 Cuotas sin interés. Aceptamos todos los medios de pagos",
    },
    {
      icon: Store,
      title: "Pick Up",
      description: "Sin cargo en tiendas habilitadas",
    },
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-10 bg-[#e6dfd6]">
      {/* Título */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2 w-full max-w-[150px]">
          <div className="w-2 h-2 bg-[#816b4b] rounded-full" />
          <div className="h-[2px] bg-[#816b4b] flex-1" />
        </div>
        <h2 className="text-2xl md:text-3xl font-amatic font-bold text-[#816b4b] mx-4 text-center whitespace-nowrap">
          Conocé nuestros beneficios
        </h2>
        <div className="flex items-center gap-2 w-full max-w-[150px]">
          <div className="h-[2px] bg-[#816b4b] flex-1" />
          <div className="w-2 h-2 bg-[#816b4b] rounded-full" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {sections.map(({ icon: Icon, title, description }, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm transition-transform hover:scale-105"
          >
            <div className="w-20 h-20 flex items-center justify-center mb-4 bg-[#f4eee7] rounded-full shadow-inner">
              <Icon className="w-10 h-10 text-[#816b4b]" />
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
