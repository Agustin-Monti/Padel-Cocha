// pages/api/admin-users.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from "next";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  superadmin: boolean;
  admin: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir métodos GET y PATCH
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // GET: Obtener todos los usuarios
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, nombre, apellido, email, superadmin, admin")
        .order('nombre');

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    }

    // PATCH: Actualizar rol de usuario
    if (req.method === "PATCH") {
      const { id, admin } = req.body;

      if (!id || typeof admin !== 'boolean') {
        return res.status(400).json({ error: "Datos inválidos" });
      }

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({ admin })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("Error en API admin-users:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}