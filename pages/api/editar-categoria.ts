import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // importante para manejar FormData
  },
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { fields, files } = await parseForm(req);
    const { id, nombre } = fields;
    const nuevaImagen = files.imagen as formidable.File | undefined;

    // Obtener imagen anterior
    const { data: cat, error: catError } = await supabaseAdmin
      .from('categorias')
      .select('imagen')
      .eq('id', id)
      .single();

    if (catError || !cat) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    let nuevaUrl = cat.imagen;

    // ✅ Si se sube nueva imagen
    if (nuevaImagen && nuevaImagen.originalFilename) {
      // 🗑 Eliminar anterior si es del bucket
      if (cat.imagen.includes('/storage/v1/object/public/productos/')) {
        const pathAnterior = cat.imagen.split('/storage/v1/object/public/')[1];
        const { error: deleteError } = await supabaseAdmin.storage
          .from('productos')
          .remove([pathAnterior]);

        if (deleteError) {
          console.warn('No se pudo eliminar imagen anterior:', deleteError.message);
        }
      }

      // ⬆️ Subir nueva imagen
      const buffer = await fs.readFile(nuevaImagen.filepath);
      const ext = path.extname(nuevaImagen.originalFilename!);
      const nombreArchivo = `${crypto.randomUUID()}${ext}`;
      const ruta = `categorias/${nombreArchivo}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('productos')
        .upload(ruta, buffer, {
          contentType: nuevaImagen.mimetype || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ error: 'Error al subir la nueva imagen' });
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('productos')
        .getPublicUrl(ruta);

      nuevaUrl = publicUrlData.publicUrl;
    }

    // 📝 Actualizar categoría
    const { error: updateError } = await supabaseAdmin
      .from('categorias')
      .update({ nombre, imagen: nuevaUrl })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ error: 'Error al actualizar la categoría' });
    }

    return res.status(200).json({ success: true, imagenUrl: nuevaUrl });
  } catch (err) {
    console.error('Error general en editar-categoria:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
