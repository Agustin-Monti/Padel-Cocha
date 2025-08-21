'use client';

import Link from "next/link";
import { useEffect } from 'react';
import { useCarrito } from '@/context/CarritoContext';
import { TrashIcon } from '@heroicons/react/24/solid';

export default function Carrito({
  isOpen,
  onClose,
  carritoModificado
}: {
  isOpen: boolean;
  onClose: () => void;
  carritoModificado: boolean;
}) {
  const {
    carrito,
    total,
    fetchCarrito,
    eliminarItem,
    actualizarCantidad
  } = useCarrito();

  const ENVIO_GRATIS_MINIMO = 200000;
  const tieneEnvioGratis = total >= ENVIO_GRATIS_MINIMO;

  useEffect(() => {
    if (isOpen) {
      fetchCarrito();
    }
  }, [isOpen, carritoModificado]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className={`fixed inset-y-0 right-0 w-96 bg-white p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Tu carrito</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        <div className="flex justify-between text-gray-500 text-sm border-b pb-2">
          <span>PRODUCTO</span>
          <span>TOTAL</span>
        </div>

        {carrito.length === 0 ? (
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500">Tu carrito está vacío</p>
            <button className="text-gray-500 hover:text-gray-700">Seguir Comprando</button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {carrito.map(item => (
              <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                {item.producto ? (
                  <>
                    <img src={item.producto.imagen} alt={item.producto.nombre} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="text-md font-semibold">{item.producto.nombre}</h3>

                      {item.talle && (
                        <p className="text-sm text-gray-500">Talle: {item.talle}</p>
                      )}


                      {item.producto.oferta_activa && item.producto.precio_oferta ? (
                        <p className="text-sm text-red-600 font-semibold">
                          ${item.producto.precio_oferta.toLocaleString()}
                          <span className="ml-2 text-gray-400 line-through text-xs">
                            ${item.producto.precio.toLocaleString()}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Precio: ${item.producto.precio.toLocaleString()}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        Total: $
                        {(
                          (item.producto.oferta_activa && item.producto.precio_oferta
                            ? item.producto.precio_oferta
                            : item.producto.precio) * item.cantidad
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg px-2 py-1">
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className="text-gray-600">-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className="text-gray-600">+</button>
                    </div>
                    <button onClick={() => eliminarItem(item.id)} className="text-gray-400 hover:text-red-500">
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

        <div className="mt-6 space-y-2">
          <Link href="/cart" className="w-full px-6 py-3 border border-black text-black rounded-lg hover:bg-gray-100 flex justify-center">Ver carrito</Link>
          <Link href="/checkout" className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 flex justify-center">Proceder al pago</Link>
        </div>
      </div>
    </div>
  );
}
