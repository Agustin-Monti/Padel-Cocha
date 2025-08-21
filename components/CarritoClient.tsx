'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { TrashIcon } from '@heroicons/react/24/solid';
import { useCarrito } from '@/context/CarritoContext';

interface CarritoItem {
  id: string;
  cantidad: number;
  talle: string;
  producto: {
    nombre: string;
    precio: number;
    precio_oferta?: number;
    oferta_activa?: boolean;
    imagen: string;
  } | null;
}

export default function CarritoClient() {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const { carritoCount, setCarritoCount } = useCarrito();

  useEffect(() => {
    const fetchCarrito = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuario no autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('carrito')
        .select(`
          id,
          cantidad,
          talle,
          productos!inner(
            id,
            nombre,
            precio,
            precio_oferta,
            oferta_activa,
            imagen
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error obteniendo el carrito:', error);
        return;
      }

      const carritoData: CarritoItem[] = data.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        talle: item.talle,
        producto: Array.isArray(item.productos) ? item.productos[0] : item.productos
      }));

      setCarrito(carritoData);
      setCarritoCount(carritoData.length);
    };

    fetchCarrito();
  }, [setCarritoCount]);

  const handleEliminarItem = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('carrito')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando item:', error);
    } else {
      setCarrito(carrito.filter(item => item.id !== id));
    }
  };

  const handleActualizarCantidad = async (id: string, cantidad: number) => {
    if (cantidad < 1) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('carrito')
      .update({ cantidad })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando cantidad:', error);
    } else {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad } : item));
    }
  };

  const total = carrito.reduce((acc, item) => {
    if (!item.producto) return acc;
    const esOferta = item.producto.oferta_activa === true && typeof item.producto.precio_oferta === "number";
    const precioFinal = esOferta ? item.producto.precio_oferta! : item.producto.precio;
    return acc + precioFinal * item.cantidad;
  }, 0);

  const ENVIO_GRATIS_MINIMO = 200000;
  const tieneEnvioGratis = total >= ENVIO_GRATIS_MINIMO;

  return (
    <div className="container mx-auto p-4 pb-12">
      <h1 className="text-2xl font-bold mb-4">🛒 Tu carrito</h1>

      {/* Lista de productos */}
      {carrito.length === 0 ? (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500">Tu carrito está vacío</p>
          <button className="text-gray-500 hover:text-gray-700">
            Seguir Comprando
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {carrito.map(item => (
            <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
              {item.producto ? (
                <>
                  <img
                    src={item.producto.imagen}
                    alt={item.producto.nombre}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-md font-semibold">{item.producto.nombre}</h3>

                    {(() => {
                      const esOferta =
                        item.producto?.oferta_activa === true &&
                        typeof item.producto?.precio_oferta === "number";
                      const precioFinal = esOferta
                        ? item.producto.precio_oferta!
                        : item.producto.precio;

                      return (
                        <p className="text-sm text-gray-600">
                          {esOferta ? (
                            <>
                              <span className="text-red-600 font-semibold">
                                ${item.producto.precio_oferta!.toLocaleString()}
                              </span>
                              <span className="ml-2 text-xs line-through text-gray-400">
                                ${item.producto.precio.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            `$${item.producto.precio.toLocaleString()}`
                          )}{" "}
                          x {item.cantidad}
                        </p>
                      );
                    })()}
                    <p>
                      Talle: <span className='text-sm text-gray-600'>{item.talle}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg px-2 py-1">
                    <button
                      onClick={() => handleActualizarCantidad(item.id, item.cantidad - 1)}
                      className="text-gray-600"
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => handleActualizarCantidad(item.id, item.cantidad + 1)}
                      className="text-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleEliminarItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <p className="text-red-500">Producto no encontrado</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Total y botones de acción */}
      <div className="mt-6 border-t pt-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total estimado</span>
          <span>${total.toLocaleString()} ARS</span>
        </div>

        <p className="text-gray-400 text-sm">
          Impuestos y descuentos se calculan en la pantalla de pago.
        </p>

        <p className="text-sm mt-2 text-gray-700">
          🛈 Comprando más de ${ENVIO_GRATIS_MINIMO.toLocaleString()} tenés <span className="font-medium">envío gratis</span>.
        </p>

        {tieneEnvioGratis && (
          <div className="mt-4 p-3 rounded-xl border border-green-500 bg-green-50 text-green-800 flex items-center shadow-sm">
            <span className="text-xl mr-3">🚚</span>
            <span className="text-sm font-semibold">
              ¡Tenés envío <span className="uppercase">gratis</span> por superar los ${ENVIO_GRATIS_MINIMO.toLocaleString()}!
            </span>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="mt-6 space-y-2">
        <Link
          href="/checkout"
          className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 flex justify-center"
        >
          Proceder al pago
        </Link>
      </div>
    </div>
  );
}
