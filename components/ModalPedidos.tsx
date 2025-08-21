// components/ModalPedidos.tsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { guardarEstadoPedido } from '@/actions/pedidos-actions';
import ModalVerComprobante from './ModalVerComprobante';

interface ProductoComprado {
  id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
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
  productos_comprados?: ProductoComprado[] | string;
  metodo_pago?: string;
  comprobantes_transferencia?: {
    url_comprobante: string;
  };
}

interface ModalPedidosProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido;
  onEstadoActualizado: () => void;
}

const ModalPedidos: React.FC<ModalPedidosProps> = ({
  isOpen,
  onClose,
  pedido,
  onEstadoActualizado,
}) => {
  const [nuevoEstado, setNuevoEstado] = useState(pedido.estado_pedido);
  const [nuevoStatus, setNuevoStatus] = useState(pedido.status);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [verComprobante, setVerComprobante] = useState(false);


  if (!isOpen) return null;

  let productosComprados: ProductoComprado[] = [];

  try {
    productosComprados = Array.isArray(pedido.productos_comprados)
      ? pedido.productos_comprados
      : JSON.parse(pedido.productos_comprados || '[]');
  } catch (error) {
    console.error('Error al parsear productos_comprados:', error);
  }

  const handleActualizarEstado = async () => {
    try {
      const result = await guardarEstadoPedido(pedido.id, nuevoEstado, trackingNumber, nuevoStatus);
      if (result) {
        Swal.fire({
          icon: 'success',
          title: '¡Estado actualizado!',
          text: 'El estado del pedido se actualizó correctamente.',
          timer: 2000,
          showConfirmButton: false,
        });

        onEstadoActualizado();
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar el estado.',
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-5xl relative overflow-y-auto max-h-[90vh]">
          <h2 className="text-3xl font-bold text-center mb-8">Detalles del Pedido</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
            <div><strong>ID Pedido:</strong> {pedido.id}</div>
            <div><strong>Nombre:</strong> {pedido.nombre_comprador}</div>
            <div><strong>Email:</strong> {pedido.email_comprador}</div>
            <div><strong>DNI:</strong> {pedido.dni}</div>
            <div><strong>Dirección:</strong> {pedido.direccion}</div>
            <div><strong>Total:</strong> ${pedido.total.toLocaleString()}</div>
            <div><strong>Método de pago:</strong> {pedido.metodo_pago}</div>

            {pedido.metodo_pago === 'Transferencia Bancaria' ? (
              <div className="col-span-1 md:col-span-2">
                <strong>Comprobante:</strong>{' '}
                {pedido.comprobantes_transferencia?.url_comprobante ? (
                  <button
                    onClick={() => setVerComprobante(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mt-1 rounded-lg shadow-sm transition"
                  >
                    Ver comprobante
                  </button>
                ) : (
                  <span className="text-red-600">No disponible</span>
                )}
                <div className="mt-4">
                  <label className="font-semibold">Estado del pago:</label>
                  <select
                    value={nuevoStatus}
                    onChange={(e) => setNuevoStatus(e.target.value)}
                    className="mt-1 border border-gray-300 p-2 rounded w-full"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
              </div>
            ) : (
              <div><strong>ID Transacción:</strong> {pedido.id_transaccion}</div>
            )}
          </div>

          <div className="mt-8">
            <label className="font-semibold">Estado del pedido:</label>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="ml-2 border border-gray-300 p-2 rounded w-full mt-2"
            >
              <option value="En Proceso">En Proceso</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {nuevoEstado === 'Enviado' && (
            <div className="mt-4">
              <label htmlFor="trackingNumber" className="block font-semibold mb-1">
                Número de Tracking:
              </label>
              <input
                type="text"
                id="trackingNumber"
                value={trackingNumber || ''}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Ingresa el número de tracking"
              />
            </div>
          )}

          <div className="mt-10">
            <h3 className="font-bold text-lg mb-3">Productos del pedido:</h3>
            {productosComprados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productosComprados.map((producto) => (
                  <div
                    key={producto.id}
                    className="border rounded-xl p-4 bg-gray-50 shadow-sm"
                  >
                    <p className="font-medium text-lg">{producto.nombre}</p>
                    <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                    <p className="text-sm text-gray-600">Precio unitario: ${producto.precio_unitario}</p>
                    <p className="text-sm text-gray-800 font-semibold">
                      Subtotal: ${producto.cantidad * producto.precio_unitario}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay productos cargados en este pedido.</p>
            )}
          </div>

          <p className="mt-6 text-sm text-red-600 bg-red-100 p-2 rounded">
            ⚠️ Recargá la página después de cambiar el estado del pedido para ver los cambios reflejados.
          </p>

          <div className="flex justify-end mt-6 gap-4">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cerrar
            </button>
            <button
              onClick={handleActualizarEstado}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
            >
              Actualizar Estado
            </button>
          </div>
        </div>
      </div>

      {/* Modal para ver comprobante */}
      {pedido.comprobantes_transferencia?.url_comprobante && (
        <ModalVerComprobante
          isOpen={verComprobante}
          onClose={() => setVerComprobante(false)}
          url={pedido.comprobantes_transferencia.url_comprobante}
        />
      )}
    </>
  );
};

export default ModalPedidos;
