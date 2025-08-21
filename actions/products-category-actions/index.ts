"use server";

import { createClient } from "@/utils/supabase/server";



/** Obtener los productos según la categoría y tipo de producto */
export async function getProductosPorCategoria(id: string, tipo_producto_id: string | null) {
  const supabase = createClient();

  let query = supabase
    .from("productos")
    .select("*, marcas(id, nombre)") // Hacemos join con marcas
    .eq("categoria_id", id);

  if (tipo_producto_id) {
    query = query.eq("tipo_id", tipo_producto_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Error fetching products:", error);
    return [];
  }

  return data;
}



/** Obtener una categoría por su ID */
export async function getCategoriaById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", id)
    .single(); // Solo una categoría

  if (error) {
    console.error("Error al obtener la categoría:", error);
    return null;
  }

  return data;
}

  
  
/** Obtener los tipos de productos según el categoria_id */
export async function getTiposDeProductosPorCategoria(categoria_id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tipo_productos")
      .select("*")
      .eq("categoria_id", categoria_id);
  
    if (error) {
      console.error("Error fetching product types:", error);
      return [];
    }
  
    return data;
}

export async function getProductosPorCategoriaYTipo(id: string, tipo: string) {
    const supabase = createClient();

    const { data, error } = await supabase
    .from("productos") // Nombre de la tabla en la base de datos
    .select("*") // Seleccionar todas las columnas
    .eq("categoria_id", id) // Filtrar por el id de la categoría
    .eq("tipo_id", tipo); // Filtrar por el tipo de producto

  if (error) {
    console.error("Error al obtener productos:", error);
    return []; // En caso de error, retornamos un array vacío
  }

  return data; // Devolvemos los productos
}

export async function getProductosPorCategoriaYMarca(categoriaId: string, marcaId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("categoria_id", categoriaId)
    .eq("marca_id", marcaId);

  if (error) throw new Error(error.message);

  console.log("📦 Productos filtrados por categoría y marca:", data);
  
  return data || [];
}

export const getMarcas = async () => {
  const supabase = createClient();

  const { data, error } = await supabase.from("marcas").select("*");

  if (error) throw new Error(error.message);

  return data;
};





  

