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
  talle?: string;
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
  metodo_envio: string;
  metodo_empresa: string;
  created_at?: string;
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

  // Formatear fecha si está disponible
  const fechaPedido = pedido.created_at 
    ? new Date(pedido.created_at).toLocaleDateString('es-AR')
    : 'Fecha no disponible';

  const subtotal = productosComprados.reduce((acc, producto) => 
    acc + (producto.precio_unitario * producto.cantidad), 0
  );
  const costoEnvio = parseFloat(pedido.metodo_envio);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden border border-gray-200">
          
          {/* Header tipo comprobante */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">PUNTO PADEL LF</h1>
                <p className="text-blue-100 text-sm">Comprobante de Pedido</p>
              </div>
              <div className="text-right">
                <div className="bg-white text-blue-800 px-3 py-1 rounded-lg font-bold text-lg">
                  #{pedido.id}
                </div>
                <p className="text-blue-100 text-sm mt-1">{fechaPedido}</p>
              </div>
            </div>
          </div>

          <div className="p-1 space-y-6">
            {/* Información del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-1 bg-gray-50">
                <h3 className="font-bold text-gray-700 mb-1 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span>
                  Información del Cliente
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Nombre:</strong> {pedido.nombre_comprador}</div>
                  <div><strong>Email:</strong> {pedido.email_comprador}</div>
                  <div><strong>DNI:</strong> {pedido.dni}</div>
                  <div><strong>Dirección:</strong> {pedido.direccion}</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-1 bg-gray-50">
                <h3 className="font-bold text-gray-700 mb-1 flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                  Detalles del Pago
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Método:</strong> {pedido.metodo_pago}</div>
                  <div><strong>ID Transacción:</strong> {pedido.id_transaccion}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      pedido.status === 'approved' ? 'bg-green-100 text-green-800' :
                      pedido.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pedido.status}
                    </span>
                  </div>
                  {pedido.metodo_pago === 'Transferencia Bancaria' && (
                    <div>
                      <button
                        onClick={() => setVerComprobante(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs rounded transition mt-1"
                      >
                        📎 Ver Comprobante
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de envío */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="font-bold text-gray-700 mb-1 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-1"></span>
                Información de Envío
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Empresa:</strong> {pedido.metodo_empresa}
                </div>
                <div>
                  <strong>Costo de envío:</strong> ${costoEnvio.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Productos - Estilo tabla */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white p-1">
                <h3 className="font-bold">Productos del Pedido</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-1 text-sm font-semibold">Producto</th>
                      <th className="text-center p-1 text-sm font-semibold">Cantidad</th>
                      <th className="text-center p-1 text-sm font-semibold">P. Unitario</th>
                      <th className="text-center p-1 text-sm font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosComprados.map((producto, index) => (
                      <tr key={producto.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-sm">
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            {producto.talle && (
                              <div className="text-gray-500 text-xs">Talle: {producto.talle}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-center">{producto.cantidad}</td>
                        <td className="p-3 text-sm text-center">${producto.precio_unitario.toLocaleString()}</td>
                        <td className="p-3 text-sm text-center font-semibold">
                          ${(producto.cantidad * producto.precio_unitario).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg">
                <span>Total del Pedido</span>
                <span className="text-2xl font-bold">${pedido.total.toLocaleString()}</span>
              </div>
              <div className="text-gray-300 text-sm mt-2 flex justify-between">
                <span>Subtotal: ${subtotal.toLocaleString()}</span>
                <span>Envío: ${costoEnvio.toLocaleString()}</span>
              </div>
            </div>

            {/* Controles de estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Estado del Pedido
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="En Proceso">🔄 En Proceso</option>
                  <option value="Enviado">🚚 Enviado</option>
                  <option value="Entregado">✅ Entregado</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>

              {pedido.metodo_pago === 'Transferencia Bancaria' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Estado del Pago
                  </label>
                  <select
                    value={nuevoStatus}
                    onChange={(e) => setNuevoStatus(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="approved">✅ Aprobado</option>
                    <option value="rechazado">❌ Rechazado</option>
                  </select>
                </div>
              )}
            </div>

            {nuevoEstado === 'Enviado' && (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <label className="block font-semibold text-gray-700 mb-2">
                  📦 Número de Tracking
                </label>
                <input
                  type="text"
                  value={trackingNumber || ''}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Ingresa el número de tracking..."
                />
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Cerrar
              </button>
              <button
                onClick={handleActualizarEstado}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
              >
                💾 Actualizar Estado
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              💡 Los cambios se reflejarán después de actualizar la página
            </div>
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
