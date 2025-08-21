// app/page.tsx
import PublicLayout from '@/components/public-layout';
import { SliderPrincipal } from '@/components/SliderPrincipal';
import  NegocioSection  from "@/components/NegocioSection";
import { fetchCategorias } from '@/actions/categorias-actions';
import Categorias  from "@/components/categorias";
import SliderProductos from '@/components/SliderProductos';
import FloatingButton from '@/components/FloatingButton';
import Nosotros from '@/components/Nosotros';
import { Roboto } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import { getProductosValorados  } from '@/actions/productos-actions';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "• Punto Padel LF •",
  description: "Tienda de productos únicos, elegidos con amor por Punto Padel LF.",
};


const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
});

export default async function Index() {
  const categorias = await fetchCategorias();
  const productos = await getProductosValorados ();

  // Crear cliente de Supabase para obtener usuario autenticado
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser(); // Obtener datos del usuario autenticado

  return (
    <PublicLayout user={user}>
      <main className={roboto.className}>
        <SliderPrincipal />
        <Categorias  categorias={categorias || []} />
        <SliderProductos productos={productos} />
        <Nosotros />
        <NegocioSection/>
        <FloatingButton /> {/* Aquí se incluye el botón flotante */}
      </main>
    </PublicLayout>
  );
}
