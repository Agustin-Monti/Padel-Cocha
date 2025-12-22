// app/ofertas/page.tsx
import { getProductosEnOferta, getTiposDeProductos } from "@/actions/oferta-actions";
import ProductoOfertasClient from "@/components/ProductoOfertasClient"; // 👈 Usar el nuevo componente
import { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "🔥 OFERTAS ESPECIALES • Punto Padel LF",
    description: "¡Aprovechá las mejores ofertas en paletas, indumentaria y accesorios de pádel! Envío gratis y cuotas sin interés.",
  };
};

export default async function OfertasPage() {
  const productos = await getProductosEnOferta();
  const tiposProductos = await getTiposDeProductos();

  return (
    <ProductoOfertasClient productos={productos} tiposProductos={tiposProductos} />
  );
}
