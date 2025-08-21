// pages/api/actualizar_imagen_metodo.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { guardarEdit } from '@/actions/metodos-actions';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error al procesar el formulario' });

    const id = Array.isArray(fields.id) ? fields.id[0] : fields.id ?? '';
    const empresa = Array.isArray(fields.empresa) ? fields.empresa[0] : fields.empresa ?? '';
    const peso_max = Array.isArray(fields.peso_max) ? fields.peso_max[0] : fields.peso_max ?? '0';
    const precio_nacional = Array.isArray(fields.precio_nacional) ? fields.precio_nacional[0] : fields.precio_nacional ?? '0';
    const precio_regional = Array.isArray(fields.precio_regional) ? fields.precio_regional[0] : fields.precio_regional ?? '0';
    const imagenAnterior = Array.isArray(fields.imagenAnterior) ? fields.imagenAnterior[0] : fields.imagenAnterior ?? '';

    const fileArray = files.nuevaImagen;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    // Validación de campos requeridos
    if (!id || !empresa) {
      return res.status(400).json({ error: 'ID y empresa son obligatorios' });
    }

    try {
      let nuevaUrl = imagenAnterior;

      if (file) {
        const ext = file.originalFilename?.split('.').pop() || 'jpg';
        const filePath = `metodos/${Date.now()}.${ext}`;
        const fileStream = fs.readFileSync(file.filepath);

        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filePath, fileStream, {
            contentType: file.mimetype || 'image/jpeg',
          });

        if (uploadError) return res.status(500).json({ error: 'Error al subir imagen' });

        const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
        nuevaUrl = data.publicUrl;

        if (imagenAnterior) {
          const baseUrl = supabase.storage.from('productos').getPublicUrl('').data.publicUrl;
          const rutaAnterior = imagenAnterior.replace(baseUrl, '').replace(/^\/+/, '');
          await supabase.storage.from('productos').remove([rutaAnterior]);
        }
      }

      await guardarEdit(id, {
        empresa,
        peso_max: Number(peso_max),
        precio_nacional: Number(precio_nacional),
        precio_regional: Number(precio_regional),
        imagen: nuevaUrl,
      });

      return res.status(200).json({ success: true, nuevaUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error del servidor' });
    }
  });
}
