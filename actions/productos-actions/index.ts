"use server";

import { createClient } from "@/utils/supabase/server";
import fs from 'fs';
import path from 'path';

// actions/productos-actions/index.ts

export const createProductAction = async (producto: {
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  categoria_id: number;
  tipo_id: number;
  grupo_variantes: string;
  color: string;
  peso: number;
  descripcion: string;
  estado: string;
  marca_id?: number;
  forma?: string;
  balance?: string;
  marco?: string;
  nucleo?: string;
  acabado?: string;
  potencia?: number;
  control?: number;
  juego?: string;

  // Nuevos campos para indumentaria
  material?: string;
  genero?: string;
  talle?: string; // JSON string con stock por talle
  origen?: string;
  modelo?: string;

  // Nuevos campos para bolsos
  medidas?: string;
  capacidad?: string;

  // Nuevos campos para accesorios
  ancho?: string;
  largo?: string;
  textura?: string;
}) => {
  const supabase = createClient();

  

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user:', userError);
    return false;
  }

  const {
    nombre, precio, stock, imagen, categoria_id, tipo_id, grupo_variantes, color, peso, descripcion, estado,
    marca_id, forma, balance, marco, nucleo, acabado, potencia, control, juego,
    material, genero, talle, origen, modelo, medidas, ancho, largo, textura, capacidad,
  } = producto;

  

  const { data, error: productoError } = await supabase.from("productos").insert([{
    nombre,
    precio,
    stock,
    imagen,
    categoria_id,
    tipo_id,
    grupo_variantes,
    color,
    peso,
    descripcion,
    estado,
    marca_id,
    forma,
    balance,
    marco,
    nucleo,
    acabado,
    potencia,
    control,
    juego,

    // 👕 Campos de indumentaria
    material,
    genero,
    talle,
    origen,
    modelo,
    medidas,
    capacidad,

    // 👕 Campos de accesorios
    ancho,
    largo,
    textura
  }]);

  if (productoError) {
    console.error("❌ Error al insertar producto:", productoError.code + " " + productoError.message);
    console.error("🔍 Detalles del error:", productoError);
    return false;
  }

  console.log("✅ Producto insertado correctamente:", data);
  return true;
};


export const fetchProductos = async () => {
  const supabase = createClient();
  
  // Primero, obtener los productos
  const { data: productos, error: productosError } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (productosError) {
    console.error('Error al obtener productos:', productosError);
    return [];
  }

  // Obtener las imágenes de la galería asociadas a los productos
  const { data: imagenes, error: imagenesError } = await supabase
    .from('galeria_productos')
    .select('producto_id, imagen_galeria');

  if (imagenesError) {
    console.error('Error al obtener imágenes de la galería:', imagenesError);
    return [];
  }

  // Asociar las imágenes a cada producto
  const productosConGaleria = productos.map((producto) => {
    // Filtrar las imágenes correspondientes a este producto
    const imagenesProducto = imagenes
      .filter((imagen) => imagen.producto_id === producto.id)
      .map((imagen) => imagen.imagen_galeria);

    return {
      ...producto,
      galeria: imagenesProducto, // Añadir la galería de imágenes al producto
    };
  });

  return productosConGaleria;
};


export async function getProductoById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single();
  
    if (error) {
      console.error("Error fetching productos:", error);
      return null;
    }
  
    return data;
}

export async function getDetallesProductoById(id: string) {
    const supabase = createClient();
    // Obtener el producto actual
    const producto = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

    if (producto.error) {
        return null;
    }

    console.log("DETALLES DEL PRODUCTO:", producto.data);

    // Obtener las variantes de color (productos con el mismo grupo_variantes)
    const variantes = await supabase
      .from('productos')
      .select('id, nombre, imagen, color') // ✅ AÑADIDO color
      .eq('grupo_variantes', producto.data.grupo_variantes);


    // Obtener la galería de imágenes del producto actual
    const galeria = await supabase
        .from('galeria_productos')
        .select('imagen_galeria')
        .eq('producto_id', id);

    // Formatear las rutas de las imágenes de la galería
    const galeriaConRutas = galeria.data?.map(img => ({
      imagen_galeria: img.imagen_galeria // ✅ dejar sin `/`
    })) || [];

    return {
        ...producto.data,
        galeria: galeriaConRutas,
        variantes: variantes.data || [], // Devolver las variantes de color
    };
}


