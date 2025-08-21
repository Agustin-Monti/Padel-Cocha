import { notFound } from 'next/navigation';
import { getDetallesProductoById, getProductosRelacionados } from '@/actions/productos-actions';
import ProductoDetailClient from '@/components/ProductoDetailClient';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const producto = await getDetallesProductoById(params.id);
  if (!producto) return { title: "Producto no encontrado • Punto Padel LF" };

  return {
    title: `${producto.nombre} • Punto Padel LF`,
    description: producto.descripcion || "Producto disponible en Punto Padel LF",
  };
}

export default async function ProductoDetailPage({ params }: { params: { id: string } }) {
  const producto = await getDetallesProductoById(params.id);
  if (!producto) return notFound();

  const relacionados = await getProductosRelacionados(producto.categoria_id, producto.tipo_id, producto.id);

  return <ProductoDetailClient producto={producto} relacionados={relacionados} />;
}
