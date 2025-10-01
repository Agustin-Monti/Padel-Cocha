import type { Metadata } from "next";
import ProductosCategoryMarca from "@/components/ProductosCategoryMarca";
import { getMarcas } from "@/actions/products-category-actions";

type PageProps = {
  params: {
    id: string;      // categoría
    marca: string;   // marca
  };
};


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const marcas = await getMarcas();
  const marcaActual = marcas.find((m) => String(m.id) === String(params.marca));
  const nombreMarca = marcaActual?.nombre || "Marca";

  return {
    title: `${nombreMarca} • Punto Padel LF`,
    description: `Productos de la marca ${nombreMarca} disponibles en Punto Padel LF.`,
  };
}


export default function Page() {
  return <ProductosCategoryMarca />;
}
