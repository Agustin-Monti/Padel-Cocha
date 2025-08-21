import Image from 'next/image';

const NegocioSection = () => {
  const sections = [
    {
      image: "/negocio/Domicilio.webp",
      title: "Envío a Domicilio",
      description: "Recibí tu compra en cualquier parte del país.",
      width: 80,
      height: 80,
    },
    {
      image: "/negocio/Cambios.webp",
      title: "Cambios y Devoluciones",
      description: "Hasta 30 días después de recibida la compra",
      width: 80,
      height: 80,
    },
    {
      image: "/negocio/Financiacio.webp",
      title: "Financiación",
      description: "3 & 6 Cuotas sin interés. Aceptamos todos los medios de pagos",
      width: 80,
      height: 80,
    },
    {
      image: "/negocio/Pick.webp",
      title: "Pick Up",
      description: "Sin cargo en tiendas habilitadas",
      width: 70,
      height: 70,
    },
  ];

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-10" style={{ backgroundColor: '#e6dfd6' }}>
      {/* Título decorado */}
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

      {/* Grid de beneficios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 rounded-lg">
        {sections.map((section, index) => (
          <div key={index} className="flex flex-col items-center text-center">
           <div
              className="mb-4 flex items-center justify-center relative"
              style={{ width: section.width, height: section.height }}
            >
              <Image
                src={section.image}
                alt={section.title}
                fill
                sizes="(max-width: 768px) 50px, 80px"
                className="object-contain"
              />
            </div>


            <div className="h-32 flex flex-col justify-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h2>
              <p className="text-gray-600">{section.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NegocioSection;
