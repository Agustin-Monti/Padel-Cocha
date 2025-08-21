// pages/api/delete-image.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { path } = req.body;

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ message: 'Ruta inválida o faltante' });
  }

  // Validar que la ruta pertenezca al bucket correcto
  if (!path.startsWith('categorias/') && !path.startsWith('productos/')) {
    return res.status(400).json({ message: 'La ruta no pertenece al bucket esperado (productos)' });
  }

  console.log(`📁 Ruta a eliminar: '${path}'`);

  try {
    const { error } = await supabaseAdmin.storage
      .from("productos")
      .remove([path]);

    if (error) {
      console.error("❌ Error al eliminar la imagen:", error.message);
      return res.status(500).json({ message: 'Error al eliminar la imagen', error: error.message });
    }

    console.log(`✅ Imagen eliminada correctamente: '${path}'`);
    return res.status(200).json({ success: true, path });
  } catch (error: any) {
    console.error("❌ Error inesperado:", error);
    return res.status(500).json({ message: 'Error inesperado al eliminar imagen', error: error.message });
  }
}

