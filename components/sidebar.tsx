// components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: string;
  superadmin: boolean;
  admin: boolean;
}

export default function Sidebar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          // Obtener el perfil del usuario actual
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, superadmin, admin')
            .eq('id', authUser.id)
            .single();

          setCurrentUser(profile);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 font-bold text-center border-b border-gray-700">
          Punto Padel LF
        </div>
        <div className="p-4 text-center">Cargando...</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 font-bold text-center border-b border-gray-700">
        Punto Padel LF
      </div>

      {/* Enlaces */}
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link href="/admin/dashboard" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>🏠</span>
              <span>Inicio</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/dashboard/productos" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>📦</span>
              <span>Productos</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/dashboard/categorias" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>📂</span>
              <span>Categorías</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/dashboard/marcas" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>🏷️</span>
              <span>Marcas</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/dashboard/tipos" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>💼</span>
              <span>Tipos Productos</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/dashboard/pedidos" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>🛒</span>
              <span>Pedidos</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/dashboard/metodos" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>📬</span>
              <span>Metodos de Envios</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/dashboard/usuarios" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>👥</span>
              <span>Usuarios</span>
            </Link>
          </li>
          
          {/* Solo mostrar "Admins" a superadmins */}
          {currentUser?.superadmin && (
            <li>
              <Link href="/admin/dashboard/admins" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                <span>👤</span>
                <span>Admins</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Info del usuario actual */}
      <div className="p-4 border-t border-gray-700 text-xs">
        <p>Usuario: {currentUser?.superadmin ? 'SuperAdmin' : currentUser?.admin ? 'Admin' : 'Usuario'}</p>
      </div>
    </aside>
  );
}