import { getTiposDeProductosPorCategoria } from "@/actions/products-category-actions";
import type { Metadata } from "next";
import ProductosCategoryTipo from "@/components/ProductosCategoryTipo";

type PageProps = {
  params: {
    id: string;
    tipo: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tipos = await getTiposDeProductosPorCategoria(params.id);

  const tipoActual = tipos.find((t) => String(t.id) === String(params.tipo));
  const nombreTipo = tipoActual?.nombre || "Productos";

  return {
    title: `${nombreTipo} • La Guillerma`,
    description: `Productos de tipo ${nombreTipo} disponibles en La Guillerma.`,
  };
}

export default function Page() {
  return <ProductosCategoryTipo />;
}
