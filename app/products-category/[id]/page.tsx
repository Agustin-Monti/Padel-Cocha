import {getCategoriaById, getProductosPorCategoria, getTiposDeProductosPorCategoria } from "@/actions/products-category-actions";
import ProductoCategoryClient from "@/components/ProductoCategoryClient";
import { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categoria = await getCategoriaById(params.id);
  return {
    title: categoria ? `${categoria.nombre} • Punto Padel LF` : "Productos • Punto Padel LF",
    description: categoria ? `Explorá productos en la categoría ${categoria.nombre}` : "Catálogo de productos disponible en La Guillerma",
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  const productos = await getProductosPorCategoria(params.id, null);
  const tiposProductos = await getTiposDeProductosPorCategoria(params.id);

  return <ProductoCategoryClient productos={productos} tiposProductos={tiposProductos}  />;
}
