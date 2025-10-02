import { useEffect, useState } from "react";
import Link from "next/link";
import { useCarrito } from "@/context/CarritoContext";
import { useFavoritos } from '@/context/FavoritosContext';
import { EnvVarWarning } from "../components/env-var-warning";
import HeaderAuth from "../components/header-auth";
import { hasEnvVars } from "../utils/supabase/check-env-vars";
import Favorito from "./Favorito";
import { User } from '@supabase/supabase-js';
import { getCategoriasYTipos, hayOfertasActivas  } from "@/actions/header-actions";
import { ChevronDown, Menu, X, Heart, Search } from "lucide-react";
import Busqueda from "../components/Busqueda";



interface HeaderProps {
  user: User | null;
  onOpenCarrito: () => void;
}

export const Header = ({ user, onOpenCarrito }: HeaderProps) => {
  const { carritoCount } = useCarrito();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [tiposProductos, setTiposProductos] = useState<Record<number, any[]>>({});
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategoriaId, setExpandedCategoriaId] = useState<number | null>(null); // Estado para móvil
  const [modalFavoritosOpen, setModalFavoritosOpen] = useState(false);
  const { favoritosCount } = useFavoritos();
  const [isBusquedaOpen, setIsBusquedaOpen] = useState(false);
  const [hayOfertas, setHayOfertas] = useState(false);
  const [marcasPaletas, setMarcasPaletas] = useState<any[]>([]);





  useEffect(() => {
    const fetchData = async () => {
      try {
        const { categorias, tiposProductos, marcasPaletas } = await getCategoriasYTipos();
        setCategorias(categorias);
        setTiposProductos(tiposProductos);
        setMarcasPaletas(marcasPaletas);

      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []);

  const handleMouseEnter = (categoriaId: number) => {
    if (closeTimeout) clearTimeout(closeTimeout);
    setDropdownOpen(categoriaId);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setDropdownOpen(null);
    }, 300);
    setCloseTimeout(timeout);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Función para expandir/colapsar categorías en móvil
  const toggleCategoriaMobile = (categoriaId: number) => {
    if (expandedCategoriaId === categoriaId) {
      setExpandedCategoriaId(null); // Colapsar si ya está expandida
    } else {
      setExpandedCategoriaId(categoriaId); // Expandir la categoría seleccionada
    }
  };

  const handleFavoritosClick = () => {
    setModalFavoritosOpen(true);
  };

  const handleCloseFavoritos = () => {
    setModalFavoritosOpen(false);
  };

  useEffect(() => {
    const verificarOfertas = async () => {
      const resultado = await hayOfertasActivas();
      console.log("¿Hay productos en oferta?", resultado); // 👈 Console agregado
      setHayOfertas(resultado);
    };

    verificarOfertas();
  }, []);




  return (
    <>
      {/* Header superior */}
      <div
        className="flex justify-between items-center shadow-md relative min-h-[147px] px-4"
        style={{ backgroundColor: "#0A1F44" }}
      >

        {/* Contenedor izquierdo */}
        <div className="flex items-center space-x-4 z-10">
          {/* Menú hamburguesa (solo en móvil) */}
          <div className="lg:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-500 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Lupa (solo en desktop) */}
          <div className="hidden lg:block">
            <button
              onClick={() => setIsBusquedaOpen(true)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-300 hover:shadow-lg hover:border-gray-400 transition-all"
            >
              <Search size={20} className="text-gray-600" />
              <span className="text-gray-600">Buscar productos...</span>
            </button>
          </div>


        </div>

        {/* Contenedor central - Logo  */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <Link href="/" className="font-teachers block text-xl font-bold">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="mx-auto h-20 w-auto"
            />
          </Link>
        </div>


        {/* Contenedor derecho */}
        <div className="flex items-center space-x-6 z-10">
          
          {/* Botón de favoritos */}
          <button
            onClick={handleFavoritosClick}
            className="relative p-2 text-gray-700 hover:text-red-600"
          >
            <Heart
              size={24}
              className={`transition-colors duration-200 ${
                favoritosCount > 0 ? "fill-red-500 text-red-500" : ""
              }`}
            />
            {favoritosCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {favoritosCount}
              </span>
            )}
          </button>

          {/* Carrito */}
          <button 
            className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
            onClick={onOpenCarrito}
          >
            🛒
            <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full px-2 text-xs font-semibold">
              {carritoCount}
            </span>
          </button>

          {/* Autenticación (solo en desktop) */}
          <div className="hidden lg:flex items-center">
            {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth user={user} />}
          </div>
        </div>

        {/* Modal de favoritos */}
        <Favorito isOpen={modalFavoritosOpen} onClose={handleCloseFavoritos} />
    
      </div>


      {/* Menú móvil (solo en móvil) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden shadow-md p-4"
          style={{ backgroundColor: "#e8d5bf" }}
        >

          {/* Lupa (solo en móvil) */}
          <div className="lg:hidden w-full mt-2 mb-2">
            <button
              onClick={() => setIsBusquedaOpen(true)}
              className="w-full flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-300 text-gray-600"
            >
              <Search size={20} className="text-gray-500" />
              <span className="text-gray-500 text-sm">Buscar productos...</span>
            </button>
          </div>



          <Link href="/" className="block text-lg font-bebas text-gray-700 hover:text-gray-500 transition-colors mb-2">
            Inicio
          </Link>

          {categorias.map((categoria) => (
            <div key={categoria.id} className="mb-2">
              {/* Categoría no clickeable en móvil, con flecha */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleCategoriaMobile(categoria.id)} // Expandir/colapsar al tocar
              >
                <span className="text-lg font-bebas text-gray-700">
                  {categoria.nombre}
                </span>
                <ChevronDown
                  size={20}
                  className={`transform transition-transform ${
                    expandedCategoriaId === categoria.id ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Tipos de productos (solo se muestra si la categoría está expandida) */}
              {expandedCategoriaId === categoria.id && (
                <div className="pl-4 mt-2">
                  {(categoria.nombre.toLowerCase() === "paletas" ? marcasPaletas : tiposProductos[categoria.id])?.map((item) => (
                    <Link
                      key={item.id}
                      href={
                        categoria.nombre.toLowerCase() === "paletas"
                          ? `/products-category/${categoria.id}/marca/${item.id}`
                          : `/products-category/${categoria.id}/tipo/${item.id}`
                      }
                      className="block py-1 text-gray-700 hover:bg-gray-100"
                    >
                      {item.nombre}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Autenticación al final del menú móvil */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth user={user} />}
          </div>
        </div>
      )}

      {/* Header inferior con categorías dinámicas (solo en desktop) */}
      <nav className="hidden lg:flex justify-center space-x-6 py-2 bg-gradient-to-r shadow-sm"
        style={{ backgroundColor: "#e6dfd6" }}
      >
        <Link href="/" className="text-2xl font-bebas font-normal text-gray-700 hover:text-gray-500 transition-colors">
          Inicio
        </Link>

        {categorias.map((categoria) => (
          <div 
            key={categoria.id} 
            className="relative"
            onMouseEnter={() => handleMouseEnter(categoria.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Categoría con subrayado */}
            <div className="flex items-center space-x-1 cursor-pointer group">
              <Link
                href={`/products-category/${categoria.id}`}
                className="text-2xl font-bebas text-gray-700 hover:text-gray-500 transition-colors relative after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gray-500 after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {categoria.nombre}
              </Link>
              {tiposProductos[categoria.id]?.length > 0}
            </div>

            {/* Dropdown con tipos de productos */}
            {dropdownOpen === categoria.id && (
              <div 
                className="absolute left-0 mt-1 bg-white shadow-lg rounded-lg w-48 z-50 border border-gray-300"
                onMouseEnter={() => handleMouseEnter(categoria.id)}
                onMouseLeave={handleMouseLeave}
                style={{ paddingTop: "10px", paddingBottom: "10px", pointerEvents: "auto" }}
              >
                {(categoria.nombre.toLowerCase() === "paletas" ? marcasPaletas : tiposProductos[categoria.id])?.map((item) => (
                  <Link
                    key={item.id}
                    href={
                      categoria.nombre.toLowerCase() === "paletas"
                        ? `/products-category/${categoria.id}/marca/${item.id}`
                        : `/products-category/${categoria.id}/tipo/${item.id}`
                    }
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    {item.nombre}
                  </Link>
                ))}

              </div>
            )}
          </div>
        ))}

        {/* OFERTA */}
        {typeof window !== "undefined" && hayOfertas && (
          <Link href="/ofertas" className="bg-red-500 text-white font-bold px-3 py-1 rounded shadow hover:bg-red-600 animate-pulse">
            ¡OFERTA!
          </Link>
        )}
      </nav>

      <Busqueda isOpen={isBusquedaOpen} onClose={() => setIsBusquedaOpen(false)} />

    </>
  );

};

