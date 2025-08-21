import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false, // importante para formidable
  },
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_PREFIX = 'https://tvosokaappxwfsjhtmhe.supabase.co/storage/v1/object/public/productos/';

const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { fields, files } = await parseForm(req);
    const id = fields.id as string;
    const nombre = fields.nombre as string;
    const nuevaImagen = files.imagen as formidable.File;

    // Buscar categoría actual
    const { data: categoria, error: categoriaError } = await supabaseAdmin
      .from('categorias')
      .select('imagen')
      .eq('id', id)
      .single();

    if (categoriaError || !categoria) {
      console.error('❌ Error al obtener categoría:', categoriaError);
      return res.status(500).json({ error: 'No se encontró la categoría' });
    }

    let imagenFinal = categoria.imagen;

    // 🧹 Eliminar imagen anterior si hay nueva imagen
    if (nuevaImagen && categoria.imagen?.includes(STORAGE_PREFIX)) {
      const rutaAnterior = categoria.imagen.replace(STORAGE_PREFIX, '');
      console.log('🧹 Eliminando imagen anterior:', rutaAnterior);

      const { error: deleteError } = await supabaseAdmin.storage
        .from('productos')
        .remove([rutaAnterior]);

      if (deleteError) {
        console.warn('⚠️ No se pudo eliminar la imagen anterior:', deleteError.message);
      } else {
        console.log('✅ Imagen anterior eliminada');
      }

      // ⬆️ Subir nueva imagen
      const buffer = await fs.readFile(nuevaImagen.filepath);
      const nuevoNombre = `${crypto.randomUUID()}${path.extname(nuevaImagen.originalFilename || '.jpg')}`;
      const filePath = `categorias/${nuevoNombre}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('productos')
        .upload(filePath, buffer, {
          contentType: nuevaImagen.mimetype || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Error al subir nueva imagen:', uploadError.message);
        return res.status(500).json({ error: 'Error al subir nueva imagen' });
      }

      const { data: publicUrl } = supabaseAdmin.storage
        .from('productos')
        .getPublicUrl(filePath);

      imagenFinal = publicUrl.publicUrl;
      console.log('🆕 Imagen nueva subida con URL:', imagenFinal);
    }

    // 📝 Actualizar categoría
    const { error: updateError } = await supabaseAdmin
      .from('categorias')
      .update({
        nombre,
        imagen: imagenFinal,
      })
      .eq('id', id);

    if (updateError) {
      console.error('❌ Error al actualizar categoría:', updateError.message);
      return res.status(500).json({ error: 'Error al actualizar categoría' });
    }

    return res.status(200).json({ success: true, imagenUrl: imagenFinal });
  } catch (error: any) {
    console.error('❌ Error en el handler editar-categoria:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
