// pages/api/eliminar-producto-id.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('=== 📨 API eliminar-producto-id INICIADA ===');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    const { productoId } = req.body;
    if (!productoId) {
      return res.status(400).json({ success: false, error: 'ID del producto requerido' });
    }

    const idString = String(productoId).trim();
    const idNumero = Number(productoId);
    console.log(`🔍 Eliminando producto: ${idString} (numérico: ${idNumero})`);

    // LISTA COMPLETA DE TABLAS CON FK A PRODUCTOS
    const TABLAS_CON_FK = [
      { nombre: 'carrito', columna: 'producto_id' },
      { nombre: 'favoritos', columna: 'producto_id' },
      // Agrega aquí otras tablas que encuentres
      { nombre: 'pedidos', columna: 'producto_id' },
      { nombre: 'pedido_items', columna: 'producto_id' },
      { nombre: 'reseñas', columna: 'producto_id' },
      { nombre: 'comentarios', columna: 'producto_id' },
    ];

    // 1. ELIMINAR DE TODAS LAS TABLAS CON FK
    console.log('0️⃣ Eliminando de tablas dependientes...');
    const resultadosEliminacion: { [key: string]: number } = {};

    for (const tabla of TABLAS_CON_FK) {
      try {
        // Intentar eliminar registros
        const { error, count } = await supabaseAdmin
          .from(tabla.nombre)
          .delete({ count: 'exact' })
          .eq(tabla.columna, idNumero);
        
        if (!error && count && count > 0) {
          resultadosEliminacion[tabla.nombre] = count;
          console.log(`✅ Eliminados ${count} registros de ${tabla.nombre}`);
        } else if (error && !error.message.includes('does not exist')) {
          console.warn(`⚠️ Error en ${tabla.nombre}:`, error.message);
        }
      } catch (error: any) {
        // Tabla probablemente no existe, continuar
        if (!error.message.includes('does not exist')) {
          console.warn(`⚠️ Error procesando ${tabla.nombre}:`, error.message);
        }
      }
    }

    // 2. ELIMINAR GALERÍA DEL STORAGE
    console.log('1️⃣ Eliminando imágenes de galería...');
    await eliminarImagenesGaleria(idString);

    // 3. ELIMINAR IMAGEN PRINCIPAL
    console.log('2️⃣ Eliminando imagen principal...');
    await eliminarImagenPrincipal(idString);

    // 4. ELIMINAR REGISTROS DE GALERÍA (BD)
    console.log('3️⃣ Eliminando registros de galeria_productos...');
    const { error: galeriaError } = await supabaseAdmin
      .from('galeria_productos')
      .delete()
      .eq('producto_id', idString);
    
    if (galeriaError) {
      console.warn('⚠️ Error eliminando galería de BD:', galeriaError.message);
    } else {
      console.log('✅ Galería eliminada de BD');
    }

    // 5. ELIMINAR PRODUCTO
    console.log('4️⃣ Eliminando producto...');
    const { error: deleteError } = await supabaseAdmin
      .from('productos')
      .delete()
      .eq('id', idNumero);

    if (deleteError) {
      console.error('❌ Error eliminando producto:', deleteError);
      
      // Verificar qué tabla está causando el problema
      let tablaProblema = 'tabla desconocida';
      if (deleteError.details?.includes('favoritos')) tablaProblema = 'favoritos';
      else if (deleteError.details?.includes('carrito')) tablaProblema = 'carrito';
      else if (deleteError.details?.includes('pedido')) tablaProblema = 'pedidos';
      
      return res.status(500).json({ 
        success: false, 
        error: `No se puede eliminar el producto porque está en ${tablaProblema}.`,
        errorUsuario: `El producto está en ${tablaProblema}. Intenta nuevamente.`,
        code: deleteError.code,
        detalles: deleteError.details,
        resultadosPrevio: resultadosEliminacion
      });
    }

    console.log(`✅ Producto ${idString} eliminado COMPLETAMENTE!`);
    console.log('📊 Resultados:');
    console.log('  - Imágenes de galería: eliminadas');
    console.log('  - Imagen principal: eliminada');
    console.log('  - Galería BD: eliminada');
    Object.entries(resultadosEliminacion).forEach(([tabla, count]) => {
      console.log(`  - ${tabla}: ${count} registros eliminados`);
    });
    console.log('  - Producto: eliminado');
    console.log('=== ✅ API FINALIZADA CON ÉXITO ===\n');

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado completamente',
      productoId: idString,
      detalles: {
        productoEliminado: true,
        fecha: new Date().toISOString(),
        registrosEliminados: resultadosEliminacion,
        resumen: `Producto eliminado junto con ${Object.values(resultadosEliminacion).reduce((a, b) => a + b, 0)} registros dependientes`
      }
    });

  } catch (error: any) {
    console.error('💥 ERROR NO CONTROLADO:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
}

// Función para eliminar imágenes de galería
async function eliminarImagenesGaleria(productoId: string) {
  try {
    const carpetaGalerias = `galerias/${productoId}`;
    const { data: archivos, error: listError } = await supabaseAdmin.storage
      .from('productos')
      .list(carpetaGalerias);

    if (listError) {
      if (listError.message?.includes('not found')) {
        console.log('ℹ️ Carpeta de galería no existe');
        return;
      }
      console.warn('⚠️ Error listando galería:', listError.message);
      return;
    }

    if (archivos && archivos.length > 0) {
      const rutasArchivos = archivos.map(archivo => `${carpetaGalerias}/${archivo.name}`);
      console.log(`🗑️ Eliminando ${rutasArchivos.length} archivos de galería`);
      
      const { error: deleteError } = await supabaseAdmin.storage
        .from('productos')
        .remove(rutasArchivos);
      
      if (deleteError) {
        console.warn('⚠️ Error eliminando archivos de galería:', deleteError.message);
      } else {
        console.log(`✅ ${rutasArchivos.length} imágenes de galería eliminadas`);
      }
    } else {
      console.log('ℹ️ No hay imágenes en galería');
    }
  } catch (error: any) {
    console.warn('⚠️ Error en eliminarImagenesGaleria:', error.message);
  }
}

// Función para eliminar imagen principal
async function eliminarImagenPrincipal(productoId: string) {
  try {
    const idNumero = Number(productoId);
    
    console.log(`🔍 Buscando imagen principal para producto ${productoId}...`);
    
    // Obtener producto
    const { data: producto, error: fetchError } = await supabaseAdmin
      .from('productos')
      .select('imagen, nombre')
      .eq('id', idNumero)
      .single();

    if (fetchError) {
      console.warn(`⚠️ No se pudo obtener producto ${productoId}:`, fetchError.message);
      return;
    }

    if (!producto || !producto.imagen) {
      console.log(`ℹ️ Producto ${productoId} no tiene imagen principal`);
      return;
    }

    const urlImagen = producto.imagen;
    console.log(`📸 Imagen principal encontrada: ${producto.nombre}`);
    console.log(`🔗 URL: ${urlImagen}`);

    // EXTRAER RUTA CORRECTAMENTE
    let rutaArchivo = '';
    
    // Formato: https://[project].supabase.co/storage/v1/object/public/productos/productos/filename.ext
    if (urlImagen.includes('/storage/v1/object/public/productos/')) {
      // Dividir después de 'productos/' por SEGUNDA vez
      const partes = urlImagen.split('productos/');
      console.log(`🔍 Partes encontradas: ${partes.length}`);
      
      if (partes.length >= 2) {
        // Tomar todo después del SEGUNDO 'productos/'
        // partes[0] = "https://eunsyrxioxiesiwlxysy.supabase.co/storage/v1/object/public/"
        // partes[1] = "productos/1758630297905_zapatillas-siux-diablo-yellow.webp"
        rutaArchivo = partes[1];
        console.log(`✅ Ruta extraída: ${rutaArchivo}`);
      }
    }

    // Validar ruta
    if (!rutaArchivo) {
      console.warn(`❌ No se pudo extraer ruta de: ${urlImagen}`);
      
      // Intentar método alternativo con regex
      const regex = /productos\/productos\/([^\/]+)$/;
      const match = urlImagen.match(regex);
      if (match && match[1]) {
        rutaArchivo = `productos/${match[1]}`;
        console.log(`✅ Ruta extraída (regex): ${rutaArchivo}`);
      }
    }

    // ELIMINAR ARCHIVO
    if (rutaArchivo) {
      console.log(`🗑️  Eliminando archivo: ${rutaArchivo}`);
      
      const { error: deleteError } = await supabaseAdmin.storage
        .from('productos')
        .remove([rutaArchivo]);
      
      if (deleteError) {
        console.warn(`⚠️ Error eliminando "${rutaArchivo}":`, deleteError.message);
        
        // INTENTO 2: Si falla, probar con solo el nombre del archivo
        const nombreArchivo = rutaArchivo.split('/').pop();
        if (nombreArchivo && nombreArchivo !== rutaArchivo) {
          console.log(`🗑️  Intentando eliminar solo: productos/${nombreArchivo}`);
          
          const { error: deleteError2 } = await supabaseAdmin.storage
            .from('productos')
            .remove([`productos/${nombreArchivo}`]);
          
          if (deleteError2) {
            console.warn(`⚠️ Error eliminando "productos/${nombreArchivo}":`, deleteError2.message);
            
            // INTENTO 3: Listar y eliminar por coincidencia
            await eliminarPorCoincidencia(nombreArchivo);
          } else {
            console.log(`✅ Imagen eliminada: productos/${nombreArchivo}`);
          }
        }
      } else {
        console.log(`✅ Imagen principal eliminada: ${rutaArchivo}`);
        
        // Verificar que se eliminó
        const { data: verificar } = await supabaseAdmin.storage
          .from('productos')
          .list('productos', { search: rutaArchivo.split('/').pop() });
        
        if (!verificar || verificar.length === 0) {
          console.log(`✅ Verificación: archivo eliminado correctamente`);
        } else {
          console.warn(`⚠️ Verificación: archivo aún existe en storage`);
        }
      }
    } else {
      console.warn(`❌ No se pudo determinar la ruta del archivo`);
    }
    
  } catch (error: any) {
    console.warn(`⚠️ Error en eliminarImagenPrincipal:`, error.message);
  }
}

async function eliminarPorCoincidencia(nombreArchivo: string) {
  try {
    console.log(`🔍 Buscando archivos que coincidan con: ${nombreArchivo}`);
    
    // Listar todos los archivos en la carpeta productos/
    const { data: archivos, error: listError } = await supabaseAdmin.storage
      .from('productos')
      .list('productos');
    
    if (listError) {
      console.warn('⚠️ Error listando archivos:', listError.message);
      return;
    }
    
    if (archivos && archivos.length > 0) {
      // Buscar archivos que contengan el nombre (o parte de él)
      const archivosCoincidentes = archivos.filter(archivo => 
        archivo.name.includes(nombreArchivo) || 
        nombreArchivo.includes(archivo.name)
      );
      
      if (archivosCoincidentes.length > 0) {
        const rutasAEliminar = archivosCoincidentes.map(archivo => `productos/${archivo.name}`);
        console.log(`🗑️  Eliminando ${rutasAEliminar.length} archivos coincidentes:`, rutasAEliminar);
        
        const { error: deleteError } = await supabaseAdmin.storage
          .from('productos')
          .remove(rutasAEliminar);
        
        if (deleteError) {
          console.warn('⚠️ Error eliminando coincidencias:', deleteError.message);
        } else {
          console.log(`✅ ${rutasAEliminar.length} archivos eliminados por coincidencia`);
        }
      } else {
        console.log('ℹ️ No se encontraron archivos coincidentes');
      }
    }
  } catch (error: any) {
    console.warn('⚠️ Error en eliminarPorCoincidencia:', error.message);
  }
}
