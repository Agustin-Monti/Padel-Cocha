import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable, { File } from 'formidable';
import { readFile } from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const bucket = 'productos';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    console.log('Método no permitido:', req.method);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error al procesar el formulario:', err);
      return res.status(500).json({ error: 'Error al procesar el formulario' });
    }

    console.log('Fields recibidos:', fields);
    console.log('Files recibidos:', files);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // O usa NEXT_PUBLIC_SUPABASE_ANON_KEY si no usas funciones seguras
    );

    const productoIdRaw = fields.productoId;
    const productoId = Array.isArray(productoIdRaw) ? productoIdRaw[0] : productoIdRaw;

    if (!productoId || typeof productoId !== 'string') {
      console.error('Producto ID inválido:', productoId);
      return res.status(400).json({ error: 'Producto ID inválido o faltante' });
    }

    const fileList = files.files;
    const filesArray = Array.isArray(fileList) ? fileList : [fileList].filter(Boolean);

    if (filesArray.length === 0) {
      console.warn('No se recibieron archivos para subir.');
      return res.status(400).json({ error: 'No se recibieron imágenes' });
    }

    const urls: string[] = [];

    for (const file of filesArray) {
      if (!file) {
        console.warn('Archivo nulo o indefinido, se omite.');
        continue;
      }

      console.log('Procesando archivo:', file.originalFilename);

      try {
        const buffer = await readFile(file.filepath);
        const fileExt = path.extname(file.originalFilename || '');
        const nombre = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
        const filePath = `galerias/${productoId}/${nombre}`;

        console.log('Subiendo archivo a:', filePath);

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, buffer, {
          contentType: file.mimetype || 'image/jpeg',
          upsert: false,
        });

        if (uploadError) {
          console.error('Error al subir archivo a Supabase Storage:', uploadError);
          return res.status(500).json({ error: 'Error al subir una imagen' });
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        console.log('Imagen subida con éxito. URL pública:', publicUrl);

        const { error: insertError } = await supabase.from('galeria_productos').insert({
          producto_id: productoId,
          imagen_galeria: publicUrl,
        });

        if (insertError) {
          console.error('Error al insertar en la base de datos:', insertError);
          return res.status(500).json({ error: 'Error al guardar imagen en la base de datos' });
        }

        urls.push(publicUrl);
      } catch (error) {
        console.error('Error procesando archivo:', error);
        return res.status(500).json({ error: 'Error interno al procesar archivo' });
      }
    }

    console.log('Todas las imágenes procesadas correctamente.');
    return res.status(200).json({ success: true, urls });
  });
};

export default handler;
