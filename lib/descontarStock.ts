
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

type ItemCarrito = {
  id: number 
  cantidad: number
  talle?: string 
}

export async function descontarStock(items: ItemCarrito[]) {
  for (const item of items) {
    console.log(`📦 Procesando item ${item.id} con talle:`, item.talle);
    const { data: producto, error } = await supabase
      .from('productos')
      .select('stock, talle')
      .eq('id', item.id)
      .single()

    if (error || !producto) continue

    let nuevoStock = Math.max(0, producto.stock - item.cantidad)
    let nuevosTalles = producto.talle

    
    if (item.talle && producto.talle) {
      try {
        const talleSeleccionado = Array.isArray(item.talle) ? item.talle[0] : item.talle; // Asegura string
        const tallesObj = JSON.parse(producto.talle);

        if (tallesObj[talleSeleccionado] !== undefined) {
          tallesObj[talleSeleccionado] = Math.max(0, tallesObj[talleSeleccionado] - item.cantidad);
          nuevosTalles = JSON.stringify(tallesObj);
        }
      } catch (e) {
        console.error(`Error parseando talles:`, e);
      }
    }

    await supabase
      .from('productos')
      .update({
        stock: nuevoStock,
        talle: nuevosTalles 
      })
      .eq('id', item.id)
  }
}

