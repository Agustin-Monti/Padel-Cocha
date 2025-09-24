"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface CarritoItem {
  id: string; // ID del item en la base de datos
  producto: {
    id: string;
    nombre: string;
    precio: number;
    peso: number;
    precio_oferta?: number;
    oferta_activa?: boolean;
    imagen: string;
  } | null;
  cantidad: number;
  talle: string;
}

interface CarritoContextType {
  carrito: CarritoItem[];
  setCarrito: React.Dispatch<React.SetStateAction<CarritoItem[]>>;
  carritoCount: number;
  setCarritoCount: React.Dispatch<React.SetStateAction<number>>;
  fetchCarrito: () => Promise<void>;
  eliminarItem: (id: string) => Promise<void>;
  actualizarCantidad: (id: string, cantidad: number) => Promise<void>;
  carritoModificado: boolean;
  setCarritoModificado: React.Dispatch<React.SetStateAction<boolean>>;
  total: number;
  vaciarCarrito: () => Promise<void>;
}


const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: React.ReactNode }) => {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [carritoCount, setCarritoCount] = useState(0);
  const [carritoModificado, setCarritoModificado] = useState(false);


  const supabase = createClient();

  const fetchCarrito = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
    .from('carrito')
    .select(`
      id,
      cantidad,
      talle,
      productos!inner(id, nombre, precio, imagen, peso, precio_oferta, oferta_activa)
    `)
    .eq('user_id', user.id);


    if (error) {
      console.error('Error obteniendo carrito:', error);
      return;
    }

    const carritoData: CarritoItem[] = data.map(item => ({
      id: item.id,
      cantidad: item.cantidad,
      talle: item.talle,
      producto: Array.isArray(item.productos) ? item.productos[0] : item.productos
    }));

    setCarrito(carritoData);
    setCarritoCount(carritoData.length);
  };

  const eliminarItem = async (id: string) => {
    const { error } = await supabase.from('carrito').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando item:', error);
    } else {
      const actualizado = carrito.filter(item => item.id !== id);
      setCarrito(actualizado);
      setCarritoCount(actualizado.length);
      setCarritoModificado(prev => !prev);

    }
  };

  const actualizarCantidad = async (id: string, cantidad: number) => {
    if (cantidad < 1) return;

    const { error } = await supabase
      .from('carrito')
      .update({ cantidad })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando cantidad:', error);
    } else {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad } : item));
      setCarritoModificado(prev => !prev);

    }
  };

  const vaciarCarrito = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('carrito').delete().eq('user_id', user.id);
      if (error) {
        console.error('Error al vaciar carrito:', error);
        return;
      }

      // vaciamos estado local
      setCarrito([]);
      setCarritoCount(0);
      setCarritoModificado(prev => !prev);
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    }
  };

  const total = carrito.reduce((acc, item) => {
    const precioUnitario =
      item.producto?.oferta_activa && item.producto?.precio_oferta
        ? item.producto.precio_oferta
        : item.producto?.precio || 0;
    return acc + precioUnitario * item.cantidad;
  }, 0);


  return (
    <CarritoContext.Provider value={{
      carrito,
      setCarrito,
      carritoCount,
      setCarritoCount,
      fetchCarrito,
      eliminarItem,
      actualizarCantidad,
      total,
      carritoModificado,        // 👈 NUEVO
      setCarritoModificado,     // 👈 NUEVO
      vaciarCarrito
    }}>
      {children}
    </CarritoContext.Provider>
  );
};


export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return context;
};
