'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function GraficosProductosSection() {
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => {
    fetch('/api/graficos-productos')
      .then((res) => res.json())
      .then(setDatos)
      .catch(console.error);
  }, []);

  if (!datos) return <p className="text-gray-500">Cargando gráficos...</p>;

  const datosPorCategoria = Object.entries(datos?.productosPorCategoria || {}).map(
    ([nombre, cantidad]) => ({
      nombre,
      cantidad,
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        📊 Estadísticas de Productos
      </h2>

      {/* Grid responsiva moderna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Productos por categoría */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 col-span-2">
          <p className="font-semibold text-lg text-gray-700 mb-4">
            Productos por categoría
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={datosPorCategoria} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Más añadidos al carrito */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <p className="font-semibold text-lg text-gray-700 mb-4">
            Productos más añadidos al carrito
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos.productosMasCarrito}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="cantidad" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Más comprados */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <p className="font-semibold text-lg text-gray-700 mb-4">
            Productos más comprados
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos.productosMasComprados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="cantidad" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Más favoritos */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <p className="font-semibold text-lg text-gray-700 mb-4">
            Productos más añadidos a favoritos
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos.productosMasFavoritos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="cantidad" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
