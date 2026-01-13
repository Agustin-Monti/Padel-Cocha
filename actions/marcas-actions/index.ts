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
  try {
    console.log(`🔍 Iniciando eliminación de marca ID: ${id}`);
    console.log(`🔍 Tipo de ID: ${typeof id}, Valor: "${id}"`);

    const baseUrl = 'https://padel-cocha.vercel.app';

    console.log(`🌍 Llamando a API en: ${baseUrl}/api/eliminar-marca`);

    // Convertir ID a string explícitamente
    const idString = String(id);
    const body = JSON.stringify({ id: idString });
    console.log(`📦 Body a enviar: ${body}`);

    const response = await fetch(`${baseUrl}/api/eliminar-marca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
      cache: 'no-store',
    });

    console.log(`📊 Estado de respuesta: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error en la API (${response.status}):`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('Detalles del error:', errorData);
      } catch {
        console.error('Respuesta de error (no JSON):', errorText);
      }
      
      return false;
    }

    const result = await response.json();
    console.log('✅ Resultado de eliminación:', result);
    
    return result.success === true;

  } catch (error: any) {
    console.error('❌ Error en eliminar marca:', error.message || error);
    console.error('Stack trace:', error.stack);
    return false;
  }
};




