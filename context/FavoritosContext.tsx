"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface FavoritoItem {
  id: string;
  producto: {
    id: string;
    nombre: string;
    precio: number;
    imagen: string;
    precio_oferta?: number;
    oferta_activa?: boolean;
  } | null;
}

interface FavoritosContextType {
  favoritos: FavoritoItem[];
  setFavoritos: React.Dispatch<React.SetStateAction<FavoritoItem[]>>;
  favoritosCount: number;
  loading: boolean;
  addFavorito: (productoId: string) => Promise<void>;
  removeFavorito: (productoId: string) => Promise<void>;
  esFavorito: (productoId: string) => boolean;
  verificarFavorito: (productoId: string) => Promise<void>;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export const FavoritosProvider = ({ children }: { children: React.ReactNode }) => {
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchFavoritos = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // si no hay sesión → usuario invitado
    if (sessionError || !session) {
      setFavoritos([]);
      setLoading(false);
      return;
    }

    const user = session.user;

    const { data, error } = await supabase
      .from("favoritos")
      .select(`
        id,
        productos!inner(id, nombre, precio, imagen, oferta_activa, precio_oferta)
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error al obtener favoritos:", error);
    } else {
      const favoritosData: FavoritoItem[] = data.map((item: any) => ({
        id: item.id,
        producto: Array.isArray(item.productos) ? item.productos[0] : item.productos,
      }));
      setFavoritos(favoritosData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFavoritos();
  }, []);

  const addFavorito = async (productoId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("favoritos").insert({
      user_id: session.user.id,
      producto_id: productoId,
    });

    if (error) {
      console.error("Error al agregar favorito:", error);
      return;
    }

    await fetchFavoritos();
  };

  const removeFavorito = async (productoId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Buscar el favorito actual del producto
    const favorito = favoritos.find(
      (item) => item.producto && item.producto.id === productoId
    );

    if (!favorito) {
      console.warn("⚠️ No se encontró el favorito para eliminar.");
      return;
    }

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("id", favorito.id);

    if (error) {
      console.error("❌ Error al eliminar favorito:", error);
      return;
    }

    await fetchFavoritos();
  };

  const esFavorito = (productoId: string): boolean => {
    return favoritos.some((item) => item.producto && item.producto.id === productoId);
  };

  const verificarFavorito = async (productoId: string): Promise<void> => {
    await fetchFavoritos();
    // Podrías hacer algo extra acá con esFavorito(productoId)
  };

  return (
    <FavoritosContext.Provider
      value={{
        favoritos,
        setFavoritos,
        favoritosCount: favoritos.length,
        loading,
        addFavorito,
        removeFavorito,
        esFavorito,
        verificarFavorito,
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
};

export const useFavoritos = () => {
  const context = useContext(FavoritosContext);
  if (!context) throw new Error("useFavoritos debe usarse dentro de FavoritosProvider");
  return context;
};
