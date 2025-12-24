"use server";

import { createClient } from "@/utils/supabase/server";

// Acciones relacionadas con categorías

export const createTipoAction = async (formData: FormData) => {
    const supabase = createClient();
  
    const { data: { user }, error: userError } = await supabase.auth.getUser();
  
    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return false;
    }
  
    const nombre = formData.get("nombre")?.toString();
    const categoria_id = formData.get("categoria_id")?.toString(); // Aseguramos que sea un string
  
    if (!nombre || !categoria_id) {
      console.log('Faltan datos necesarios.');
      return false;
    }
  
    try {
      // Guarda el tipo de producto en la base de datos
      const { data, error: categoriaError } = await supabase
        .from("tipo_productos")
        .insert([
          {
            categoria_id, // ID de la categoría
            nombre,
          },
        ]);
  
      if (categoriaError) {
        console.error(categoriaError.code + " " + categoriaError.message);
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('Error al guardar el tipo de producto:', error);
      return false;
    }
};
  

export const getCategorias = async () => {
  const supabase = createClient();

  // Obtener las categorías
  const { data: categorias, error: categoriasError } = await supabase
    .from('categorias')
    .select('id, nombre, imagen')
    .order('nombre', { ascending: true });

  if (categoriasError) {
    console.error('Error al obtener categorías:', categoriasError);
    return [];
  }

  return categorias;
};

export const fetchTipos = async () => {
  const supabase = createClient();

  // Obtener los tipos de productos con JOIN a categorías
  const { data: tipos, error: tiposError } = await supabase
    .from('tipo_productos')
    .select(`
      id, 
      nombre, 
      categoria_id,
      categorias (
        id,
        nombre
      )
    `)
    .order('nombre', { ascending: true });

  if (tiposError) {
    console.error('Error al obtener tipos:', tiposError);
    return [];
  }

  // Transformar los datos para normalizar la estructura
  const tiposTransformados = tipos.map(tipo => {
    // Si categorias es un array, toma el primer elemento
    // Si es un objeto, úsalo directamente
    const categoriaObj = Array.isArray(tipo.categorias) 
      ? tipo.categorias[0] 
      : tipo.categorias;

    return {
      id: tipo.id,
      nombre: tipo.nombre,
      categoria_id: tipo.categoria_id,
      categorias: categoriaObj || null
    };
  });

  return tiposTransformados;
};


  

export async function getTiposById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tipo_productos")
    .select(`
      *,
      categorias (
        id,
        nombre
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching tipos:", error);
    return null;
  }

  return data;
}

export const guardarEditCategoria = async (formData: FormData) => {
  const supabase = createClient();

  // Extraer los datos de FormData
  const tipos = {
    id: formData.get('id') as string,
    categoria_id: formData.get('categoria_id') as string,
    nombre: formData.get('nombre') as string, // Puede ser archivo o URL
  };

  


  // Actualizar la categoría con la nueva imagen (o la anterior si no se subió una nueva)
  const { data, error } = await supabase
    .from('tipo_productos')
    .update({
      categoria_id: tipos.categoria_id,
      nombre: tipos.nombre, // URL de la imagen nueva o anterior
    })
    .eq('id', tipos.id);

  if (error) {
    console.error('Error al actualizar la categoría:', error);
    return false;
  }

  return true;
};

export const eliminarTipoById = async (id: string): Promise<boolean> => {
  const supabase = createClient();

  try {
    // Obtener la información de la categoría (incluyendo la ruta de la imagen)
    const { data: categoria, error: fetchError } = await supabase
      .from("categorias")
      .select("imagen")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error al obtener la categoría:", fetchError);
      return false;
    }

    if (!categoria || !categoria.imagen) {
      console.error("Categoría no encontrada o no tiene imagen.");
      return false;
    }

    

    // Eliminar la categoría de la base de datos
    const { error: deleteError } = await supabase
      .from("categorias")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error al eliminar la categoría:", deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error en eliminarCategoriaById:", error);
    return false;
  }
};




