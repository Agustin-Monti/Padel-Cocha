import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // --- Productos por categoría ---
    const { data: productos, error: prodError } = await supabaseAdmin
      .from('productos')
      .select('id, nombre, categoria_id, categorias(nombre)');

    if (prodError) throw prodError;

    const productosPorCategoria: Record<string, number> = {};
    productos.forEach((prod: any) => {
      const cat = prod.categorias?.nombre || 'Sin categoría';
      productosPorCategoria[cat] = (productosPorCategoria[cat] || 0) + 1;
    });

    // --- Productos más añadidos al carrito ---
    const { data: carrito, error: cartError } = await supabaseAdmin
      .from('carrito')
      .select('producto_id, productos(nombre)')
      .not('producto_id', 'is', null); // Previene errores si hay registros corruptos

    if (cartError) throw cartError;

    const productosCarrito: Record<string, number> = {};
    carrito.forEach((item: any) => {
      const nombre = item.productos?.nombre || 'Desconocido';
      productosCarrito[nombre] = (productosCarrito[nombre] || 0) + 1;
    });

    const productosMasCarrito = Object.entries(productosCarrito)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    // --- Productos más comprados desde JSON string ---
    const { data: pagos, error: pagosError } = await supabaseAdmin
      .from('pagos')
      .select('productos_comprados');

    if (pagosError) throw pagosError;

    const todosLosIds: number[] = pagos.flatMap((p: any) => {
      if (!p.productos_comprados) return [];

      try {
        const items = typeof p.productos_comprados === 'string'
          ? JSON.parse(p.productos_comprados)
          : p.productos_comprados;

        return Array.isArray(items) ? items.map((item: any) => item.id) : [];
      } catch (e) {
        console.warn('⚠️ Error al parsear productos_comprados:', p.productos_comprados);
        return [];
      }
    });

    const conteoPorId: Record<number, number> = {};
    todosLosIds.forEach(id => {
      conteoPorId[id] = (conteoPorId[id] || 0) + 1;
    });

    const idsUnicos = [...new Set(todosLosIds)];

    const { data: productosCompradosData, error: productosCompradosError } = await supabaseAdmin
      .from('productos')
      .select('id, nombre')
      .in('id', idsUnicos);

    if (productosCompradosError) throw productosCompradosError;

    const productosMasComprados = productosCompradosData
      .map((p: any) => ({
        nombre: p.nombre,
        cantidad: conteoPorId[p.id] || 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

      // Agregar después de "productos más comprados"
      // --- Productos más añadidos a favoritos ---
      const { data: favoritos, error: favError } = await supabaseAdmin
        .from('favoritos')
        .select('producto_id, productos(nombre)')
        .not('producto_id', 'is', null);

      if (favError) throw favError;

      const productosFavoritos: Record<string, number> = {};
      favoritos.forEach((item: any) => {
        const nombre = item.productos?.nombre || 'Desconocido';
        productosFavoritos[nombre] = (productosFavoritos[nombre] || 0) + 1;
      });

      const productosMasFavoritos = Object.entries(productosFavoritos)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);


    return res.status(200).json({
      productosPorCategoria,
      productosMasCarrito,
      productosMasComprados,
      productosMasFavoritos,
    });


    
    
  } catch (error) {
    console.error('❌ Error en graficos-productos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
