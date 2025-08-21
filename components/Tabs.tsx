'use client';

import { useState } from 'react';
import DatosPerfil from '@/components/DatosPerfil';
import Seguridad from '@/components/Seguridad';
import Direcciones from '@/components/Direcciones';
import MisPedidos from '@/components/MisPedidos';

const tabs = [
  { id: 'perfil', label: 'Datos de perfil' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'direcciones', label: 'Direcciones' },
  { id: 'pedidos', label: 'Mis pedidos' },
];

export default function Tabs() {
  const [active, setActive] = useState('perfil');

  return (
    <div className="space-y-6">
      {/* Select solo en móvil */}
      <div className="sm:hidden">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs solo en desktop */}
      <div className="hidden sm:flex gap-4 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`pb-2 border-b-2 transition-colors duration-200 ${
              active === tab.id
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-blue-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de cada tab */}
      <div>
        {active === 'perfil' && <DatosPerfil />}
        {active === 'seguridad' && <Seguridad />}
        {active === 'direcciones' && <Direcciones />}
        {active === 'pedidos' && <MisPedidos />}
      </div>
    </div>
  );
}
