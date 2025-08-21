"use server";

import { createClient } from "@/utils/supabase/server";

interface Producto {
  id: number;
  nombre: string;
  imagen: string;
}

interface Pedido {
  id: number;
  nombre_comprador: string;
  email_comprador: string;
  total: number;
  status: string;
  id_transaccion: string;
  dni: string;
  direccion: string;
  estado_pedido: string;
  producto_id: string | number[]; // Puede ser un string o un arreglo de números
  productos?: Producto[]; // Productos asociados al pedido
}

export async function getPedidos() {
  const supabase = createClient();

  // Obtener los pedidos
  const { data: pedidos, error } = await supabase
    .from('pagos')
    .select(`
      *,
      comprobantes_transferencia!pagos_comprobante_transferencia_id_fkey (
        url_comprobante
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching pagos:", error);
    return null;
  }

  console.log("Pedidos obtenidos:", pedidos); // Verifica los pedidos obtenidos

  // Obtener los productos asociados a cada pedido
  const pedidosConProductos = await Promise.all(
    pedidos.map(async (pedido) => {
      // Convertir producto_id a un arreglo de números
      const productoIds = Array.isArray(pedido.producto_id)
        ? pedido.producto_id
        : [Number(pedido.producto_id)];

      console.log(`Producto IDs para el pedido ${pedido.id}:`, productoIds); // Verifica los IDs de productos

      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select('id, nombre, imagen')
        .in('id', productoIds); // Filtrar productos por IDs

      if (productosError) {
        console.error("Error fetching productos:", productosError);
        return { ...pedido, productos: [] }; // Si hay un error, devolver un array vacío
      }

      console.log(`Productos para el pedido ${pedido.id}:`, productos); // Verifica los productos obtenidos

      return { ...pedido, productos }; // Añadir los productos al pedido
    })
  );

  console.log("Pedidos con productos:", pedidosConProductos); // Verifica los pedidos con productos

  return pedidosConProductos;
}



export async function guardarEstadoPedido(pedidoId: number, nuevoEstado: string, trackingNumber: string | null, nuevoStatus: string) {
  const supabase = createClient();

  // Actualizamos el estado del pedido en la tabla 'pagos'
  const { data, error } = await supabase
    .from('pagos')
    .update({ 
      estado_pedido: nuevoEstado, 
      tracking_number: trackingNumber, // Si hay un número de tracking, lo actualizamos también
      status: nuevoStatus
    })
    .eq('id', pedidoId) // Filtramos por el ID del pedido
    .select() // Asegúrate de seleccionar los datos actualizados
    .returns<Pedido[]>(); // Especifica que `data` es un arreglo de `Pedido`

  if (error) {
    console.error("Error actualizando el estado del pedido:", error);
    return null; // En caso de error, devuelve null
  }

  // Verificamos si `data` es null o está vacío antes de usarlo
  if (!data || data.length === 0) {
    console.error("No se encontraron datos actualizados");
    return null;
  }

  const pedido = data[0]; // Ahora TypeScript sabe que `data` es un arreglo de `Pedido`

  // Si el estado es "Enviado" y hay un número de tracking, enviamos un correo
  if (nuevoEstado === 'Enviado' && trackingNumber) {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-tracking`;
      console.log("URL de la API:", apiUrl); // Para depuración

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pedido.email_comprador,
          nombre: pedido.nombre_comprador,
          trackingNumber: trackingNumber,
          direccion: pedido.direccion,
        }),
      });

      if (!response.ok) {
        throw new Error('Error enviando el correo');
      }

      console.log('Correo enviado correctamente');
    } catch (error) {
      console.error('Error enviando el correo:', error);
    }
  }

  return data; // Devuelve los datos actualizados
}

