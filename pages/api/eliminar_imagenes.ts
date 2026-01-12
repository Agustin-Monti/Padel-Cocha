// pages/api/eliminar_imagenes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { productoId, imagenUrl } = req.body;

    console.log('📝 Datos recibidos para eliminar:', { productoId, imagenUrl });

    if (!productoId || !imagenUrl) {
      console.error('❌ Faltan datos requeridos');
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Crear cliente de Supabase - MÉTODO CORRECTO
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔍 Verificando variables de entorno:', {
      supabaseUrl: supabaseUrl ? '✅ Definido' : '❌ Faltante',
      supabaseServiceKey: supabaseServiceKey ? '✅ Definido' : '❌ Faltante'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno faltantes');
      return res.status(500).json({ 
        error: 'Configuración del servidor incompleta',
        details: process.env.NODE_ENV === 'development' ? { supabaseUrl, supabaseServiceKey } : undefined
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Primero, eliminar de la base de datos
    console.log('🗑️ Eliminando de la base de datos...');
    const { error: dbError } = await supabase
      .from('galeria_productos')
      .delete()
      .eq('producto_id', productoId)
      .eq('imagen_galeria', imagenUrl);

    if (dbError) {
      console.error('❌ Error al eliminar de la base de datos:', dbError);
      return res.status(500).json({ 
        error: 'Error al eliminar de la base de datos',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    console.log('✅ Eliminado de la base de datos');

    // 2. Extraer el nombre del archivo de la URL
    // La URL viene como: https://eunsyrxioxiesiwlxysy.supabase.co/storage/v1/object/public/productos/galerias/123/archivo.jpg
    console.log('🔗 URL de la imagen:', imagenUrl);
    
    // Parsear la URL
    const url = new URL(imagenUrl);
    const pathname = url.pathname;
    
    // El pathname viene como: /storage/v1/object/public/productos/galerias/123/archivo.jpg
    // Necesitamos extraer: galerias/123/archivo.jpg
    
    // Dividir por '/'
    const parts = pathname.split('/');
    console.log('🔍 Partes de la URL:', parts);
    
    // Encontrar el índice de 'productos'
    const productosIndex = parts.indexOf('productos');
    
    if (productosIndex === -1) {
      console.error('❌ No se encontró "productos" en la URL');
      return res.status(400).json({ error: 'URL de imagen inválida' });
    }
    
    // Tomar todo después de 'productos'
    const filePath = parts.slice(productosIndex + 1).join('/');
    console.log('🗂️ Ruta del archivo a eliminar:', filePath);

    // 3. Eliminar del storage
    console.log('🗑️ Eliminando del storage...');
    const { error: storageError } = await supabase.storage
      .from('productos')
      .remove([filePath]);

    if (storageError) {
      console.error('❌ Error al eliminar del storage:', storageError);
      
      // Aunque falle en storage, la BD ya fue limpiada, así que podemos considerar éxito parcial
      console.log('⚠️ Imagen eliminada de BD pero no de storage');
      return res.status(200).json({ 
        success: true, 
        warning: 'Imagen eliminada de la base de datos pero hubo un problema con el storage'
      });
    }

    console.log('✅ Imagen eliminada completamente');
    return res.status(200).json({ 
      success: true,
      message: 'Imagen eliminada correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error general en eliminar_imagenes:', error);
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      digest: Date.now().toString(36) // Para tracking
    });
  }
}
