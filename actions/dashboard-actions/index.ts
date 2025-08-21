"use server";

import { createClient } from "@/utils/supabase/server";



export async function getDashboardResumen() {
  const supabase = createClient(); // o el cliente que estés usando
  const { data: productos } = await supabase.from('productos').select('id');
  const { data: categorias } = await supabase.from('categorias').select('id');
  const { data: tipos } = await supabase.from('tipo_productos').select('id');

  return {
    totalProductos: productos?.length ?? 0,
    totalCategorias: categorias?.length ?? 0,
    totalTipos: tipos?.length ?? 0,
  };
}





