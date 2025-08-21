import type { Metadata } from "next";
import ProductosCategoryMarca from "@/components/ProductosCategoryMarca";
import { getMarcas } from "@/actions/products-category-actions";

type PageProps = {
  params: {
    categoria_id: string;
    marca_id: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const marcas = await getMarcas();
  const marcaActual = marcas.find((m) => String(m.id) === String(params.marca_id));
  const nombreMarca = marcaActual?.nombre || "Marca";

  return {
    title: `${nombreMarca} • La Guillerma`,
    description: `Productos de la marca ${nombreMarca} disponibles en La Guillerma.`,
  };
}

export default function Page() {
  return <ProductosCategoryMarca />;
}
