"use client"

import { useEffect, useState } from 'react';
import { getPedidos } from '@/actions/pedidos-actions';
import { Table } from '@/components/ui/table';
import ModalPedidos from '@/components/ModalPedidos';  // Importar el nuevo modal

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
  productos?: Producto[]; // Productos asociados al pedido
  metodo_pago?: string;
  url_comprobante?: string;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  const fetchPedidos = async () => {
    try {
      const data = await getPedidos();
      setPedidos(data ?? []);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleOpenModal = (pedido: Pedido) => {
    setSelectedPedido(pedido);  // Establecer el pedido seleccionado
    setIsModalOpen(true);       // Abrir el modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);      // Cerrar el modal
    setSelectedPedido(null);    // Limpiar el pedido seleccionado
  };

  // Función para obtener el icono correspondiente al estado
  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'En Proceso':
        return '⌛'; // Icono para "En Proceso"
      case 'Enviado':
        return '🚚'; // Icono para "Enviado"
      case 'Entregado':
        return '✅'; // Icono para "Entregado"
      case 'Cancelado':
        return '❌'; // Icono para "Cancelado"
      default:
        return ''; // Si no se reconoce el estado
    }
  };


  const traducirEstadoPago = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
      <Table
        headers={['ID', 'Nombre', 'Email', 'Total', 'Estado del Pago', 'Estado del Pedido', 'Acciones']}
        data={pedidos.map((pedido) => ({
          id: pedido.id,
          nombre: pedido.nombre_comprador,
          email: pedido.email_comprador,
          total: `$${pedido.total}`,
          estadoPago: traducirEstadoPago(pedido.status),
          // Usamos la función para obtener el icono junto con el estado
          estadoPedido: `${obtenerIconoEstado(pedido.estado_pedido)} ${pedido.estado_pedido}`,
          acciones: (
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(pedido)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Ver
              </button>
            </div>
          ),
        }))}
        filterKey="status"
        searchPlaceholder="Buscar pedidos..."
      />

      {/* Modal con los detalles del pedido */}
      {selectedPedido && (
        <ModalPedidos
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pedido={selectedPedido}
          onEstadoActualizado={fetchPedidos}
        />
      )}
    </div>
  );
}
