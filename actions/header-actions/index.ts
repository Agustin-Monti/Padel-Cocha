"use server";

import { createClient } from "@/utils/supabase/server";


interface Categoria {
  id: number;
  nombre: string;
}

interface Marca {
  id: number;
  nombre: string;
}
  
interface TipoProducto {
  id: number;
  categoria_id: number;
  nombre: string;
}
  
  export const getCategoriasYTipos = async (): Promise<{
    categorias: Categoria[];
    tiposProductos: Record<number, TipoProducto[]>;
    marcasPaletas: Marca[];
  }> => {
    const supabase = createClient();
    try {
      // Obtener categorías
      const { data: categorias, error: categoriasError } = await supabase
        .from("categorias")
        .select("*");
  
      if (categoriasError) {
        throw new Error(categoriasError.message);
      }
  
      // Obtener tipos de productos por cada categoría
      const tiposProductos: Record<number, TipoProducto[]> = {};
      const marcasPaletas: Marca[] = [];
  
      for (const categoria of categorias) {
        const { data: tipos, error: tiposError } = await supabase
          .from("tipo_productos")
          .select("*")
          .eq("categoria_id", categoria.id);

        if (tiposError) {
          throw new Error(tiposError.message);
        }

        tiposProductos[categoria.id] = tipos || [];

        // ✅ Aquí sí existe "categoria"
        if (categoria.nombre.toLowerCase() === "paletas") {
          const { data: marcas, error: marcasError } = await supabase
            .from("marcas")
            .select("*");

          if (marcasError) {
            throw new Error(marcasError.message);
          }

          marcasPaletas.push(...(marcas || []));
        }
      }

    
  
      return { categorias, tiposProductos, marcasPaletas };
    } catch (error) {
      console.error("Error al obtener categorías o tipos de productos:", error);
      throw error;
    }
};


export const hayOfertasActivas = async (): Promise<boolean> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("id")
    .eq("oferta_activa", true)
    .limit(1); // solo necesitamos saber si hay 1

  if (error) {
    console.error("Error al verificar ofertas activas:", error);
    return false;
  }

  console.log("Productos con oferta:", data); // 👈 Para verificar qué devuelve Supabase

  return data && data.length > 0;
};

export const getEstados = async () => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("productos")
    .select("estado")
    .not("estado", "is", null)
    .order("estado");
    
  if (error) {
    console.error("Error al obtener estados:", error);
    return [];
  }
  
  // Obtener valores únicos
  const estadosUnicos = [...new Set(data.map(item => item.estado))];
  
  // Transformar a formato similar a marcas/tipos
  return estadosUnicos.map((estado, index) => ({
    id: index + 1, // ID temporal
    nombre: estado.charAt(0).toUpperCase() + estado.slice(1), // Capitalizar
    valor: estado
  }));
};
