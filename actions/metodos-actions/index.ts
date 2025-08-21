// actions/metodos-actions/index.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Obtener todos los métodos de envío
export const fetchMetodos = async () => {
  const { data, error } = await supabase.from('metodos_envios').select('*');
  if (error) throw error;
  return data;
};

// Obtener un método por ID
export const getMetodoById = async (id: string) => {
  const { data, error } = await supabase
    .from('metodos_envios')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// Eliminar un método por ID
export const eliminarMetodo = async (id: string) => {
  const { error } = await supabase.from('metodos_envios').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Crear nuevo método
export const crearMetodo = async (nuevoMetodo: {
  empresa: string;
  peso_max: number;
  precio_nacional: number;
  precio_regional: number;
  imagen: string;
}) => {
  const { data, error } = await supabase.from('metodos_envios').insert(nuevoMetodo).single();
  if (error) throw error;
  return data;
};

// Guardar Edit
export const guardarEdit = async (id: string, datosActualizados: {
  empresa: string;
  peso_max: number;
  precio_nacional: number;
  precio_regional: number;
  imagen: string;
}) => {
  const { error } = await supabase
    .from('metodos_envios')
    .update(datosActualizados)
    .eq('id', id);

  if (error) throw error;
  return true;
};