export const guardarValorado = async (productoId: string, valorado: boolean) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('productos')
      .update({ valorado })
      .eq('id', productoId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error al actualizar valorado:', error);
    throw new Error('No se pudo actualizar el campo valorado');
  }
};


// Guardar Edit


export async function guardarEdit(e: FormData) {
  console.log("Inicio de guardarEdit");

  const supabase = createClient();

  const producto = {
    id: e.get("id") as string,
    nombre: e.get("nombre") as string,
    precio: e.get("precio") as string,
    stock: e.get("stock") as string,
    grupo_variantes: e.get("grupo_variantes") as string,
    color: e.get("color") as string,
    categoria_id: e.get("categoria_id") as string,
    tipo_id: e.get("tipo_id") as string,
    marca_id: e.get("marca_id") as string,
    imagen: e.get("url") as string | null, // <- ahora recibís la URL ya subida
    peso: e.get("peso") as string,           // 👈 nuevo
    descripcion: e.get("descripcion") as string, // 👈 nuevo
    estado: e.get("estado") as string, // 👈 nuevo
    modelo: e.get("modelo") as string | null,
    origen: e.get("origen") as string | null,
    material: e.get("material") as string | null,
    // marcaIndumentaria: e.get("marcaIndumentaria") as string | null,
    talles: e.get("talle") as string | null,

    medidas: e.get("medidas") as string | null,
    capacidad: e.get("capacidad") as string | null,
    textura: e.get("textura") as string | null,
    ancho: e.get("ancho") as string | null,
    largo: e.get("largo") as string | null,

  };

  console.log("Datos del producto recibidos:", producto);

  // Actualizar el producto
  console.log("Actualizando producto en la base de datos...");

  const { error: updateError } = await supabase
    .from("productos")
    .update({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      grupo_variantes: producto.grupo_variantes,
      color: producto.color,
      categoria_id: producto.categoria_id,
      tipo_id: producto.tipo_id,
      marca_id: producto.marca_id,
      ...(producto.imagen && { imagen: producto.imagen }), // solo si hay imagen nueva
      peso: producto.peso,               // 👈 nuevo
      descripcion: producto.descripcion, // 👈 nuevo
      estado: producto.estado, // 👈 nuevo
      modelo: producto.modelo,
      origen: producto.origen,
      material: producto.material,
      // marcaIndumentaria: producto.marcaIndumentaria,
      talle: producto.talles, // Ojo, se llama `talles` en el objeto, pero lo guardás en `talle` en Supabase

      medidas: producto.medidas,
      capacidad: producto.capacidad,
      textura: producto.textura,
      ancho: producto.ancho,
      largo: producto.largo,
    })
    .eq("id", producto.id);

  if (updateError) {
    console.error("Error al actualizar el producto:", updateError.message);
    return false;
  }

  console.log("Producto actualizado con éxito");
  return true;
}


// Guardar Edit

