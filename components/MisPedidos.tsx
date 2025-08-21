'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ModalMisPedidos from '@/components/ModalMisPedidos';

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
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Mis pedidos</h2>

      {pedidos.length === 0 ? (
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
      )}

      {pedidoSeleccionado && (
        <ModalMisPedidos
          isOpen={!!pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
          pedido={pedidoSeleccionado}
        />
      )}
    </div>
  );
}
