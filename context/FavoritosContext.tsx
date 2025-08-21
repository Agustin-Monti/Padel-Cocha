"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface FavoritoItem {
  id: string;
  producto: {
    id: string; // Asegúrate de que este campo exista
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
  removeFavorito: (favoritoId: string) => Promise<void>;
  esFavorito: (productoId: string) => boolean;
  verificarFavorito: (productoId: string) => Promise<void>;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export const FavoritosProvider = ({ children }: { children: React.ReactNode }) => {
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchFavoritos = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Usuario no autenticado o error:", userError);
      setFavoritos([]);
      setLoading(false);
      return;
    }

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
        producto: Array.isArray(item.productos) ? item.productos[0] : item.productos
      }));
      setFavoritos(favoritosData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFavoritos();
  }, []);

  const addFavorito = async (productoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("favoritos").insert({
      user_id: user.id,
      producto_id: productoId,
    });

    if (error) {
      console.error("Error al agregar favorito:", error);
      return;
    }

    await fetchFavoritos();
  };

  const removeFavorito = async (productoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log("📦 Intentando eliminar favorito con productoId:", productoId);
    console.log("🧠 Lista de favoritos actuales:", favoritos);

    // Buscar el favorito actual del producto
    const favorito = favoritos.find(
      (item) => item.producto && item.producto.id === productoId
    );

    if (!favorito) {
      console.warn("⚠️ No se encontró el favorito para eliminar.");
      return;
    }

    console.log("✅ Favorito encontrado para eliminar:", favorito);

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("id", favorito.id); // Aquí usamos el UUID correcto

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
    // También puedes agregar lógica para hacer algo con `esFavorito(productoId)`
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
        verificarFavorito 
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