// actions/productos-actions/index.ts
export async function eliminarProductoById(productoId: string | number): Promise<boolean> {
  console.log('🔨 eliminarProductoById llamado con:', productoId);
  
  try {
    // Convertir a string
    const idString = String(productoId).trim();
    
    // Usar localhost directamente para evitar problemas
    const baseUrl = 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/eliminar-producto-id`;
    
    console.log('🌐 Llamando a:', apiUrl);
    console.log('📤 Enviando:', { productoId: idString });

    // Hacer la solicitud
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productoId: idString }),
    });

    console.log('📡 Status:', response.status);
    console.log('📡 OK?', response.ok);

    // Leer como texto primero
    const responseText = await response.text();
    console.log('📦 Respuesta texto:', responseText);

    // Si la respuesta está vacía
    if (!responseText) {
      console.error('❌ Respuesta vacía del servidor');
      throw new Error('El servidor respondió con una respuesta vacía');
    }

    // Intentar parsear JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📦 JSON parseado:', data);
    } catch (jsonError) {
      console.error('❌ Error parseando JSON:', jsonError);
      console.error('❌ Texto recibido:', responseText);
      
      // Si es un error 500, podría ser HTML
      if (response.status >= 500) {
        throw new Error('Error interno del servidor (500)');
      }
      
      throw new Error('Respuesta inválida del servidor');
    }

    // Verificar éxito
    if (!response.ok || data.success === false) {
      throw new Error(data?.error || 'Error al eliminar producto');
    }

    console.log('✅ Producto eliminado exitosamente');
    return true;
    
  } catch (error: any) {
    console.error('❌ Error en eliminarProductoById:', error.message);
    throw error;
  }
}


// Galeria

export const obtenerImagenesProducto = async (productoId: string) => {
  const supabase = createClient();

  try {
    const { data: imagenes, error } = await supabase
      .from('galeria_productos')
      .select('imagen_galeria')
      .eq('producto_id', productoId);

    if (error) {
      console.error('Error al obtener imágenes del producto:', error);
      return [];
    }

    return imagenes.map((imagen) => imagen.imagen_galeria);
  } catch (error) {
    console.error('Error en obtenerImagenesProducto:', error);
    return [];
  }
};


export const eliminarImagenGaleria = async (productoId: string, imagenUrl: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL; // o tu URL en producción

  const response = await fetch(`${baseUrl}/api/eliminar_imagenes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productoId, imagenUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || 'Error al eliminar imagen');
  }

  return true;
};




// Galeria




export const getCategorias = async () => {
  const supabase = createClient();

  // Obtener las categorías
  const { data: categorias, error: categoriasError } = await supabase
    .from('categorias')
    .select('id, nombre, imagen')
    .order('nombre', { ascending: true });

  if (categoriasError) {
    console.error('Error al obtener categorías:', categoriasError);
    return [];
  }

  return categorias;
};


export const getTipos = async () => {
  const supabase = createClient();

  const { data: tipos, error: tiposError } = await supabase
    .from('tipo_productos')
    .select('id, nombre')  
    .order('nombre', { ascending: true });

  if (tiposError) {
    console.error('Error al obtener tipos:', tiposError);
    return [];
  }

  return tipos;  
};



export const getMarcas = async () => {
  const supabase = createClient();

  const { data: marcas, error: marcasError } = await supabase
    .from('marcas')
    .select('id, nombre')  
    .order('nombre', { ascending: true });

  if (marcasError) {
    console.error('Error al obtener marcas:', marcasError);
    return [];
  }

  return marcas;  
};

export const getProductos = async () => {
  const supabase = createClient();

  // Obtener los productos
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*');
    

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }

  return productos || [];
};


export const getProductosValorados = async () => {
  const supabase = createClient();

  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .eq('valorado', true)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener productos valorados:', error);
    return [];
  }

  return productos || [];
};


export const guardarOferta = async (productoId: string, oferta: { oferta_activa: boolean; precio_oferta: number }) => {
  const supabase = createClient();

  try {
    // Realizar un UPDATE en la tabla productos donde el productoId coincida
    const { data, error } = await supabase
      .from('productos')
      .update({
        oferta_activa: oferta.oferta_activa, // Actualizar el campo de oferta activa
        precio_oferta: oferta.precio_oferta, // Actualizar el campo de precio de oferta
      })
      .eq('id', productoId); // Condición para que solo se actualice el producto con el id especificado

    if (error) {
      throw error;
    }

    // Si la actualización fue exitosa, retornamos los datos actualizados (opcional)
    return data;
  } catch (error) {
    console.error('Error al actualizar la oferta:', error);
    throw new Error('No se pudo actualizar la oferta');
  }
};


// app/productos/[id]/page.tsx

export async function getProductosRelacionados(categoriaId: number, tipoId: number, productoId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, imagen, precio, oferta_activa, precio_oferta')
    .or(`categoria_id.eq.${categoriaId},tipo_id.eq.${tipoId}`)
    .neq('id', productoId)
    .limit(10);

  if (error) {
    console.error('Error buscando productos relacionados:', error);
    return [];
  }

  return data;
}


