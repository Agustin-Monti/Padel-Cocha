'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ModalMisPedidos from '@/components/ModalMisPedidos';
import { Package, Clock, Calendar, Zap, Shield, Truck, CreditCard, Bell } from 'lucide-react';

type ProductoComprado = {
  id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

type Pedido = {
  id: string;
  estado_pedido: string;
  total: number;
  created_at: string;
  email_comprador: string;
  tracking_number?: string | null;
  status?: string;
  direccion?: string;
  producto_id?: string;
  productos_comprados?: ProductoComprado[];
};

export default function MisPedidos() {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('pagos')
        .select('*')
        .eq('email_comprador', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar pedidos:', error);
      } else {
        setPedidos(data || []);
      }

      setLoading(false);
    };

    fetchPedidos();
  }, [supabase]);

  if (loading) return <p className="text-gray-500">Cargando pedidos...</p>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6 lg:px-0">
      {/* Header con gradiente */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
            <Package className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Historial de Pedidos</h2>
            <p className="text-gray-600 mt-1">Consulta y gestiona todos tus pedidos en un solo lugar</p>
          </div>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
      </div>

      {/* Banner de estado */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-amber-100">
            <Clock className="h-12 w-12 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sección en Desarrollo</h3>
            <p className="text-gray-700 mb-3">
              Estamos trabajando para ofrecerte una experiencia completa de seguimiento de pedidos. 
              Pronto podrás consultar el historial, estado de envío y detalles de todas tus compras.
            </p>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Disponible en la próxima actualización</span>
            </div>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full">
            Próximamente
          </div>
        </div>
      </div>

      {/* {pedidos.length === 0 ? (
        <p className="text-gray-600">No se encontraron pedidos asociados a tu correo.</p>
      ) : (
        <div className="grid gap-6">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm bg-white hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2 sm:gap-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Pedido #{pedido.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Realizado el: {new Date(pedido.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium px-3 py-1 rounded-full text-center w-max ${
                    pedido.estado_pedido === 'completado'
                      ? 'bg-green-100 text-green-800'
                      : pedido.estado_pedido === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {pedido.estado_pedido.charAt(0).toUpperCase() + pedido.estado_pedido.slice(1)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                <div className="text-gray-600">
                  <p className="text-sm">Total pagado:</p>
                  <p className="text-lg font-semibold text-gray-900">${pedido.total.toFixed(2)}</p>
                </div>

                <button
                  onClick={() => setPedidoSeleccionado(pedido)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )} */}

      {/* {pedidoSeleccionado && (
        <ModalMisPedidos
          isOpen={!!pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
          pedido={pedidoSeleccionado}
        />
      )} */}
    </div>
  );
}
