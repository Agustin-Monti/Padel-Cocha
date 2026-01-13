// pages/api/eliminar-marca.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido. Use POST.' });
  }

  const { id } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID inválido o faltante' });
  }

  console.log(`🗑 Intentando eliminar marca con ID: '${id}'`);

  try {
    // 1. Obtener la información de la marca
    const { data: marca, error: fetchError } = await supabaseAdmin
      .from('marcas')
      .select('imagen')
      .eq('id', id)
      .single();

    if (fetchError || !marca) {
      console.error('❌ Error al obtener la marca:', fetchError?.message);
      return res.status(404).json({ 
        message: 'Marca no encontrada', 
        error: fetchError?.message 
      });
    }

    let imagenEliminada = false;
    let rutaAEliminar: string | null = null;

    // 2. Extraer y eliminar la imagen del storage si existe
    if (marca.imagen && marca.imagen.includes('/storage/v1/object/public/productos/')) {
      const partes = marca.imagen.split('/storage/v1/object/public/productos/');
      rutaAEliminar = partes[1];

      if (rutaAEliminar && rutaAEliminar.startsWith('marcas/')) {
        console.log(`📁 Ruta de imagen a eliminar: '${rutaAEliminar}'`);

        const { error: storageError } = await supabaseAdmin.storage
          .from('productos')
          .remove([rutaAEliminar]);

        if (storageError) {
          console.warn('⚠️ No se pudo eliminar imagen:', storageError.message);
        } else {
          imagenEliminada = true;
          console.log(`✅ Imagen eliminada correctamente: '${rutaAEliminar}'`);
        }
      }
    }

    // 3. Eliminar la marca de la base de datos
    const { error: deleteError } = await supabaseAdmin
      .from('marcas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error al eliminar marca de la base de datos:', deleteError.message);
      return res.status(500).json({ 
        message: 'Error al eliminar la marca de la base de datos', 
        error: deleteError.message,
        imagenEliminada 
      });
    }

    console.log(`✅ Marca eliminada correctamente. ID: '${id}'`);

    return res.status(200).json({ 
      success: true, 
      message: 'Marca eliminada correctamente',
      id,
      imagenEliminada,
      rutaImagen: rutaAEliminar
    });

  } catch (error: any) {
    console.error('❌ Error inesperado en eliminar-marca:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor al eliminar marca',
      error: error.message 
    });
  }
}