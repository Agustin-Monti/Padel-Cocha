'use client';

import { useState } from 'react';
import DatosPerfil from '@/components/DatosPerfil';
import Seguridad from '@/components/Seguridad';
import Direcciones from '@/components/Direcciones';
import MisPedidos from '@/components/MisPedidos';
import { User, Shield, MapPin, Package, ChevronDown, LayoutDashboard } from 'lucide-react';

const tabs = [
  { 
    id: 'perfil', 
    label: 'Datos de Perfil', 
    icon: User,
    description: 'Información personal y preferencias',
    color: 'from-blue-500 to-indigo-500'
  },
  { 
    id: 'seguridad', 
    label: 'Seguridad', 
    icon: Shield,
    description: 'Contraseña y autenticación',
    color: 'from-emerald-500 to-teal-500'
  },
  { 
    id: 'direcciones', 
    label: 'Direcciones', 
    icon: MapPin,
    description: 'Envío y facturación',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'pedidos', 
    label: 'Mis Pedidos', 
    icon: Package,
    description: 'Historial y seguimiento',
    color: 'from-amber-500 to-orange-500'
  },
];

export default function Tabs() {
  const [active, setActive] = useState('perfil');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getActiveTab = () => tabs.find(tab => tab.id === active);
  const ActiveIcon = getActiveTab()?.icon || User;

  return (
    <div className="space-y-6">
      {/* Header móvil mejorado */}
      <div className="sm:hidden">
        <div className="relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getActiveTab()?.color} text-white`}>
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">{getActiveTab()?.label}</p>
                <p className="text-xs text-gray-500">{getActiveTab()?.description}</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown menu */}
          {isMobileMenuOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActive(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-4 transition-colors ${
                      active === tab.id 
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${tab.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">{tab.label}</p>
                      <p className="text-xs text-gray-500">{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabs desktop mejoradas */}
      <div className="hidden sm:block px-8 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <LayoutDashboard className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">NAVEGACIÓN</span>
        </div>
        
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex-1 flex flex-col items-center p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Indicator line */}
                {isActive && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color}`}></div>
                )}
                
                {/* Icon container */}
                <div className={`p-3 rounded-xl mb-3 transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${tab.color} shadow-lg` 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                </div>
                
                {/* Label */}
                <span className={`font-semibold mb-1 ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                  {tab.label}
                </span>
                
                {/* Description */}
                <span className="text-xs text-gray-500 text-center">
                  {tab.description}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute bottom-2 h-1 w-6 rounded-full bg-gradient-to-r ${tab.color}`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido con animación */}
      <div className="px-6 sm:px-8 pb-8">
        {/* Animated border above content */}
        <div className={`h-1 w-full mb-6 bg-gradient-to-r ${getActiveTab()?.color} rounded-full opacity-80`}></div>
        
        {/* Content container */}
        <div className="animate-fadeIn">
          {active === 'perfil' && <DatosPerfil />}
          {active === 'seguridad' && <Seguridad />}
          {active === 'direcciones' && <Direcciones />}
          {active === 'pedidos' && <MisPedidos />}
        </div>
      </div>
    </div>
  );
}
