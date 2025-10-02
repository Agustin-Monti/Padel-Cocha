// app/ofertas/page.tsx
import { getProductosEnOferta, getTiposDeProductos } from "@/actions/oferta-actions";
import ProductoCategoryClient from "@/components/ProductoCategoryClient"; // ← Import directo
import { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Ofertas • Punto Padel LF •",
    description: "¡Aprovechá las mejores ofertas!",
  };
};

export default async function OfertasPage() {
  const productos = await getProductosEnOferta();
  const tiposProductos = await getTiposDeProductos();

  console.log("➡️ Productos en oferta:", productos);

  return (
    <main>
      <h1 className="text-3xl font-bold text-center my-6 text-red-600">¡Ofertas Disponibles!</h1>
      <ProductoCategoryClient productos={productos} tiposProductos={tiposProductos} />
    </main>
  );
}

