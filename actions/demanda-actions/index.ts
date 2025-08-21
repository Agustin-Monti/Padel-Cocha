"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";



export const createDemandAction = async (formData: FormData) => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
    return encodedRedirect("error", "/update-profile", userError.message);
  }

  const empresa = formData.get("empresa")?.toString();
  const responsable_solicitud = formData
    .get("responsable_solicitud")
    ?.toString();
  const email_contacto = formData.get("email_contacto")?.toString();
  const telefono = formData.get("telefono");
  const fecha_inicio = formData.get("fecha_inicio")?.toString();
  const fecha_vencimiento = formData.get("fecha_vencimiento")?.toString();
  const rubro_demanda = formData.get("rubro_demanda")?.toString();
  const id_categoria = formData.get("id_categoria")?.toString();
  const detalle = formData.get("detalle")?.toString();
  const pais_id = formData.get("pais_id")?.toString();
  const user_id = user?.id;

  const { data, error: demandaError } = await supabase.from("demandas").insert({
    empresa,
    responsable_solicitud,
    email_contacto,
    telefono,
    fecha_inicio,
    fecha_vencimiento,
    rubro_demanda,
    id_categoria,
    pais_id,
    detalle,
    profile_id: user_id, // Referencia al usuario (perfil) mediante su id
  });

  if (demandaError) {
    console.error(demandaError.code + " " + demandaError.message);
    return encodedRedirect("error", "/demandas/new", demandaError.message);
  } else {
    return encodedRedirect(
      "success",
      "/demandas/new",
      `Demanda creada correctamente.`
    );
  }
};

export const getUserDemandas = async () => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  if (user) {
    const { data: demandsData, error: demandsError } = await supabase
      .from("demandas")
      .select("*")
      .eq("profile_id", user.id);

    if (demandsError) {
      throw new Error("Error al obtener las demandas: " + demandsError.message);
    }

    console.log('demandas por usuario', demandsData);

    return demandsData || [];
  }

  return [];
};

export async function getAllDemandas(idCategoria = null) {
  const supabase = createClient();

  let query = supabase
    .from("demandas")
    .select(
      "id, empresa, responsable_solicitud, email_contacto, telefono, fecha_inicio, fecha_vencimiento, rubro_demanda, detalle, pais (nombre, bandera_url)"
    );

  // Filtrar por categoría si se proporciona un `idCategoria`
  if (idCategoria) {
    query = query.eq("id_categoria", idCategoria);
  }

  const { data: demandas, error } = await query;

  if (error) {
    console.error("Error fetching demandas:", error);
    return [];
  }

  

  return demandas;
}


export async function getAllDemandasLimit() {
  const supabase = createClient();

  const { data: demandas, error } = await supabase
    .from("demandas")
    .select("id, empresa, responsable_solicitud, email_contacto, telefono, fecha_inicio, fecha_vencimiento, rubro_demanda, detalle, pais (nombre, bandera_url)")
    .order("fecha_inicio", { ascending: false })
    .limit(9);

  if (error) {
    console.error("Error fetching demandas:", error);
    return [];
  }

  return demandas;
}

export async function getDemandaById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("demandas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching demanda:", error);
    return null;
  }

  return data;
}



export async function fetchDemandasPorCategoria(idCategoria: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("demandas")
    .select("*")
    .eq("id_categoria", idCategoria);

  if (error) throw new Error(error.message);
  return data;
}



// Delete function
export async function deleteDemanda(id: string) {
  console.log("Intentando borrar demanda con ID:", id);

  const { error } = await supabase
    .from("demandas")
    .delete()
    .eq("id", id); // Filtra por el id de la demanda

  if (error) {
    console.error("Error al borrar la demanda:", error);
    throw new Error("Error al borrar la demanda: " + error.message);
  }

  console.log("Demanda borrada correctamente:", id);
  return { success: true, message: "Demanda borrada correctamente." };
}

export async function getDemandasByCategoria(idCategoria) {
  const supabase = createClient();
  const { data: demandas, error } = await supabase
    .from("demandas")
    .select(
      "id, empresa, responsable_solicitud, email_contacto, telefono, fecha_inicio, fecha_vencimiento, rubro_demanda, detalle, pais (nombre, bandera_url)"
    )
    .eq("id_categoria", idCategoria); // Filtrar por categoría

  if (error) {
    console.error("Error fetching demandas by category:", error);
    return [];
  }

  return demandas;
}


