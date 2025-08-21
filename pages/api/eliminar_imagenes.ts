// pages/api/eliminar_imagenes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // asegúrate de que esto esté sólo en el servidor
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { productoId, imagenUrl } = req.body;

  if (!productoId || !imagenUrl) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // 1. Eliminar de la base de datos
  const { error: dbError } = await supabase
    .from('galeria_productos')
    .delete()
    .eq('producto_id', productoId)
    .eq('imagen_galeria', imagenUrl);

  if (dbError) {
    console.error('Error al eliminar de la base de datos:', dbError);
    return res.status(500).json({ error: 'Error al eliminar de la base de datos' });
  }

  // 2. Eliminar del bucket
  const baseStorageUrl = supabase.storage.from('productos').getPublicUrl('').data.publicUrl;
  const rutaRelativa = imagenUrl.replace(baseStorageUrl, '').replace(/^\/+/, '');

  const { error: deleteError } = await supabase.storage.from('productos').remove([rutaRelativa]);

  if (deleteError) {
    console.error('Error al eliminar del bucket:', deleteError);
    return res.status(500).json({ error: 'Error al eliminar imagen del bucket' });
  }

  return res.status(200).json({ success: true });
}
