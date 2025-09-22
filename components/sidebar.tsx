import Link from 'next/link';

export default function Sidebar() {
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
          <li>
            <Link href="/admin/dashboard/admins" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
              <span>👤</span>
              <span>Admins</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
