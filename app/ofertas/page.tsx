// app/ofertas/page.tsx

import { getProductosEnOferta, getTiposDeProductos } from "@/actions/oferta-actions";
import dynamic from "next/dynamic";
import { Metadata } from "next";

const ProductoCategoryClient = dynamic(() => import("@/components/ProductoCategoryClient"), {
  ssr: false,
});

// ✅ Metadata
export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "• Punto Padel LF • Ofertas",
    description: "¡Aprovechá las mejores ofertas!",
  };
};

export default async function OfertasPage() {
  const productos = await getProductosEnOferta();
  const tiposProductos = await getTiposDeProductos();

  console.log("➡️ Productos en oferta:", productos);
  console.log("➡️ Tipos de productos:", tiposProductos);

  return (
    <main>
      <h1 className="text-3xl font-bold text-center my-6 text-red-600">¡Ofertas Disponibles!</h1>
      <ProductoCategoryClient productos={productos} tiposProductos={tiposProductos} />
    </main>
  );
}
