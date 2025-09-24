// actions/usuarios-actions/index.ts

"use server";  

import { createClient } from "@/utils/supabase/server";




export async function getUsuarios() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(`${baseUrl}/api/usuarios`);
  if (!res.ok) throw new Error("Error al obtener los usuarios");
  return res.json();
}

export async function getDirecciones(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(`${baseUrl}/api/direcciones/${userId}`);
  if (!res.ok) throw new Error("Error al obtener direcciones");
  return res.json();
}

