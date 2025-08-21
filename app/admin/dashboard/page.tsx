'use client';

import { useEffect, useState } from 'react';
import GraficosProductosSection from '@/components/GraficosProductosSection';
import { getDashboardResumen } from '@/actions/dashboard-actions';
import {
  Package,
  LayoutGrid,
  Tags,
} from 'lucide-react'; // íconos

export default function AdminDashboard() {
  const [resumen, setResumen] = useState({
    totalProductos: 0,
    totalCategorias: 0,
    totalTipos: 0,
  });

  useEffect(() => {
    const fetchResumen = async () => {
      const data = await getDashboardResumen();
      setResumen(data);
    };
    fetchResumen();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Bienvenido al Panel de Administración</h1>
      <p className="text-gray-700 mb-6">Usa la barra lateral para navegar entre las secciones.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Card Productos */}
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-blue-500 text-white rounded-full p-2">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-blue-700">Total Productos</p>
            <h2 className="text-2xl font-bold text-blue-900">{resumen.totalProductos}</h2>
          </div>
        </div>

        {/* Card Categorías */}
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-green-500 text-white rounded-full p-2">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-green-700">Total Categorías</p>
            <h2 className="text-2xl font-bold text-green-900">{resumen.totalCategorias}</h2>
          </div>
        </div>

        {/* Card Tipos */}
        <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-purple-500 text-white rounded-full p-2">
            <Tags className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-purple-700">Total Tipos</p>
            <h2 className="text-2xl font-bold text-purple-900">{resumen.totalTipos}</h2>
          </div>
        </div>
      </div>

      {/* Contenedor centrado y con max-width */}
      <div className="mx-auto max-w-4xl">
        <GraficosProductosSection />
      </div>
    </div>
  );
}
