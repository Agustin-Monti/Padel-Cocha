"use server";

import { createClient } from "@/utils/supabase/server";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Acciones relacionadas con categorías

export const createMarcasAction = async (formData: FormData) => {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return false;

  const nombre = formData.get("nombre")?.toString();
  const imagen = formData.get("imagen") as File;

  if (!nombre || !imagen) return false;

  const fileExtension = path.extname(imagen.name);
  const fileName = `${Date.now()}${fileExtension}`;
  const filePath = `marcas/${fileName}`; // en el bucket productos

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("productos")
      .upload(filePath, imagen, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir imagen:", uploadError);
      return false;
    }

    const { data: urlData } = supabase.storage
      .from("productos")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    const { error: categoriaError } = await supabase.from("marcas").insert([
      {
        nombre,
        imagen: imageUrl,
      },
    ]);

    if (categoriaError) {
      console.error("Error al guardar en DB:", categoriaError.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error general:", error);
    return false;
  }
};

export const fetchMarcas = async () => {
  const supabase = createClient();

  // Obtener las categorías
  const { data: marcas, error: marcasError } = await supabase
    .from('marcas')
    .select('id, nombre, imagen')
    .order('nombre', { ascending: true });

  if (marcasError) {
    console.error('Error al obtener marcas:', marcasError);
    return [];
  }

  return marcas;
};

export async function getMarcaById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching marcas:", error);
    return null;
  }

  return data;
}

export const guardarEditMarcas = async (formData: FormData): Promise<boolean> => {
  const supabase = createClient();

  const marcas = {
    id: formData.get("id") as string,
    nombre: formData.get("nombre") as string,
    imagen: formData.get("url") as string | null,
  };

  const { error } = await supabase
    .from("marcas")
    .update({ nombre: marcas.nombre, imagen: marcas.imagen })
    .eq("id", marcas.id);

  if (error) {
    console.error("❌ Error al actualizar marcas:", error.message);
    return false;
  }

  console.log("✅ Marcas actualizada con éxito");
  return true;
};


export const eliminarMarcasById = async (id: string): Promise<boolean> => {
  const supabase = createClient();

  try {
    // Obtener la información de la categoría (incluyendo la ruta de la imagen)
    const { data: marcas, error: fetchError } = await supabase
      .from("marcas")
      .select("imagen")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error al obtener la marcas:", fetchError);
      return false;
    }

    if (!marcas || !marcas.imagen) {
      console.error("marcas no encontrada o no tiene imagen.");
      return false;
    }

    // Eliminar la imagen del servidor
    const imagePath = path.resolve(process.cwd(), 'public', marcas.imagen.slice(1)); // Construir la ruta completa de la imagen
    try {
      if (fs.existsSync(imagePath)) {
        await fs.unlinkSync(imagePath); // Eliminar el archivo de imagen
        console.log(`Imagen eliminada: ${imagePath}`);
      } else {
        console.warn('Imagen no encontrada en el servidor:', imagePath);
      }
    } catch (fsError) {
      console.error("Error al eliminar la imagen:", fsError);
      // Si hay un error al eliminar la imagen, lo registramos pero continuamos con la eliminación de la categoría
    }

    // Eliminar la categoría de la base de datos
    const { error: deleteError } = await supabase
      .from("marcas")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error al eliminar la marcas:", deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error en eliminar marcas:", error);
    return false;
  }
};




