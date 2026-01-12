import type { Metadata } from "next";
import ProductosCategoryEstado from "@/components/ProductosCategoryEstado";
import { getEstados } from "@/actions/productos-actions";

type PageProps = {
  params: {
    id: string;      // categoría
    estado: string;   // estado (nuevo, usado, etc.)
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const estados = await getEstados();
  const estadoActual = estados.find((e) => e.valor === params.estado);
  
  // Formatear el nombre del estado para mostrarlo mejor
  let nombreEstado = estadoActual?.nombre || params.estado;
  
  // Si no está en la lista, capitalizar la primera letra
  if (!estadoActual) {
    nombreEstado = params.estado.charAt(0).toUpperCase() + params.estado.slice(1);
  }

  return {
    title: `Productos ${nombreEstado} • Punto Padel LF`,
    description: `Productos ${nombreEstado.toLowerCase()} disponibles en Punto Padel LF.`,
  };
}

export default function Page() {
  return <ProductosCategoryEstado />;
}
