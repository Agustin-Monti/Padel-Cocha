"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export const CreateOfferAction = async (formData: FormData) => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
    return encodedRedirect("error", "/update-profile", userError.message);
  }

//   const empresa = formData.get("empresa")?.toString();
  const responsable_solicitud = formData
    .get("responsable_solicitud")
    ?.toString();
  const email_contacto = formData.get("email_contacto")?.toString();
  const telefono = formData.get("telefono");
  const rubro_oferta = formData.get("rubro_oferta")?.toString();
  const motivo_oferta = formData.get("motivo_oferta")?.toString();
  const detalle = formData.get("detalle")?.toString();
  const demanda_id = formData.get("demanda_id")?.toString();
  const user_id = user?.id;

  const { data, error: ofertaError } = await supabase.from("ofertas").insert({
    responsable_solicitud,
    email_contacto,
    telefono,
    rubro_oferta,
    motivo_oferta,
    detalle,
    demanda_id,
    profile_id: user_id, // Referencia al usuario (perfil) mediante su id 
  });

  if (ofertaError) {
    console.error(ofertaError.code + " " + ofertaError.message);
    return encodedRedirect("error", "/ofertas/new", ofertaError.message);
  } else {
    return encodedRedirect(
      "success",
      "/demandas",
      `Oferta creada correctamente.`
    );
  }
};


// Productos en oferta
export const getProductosEnOferta = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      marcas (
        id,
        nombre,
        imagen
      )
    `)
    .eq("oferta_activa", true)
    .order('created_at', { ascending: false }); // Opcional: ordenar por fecha

  if (error) {
    console.error("Error al obtener productos en oferta:", error.message);
    return [];
  }

  return data || [];
};

// Tipos de productos (para los filtros)
export const getTiposDeProductos = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tipo_productos")
    .select("*");

  if (error) {
    console.error("Error al obtener tipos de productos:", error.message);
    return [];
  }

  return data || [];

};