// components/Busqueda


export const buscarProductosPorNombre = async (
  nombre: string,
  page = 1,
  limit = 6
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createClient();
  const { data, error, count } = await supabase
    .from("productos")
    .select("*", { count: "exact" })
    .ilike("nombre", `%${nombre}%`)
    .range(from, to)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error buscando productos:", error.message);
    return { data: [], total: 0 };
  }

  return { data, total: count ?? 0 };
};

// components/Busqueda



// Función para obtener productos por categoría y estado
export const getProductosPorCategoriaYEstado = async (
  categoriaId: string,
  estado: string
) => {
  const supabase = createClient();

  try {
    console.log(`🔍 Buscando productos: categoriaId=${categoriaId}, estado=${estado}`);
    const { data, error } = await supabase
      .from("productos")
      .select(`
        *,
        categorias (
          id,
          nombre
        ),
        marcas (
          id,
          nombre
        ),
        tipo_productos  (
          id,
          nombre
        )
      `)
      .eq("categoria_id", parseInt(categoriaId))
      .eq("estado", estado)
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error al obtener productos por categoría y estado:", error);
      return [];
    }

    // Transformar los datos para mantener consistencia con otras funciones
    const productosTransformados = data.map((producto) => ({
      id: producto.id.toString(),
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      tipo_id: producto.tipo_id.toString(),
      color: producto.color,
      estado: producto.estado,
      oferta_activa: producto.oferta_activa || false,
      precio_oferta: producto.precio_oferta || producto.precio,
      // Incluir datos relacionados si se necesitan
      categoria_nombre: producto.categorias?.nombre,
      marca_nombre: producto.marcas?.nombre,
      tipo_nombre: producto.tipos?.nombre,
    }));

    console.log(`📊 Productos encontrados para categoría ${categoriaId} y estado ${estado}:`, productosTransformados.length);
    return productosTransformados;

  } catch (error) {
    console.error("Error en getProductosPorCategoriaYEstado:", error);
    return [];
  }
};

// Función para obtener todos los estados únicos disponibles
export const getEstados = async (): Promise<Array<{ id: number; nombre: string; valor: string }>> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("productos")
      .select("estado")
      .not("estado", "is", null)  // Filtrar valores nulos
      .order("estado", { ascending: true });

    if (error) {
      console.error("Error al obtener estados:", error);
      return [];
    }

    // Obtener valores únicos y transformar
    const estadosUnicos = [...new Set(data.map(item => item.estado))];
    
    // Crear un array con estructura similar a marcas/tipos
    const estadosTransformados = estadosUnicos.map((estado, index) => ({
      id: index + 1,
      nombre: estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase(),
      valor: estado.toLowerCase(),
    }));

    console.log("📝 Estados disponibles encontrados:", estadosTransformados);
    return estadosTransformados;

  } catch (error) {
    console.error("Error en getEstados:", error);
    return [];
  }
};

// Opcional: Función para obtener estados filtrados por categoría (si quieres mostrar solo estados de una categoría específica)
export const getEstadosPorCategoria = async (categoriaId: number): Promise<Array<{ id: number; nombre: string; valor: string }>> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("productos")
      .select("estado")
      .eq("categoria_id", categoriaId)
      .not("estado", "is", null)
      .order("estado", { ascending: true });

    if (error) {
      console.error("Error al obtener estados por categoría:", error);
      return [];
    }

    // Obtener valores únicos y transformar
    const estadosUnicos = [...new Set(data.map(item => item.estado))];
    
    const estadosTransformados = estadosUnicos.map((estado, index) => ({
      id: index + 1,
      nombre: estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase(),
      valor: estado.toLowerCase(),
    }));

    console.log(`📝 Estados para categoría ${categoriaId}:`, estadosTransformados);
    return estadosTransformados;

  } catch (error) {
    console.error("Error en getEstadosPorCategoria:", error);
    return [];
  }
};



 



