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
    .select(`
      *,
      marcas!inner (
        id,
        nombre
      )
    `)
    .eq("categoria_id", categoriaId)
    .eq("marca_id", marcaId);

  if (error) {
    console.error("❌ Error fetching products by category and brand:", error);
    return { productos: [], marcaNombre: null };
  }

  // Extraer el nombre de la marca (debería ser el mismo para todos los productos)
  const marcaNombre = data && data.length > 0 
    ? data[0].marcas?.nombre 
    : null;

  return { 
    productos: data || [], 
    marcaNombre 
  };
}

export const getMarcas = async () => {
  const supabase = createClient();

  const { data, error } = await supabase.from("marcas").select("*");

  if (error) throw new Error(error.message);

  return data;
};

// Función para obtener productos por categoría y estado
export const getProductosPorCategoriaYEstado = async (
  categoriaId: string,
  estado: string
) => {
  const supabase = createClient();

  try {
    console.log(`🔍 Buscando productos: categoriaId=${categoriaId}, estado=${estado}`);
    const { data, error } = await supabase
      .from("productos")
      .select(`
        *,
        categorias (
          id,
          nombre
        ),
        marcas (
          id,
          nombre
        ),
        tipo_productos (
          id,
          nombre
        )
      `)
      .eq("categoria_id", parseInt(categoriaId))
      .eq("estado", estado)
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error al obtener productos por categoría y estado:", error);
      return [];
    }

    // Transformar los datos para incluir FORMA en lugar de COLOR
    const productosTransformados = data.map((producto) => ({
      id: producto.id.toString(),
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      tipo_id: producto.tipo_id.toString(),
      forma: producto.forma, // CAMBIADO: de color a forma
      estado: producto.estado,
      oferta_activa: producto.oferta_activa || false,
      precio_oferta: producto.precio_oferta || producto.precio,
      marca_id: producto.marca_id?.toString(),
      // Incluir datos relacionados
      categoria_nombre: producto.categorias?.nombre,
      marca_nombre: producto.marcas?.nombre,
      tipo_nombre: producto.tipo_productos?.nombre,
    }));

    console.log(`📊 Productos encontrados para categoría ${categoriaId} y estado ${estado}:`, productosTransformados.length);
    return productosTransformados;

  } catch (error) {
    console.error("Error en getProductosPorCategoriaYEstado:", error);
    return [];
  }
};

// Función para obtener todos los estados únicos disponibles
export const getEstados = async (): Promise<Array<{ id: number; nombre: string; valor: string }>> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("productos")
      .select("estado")
      .not("estado", "is", null)  // Filtrar valores nulos
      .order("estado", { ascending: true });

    if (error) {
      console.error("Error al obtener estados:", error);
      return [];
    }

    // Obtener valores únicos y transformar
    const estadosUnicos = [...new Set(data.map(item => item.estado))];
    
    // Crear un array con estructura similar a marcas/tipos
    const estadosTransformados = estadosUnicos.map((estado, index) => ({
      id: index + 1,
      nombre: estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase(),
      valor: estado.toLowerCase(),
    }));

    console.log("📝 Estados disponibles encontrados:", estadosTransformados);
    return estadosTransformados;

  } catch (error) {
    console.error("Error en getEstados:", error);
    return [];
  }
};

// Opcional: Función para obtener estados filtrados por categoría (si quieres mostrar solo estados de una categoría específica)
export const getEstadosPorCategoria = async (categoriaId: number): Promise<Array<{ id: number; nombre: string; valor: string }>> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("productos")
      .select("estado")
      .eq("categoria_id", categoriaId)
      .not("estado", "is", null)
      .order("estado", { ascending: true });

    if (error) {
      console.error("Error al obtener estados por categoría:", error);
      return [];
    }

    // Obtener valores únicos y transformar
    const estadosUnicos = [...new Set(data.map(item => item.estado))];
    
    const estadosTransformados = estadosUnicos.map((estado, index) => ({
      id: index + 1,
      nombre: estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase(),
      valor: estado.toLowerCase(),
    }));

    console.log(`📝 Estados para categoría ${categoriaId}:`, estadosTransformados);
    return estadosTransformados;

  } catch (error) {
    console.error("Error en getEstadosPorCategoria:", error);
    return [];
  }
};



  

