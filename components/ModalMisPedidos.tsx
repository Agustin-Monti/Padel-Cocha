'use client';

import { X, Hourglass, Truck, PackageCheck, XCircle, Copy } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';

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

interface ModalMisPedidosProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido;
}

const fases = [
  { id: "en_proceso", label: "En proceso", icon: Hourglass },
  { id: "enviado", label: "Enviado", icon: Truck },
  { id: "entregado", label: "Entregado", icon: PackageCheck },
  { id: "cancelado", label: "Cancelado", icon: XCircle },
];

function normalizarEstado(estado: string) {
  return estado.toLowerCase().replace(/\s/g, "_");
}

export default function ModalMisPedidos({
  isOpen,
  onClose,
  pedido,
}: ModalMisPedidosProps) {
  if (!isOpen) return null;

  const estadoNormalizado = normalizarEstado(pedido.estado_pedido);
  const fasesActivas = fases.filter((f) => f.id !== "cancelado");
  const faseActualIndex = fasesActivas.findIndex((f) => f.id === estadoNormalizado);
  const [copiado, setCopiado] = useState(false);
  const [nombresProductos, setNombresProductos] = useState<string[]>([]);
  const productosComprados: ProductoComprado[] = Array.isArray(pedido.productos_comprados)
    ? pedido.productos_comprados
    : JSON.parse(pedido.productos_comprados || "[]");

  const supabase = createClient();

  useEffect(() => {
    const cargarNombresProductos = async () => {
      if (!pedido.producto_id) return;

      let ids: number[] = [];

      // Si producto_id es un array de strings tipo ["1", "2"]
      if (Array.isArray(pedido.producto_id)) {
        ids = pedido.producto_id
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      }

      if (ids.length === 0) return;

      const { data, error } = await supabase
        .from("productos")
        .select("nombre")
        .in("id", ids);

      if (error) {
        console.error("Error al cargar nombres:", error);
      } else {
        const nombres = data.map((producto) => producto.nombre);
        setNombresProductos(nombres);
      }
    };

    cargarNombresProductos();
  }, [pedido.producto_id, supabase]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl max-h-screen overflow-y-auto rounded-2xl bg-white shadow-xl p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Detalles del pedido #{pedido.id}
          </h2>

          <div className="mb-6 space-y-1">
            <p className="text-sm text-gray-600">
              Fecha:{" "}
              <span className="font-semibold text-gray-900">
                {new Date(pedido.created_at).toLocaleDateString("es-AR")}
              </span>
            </p>

            <p className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-semibold text-gray-900">
                ${pedido.total.toFixed(2)}
              </span>
            </p>

            {pedido.status && (
              <p className="text-sm text-gray-600">
                Estado de aprobación:{" "}
                <span className="font-semibold text-gray-900">
                  {pedido.status === "approved" ? "Aprobado" : pedido.status}
                </span>
              </p>
            )}

            <p className="text-sm text-gray-600">
              Estado actual:{" "}
              <span
                className={`font-semibold ${
                  pedido.estado_pedido.toLowerCase() === "cancelado"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {pedido.estado_pedido}
              </span>
            </p>

            {pedido.direccion && (
              <p className="text-sm text-gray-600">
                Dirección de entrega:{" "}
                <span className="font-semibold text-gray-900">{pedido.direccion}</span>
              </p>
            )}

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Productos comprados:</p>
              <div className="hidden sm:grid grid-cols-4 text-sm font-semibold text-gray-600 border-b pb-1">
                <span>Producto</span>
                <span>Cantidad</span>
                <span>Precio unitario</span>
                <span>Total</span>
              </div>
              {productosComprados.map((producto, index) => (
                <div
                  key={index}
                  className="sm:grid sm:grid-cols-4 flex flex-col gap-1 text-sm text-gray-700 py-2 border-b"
                >
                  <span>
                    <span className="sm:hidden font-medium">Producto: </span>
                    {producto.nombre}
                  </span>
                  <span>
                    <span className="sm:hidden font-medium">Cantidad: </span>
                    {producto.cantidad}
                  </span>
                  <span>
                    <span className="sm:hidden font-medium">Precio: </span>${producto.precio_unitario.toFixed(2)}
                  </span>
                  <span>
                    <span className="sm:hidden font-medium">Total: </span>${(producto.cantidad * producto.precio_unitario).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {pedido.estado_pedido.toLowerCase() === "cancelado" ? (
            <div className="flex flex-col items-center justify-center py-8 text-red-600">
              <XCircle className="w-14 h-14 mb-2" />
              <p className="text-lg font-semibold">Este pedido ha sido cancelado.</p>
            </div>
          ) : (
            <div className="relative w-full mt-10 px-4">
              {/* Línea de fondo */}
              <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded-full z-0" />

              {/* Línea de progreso */}
              <div
                className="absolute top-5 left-5 h-1 bg-blue-600 rounded-full z-10 transition-all duration-500"
                style={{
                  width: `${
                    faseActualIndex >= 0
                      ? faseActualIndex === 0
                        ? "10%" // línea mínima si está en "En proceso"
                        : (faseActualIndex / (fasesActivas.length - 1)) * 100 + "%"
                      : "0%"
                  }`,
                }}
              />

              {/* Iconos y etiquetas */}
              <div className="relative flex justify-between z-20">
                {fasesActivas.map((fase, index) => {
                  const Icon = fase.icon;
                  const activo = index <= faseActualIndex;

                  return (
                    <div
                      key={fase.id}
                      className="flex flex-col items-center text-center w-1/4"
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          activo
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="mt-2 text-xs text-gray-600">{fase.label}</span>
                    </div>
                  );
                })}
              </div>

              {pedido.estado_pedido.toLowerCase() === "enviado" && pedido.tracking_number && (
                <div className="mt-6 text-center flex items-center justify-center gap-2">
                  <p className="text-sm text-gray-600">
                    Número de seguimiento:{" "}
                    <span className="ml-2 font-semibold text-gray-900">{pedido.tracking_number}</span>
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pedido.tracking_number || "");
                      setCopiado(true);
                      setTimeout(() => setCopiado(false), 2000); // desaparece en 2 segundos
                    }}
                    className="text-gray-500 hover:text-blue-600 transition"
                    title="Copiar número de seguimiento"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {copiado && (
                    <span className="text-sm text-green-600 font-medium">¡Copiado!</span>
                  )}
                </div>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
