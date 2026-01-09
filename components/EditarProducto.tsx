import React, { useState, useEffect } from 'react';
import { guardarEdit, getCategorias, getTipos, getMarcas } from '@/actions/productos-actions';
import { createClient } from "@/utils/supabase/client";
import FormularioPaleta from "@/components/formularios/FormularioPaleta";
import FormularioIndumentaria from "@/components/formularios/FormularioIndumentaria";
import FormularioBolsos from "@/components/formularios/FormularioBolsos";
import FormularioAccesorios from "@/components/formularios/FormularioAccesorios";
import FormularioZapatillas from "@/components/formularios/FormularioZapatillas";
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

export type Producto = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  grupo_variantes: string;
  color: string;
  categoria_id: string;
  tipo_id: string;
  marca_id: string;
  peso: string;
  descripcion: string;
  // Campos específicos indumentaria
  modelo?: string;
  origen?: string;
  material?: string;
  marcaIndumentaria?: string;
  talles?: Record<string, number>;
  // Campos específicos bolsos
  medidas?: string;
  capacidad?: string;
  textura?: string;
  ancho?: string;
  largo?: string;
};

interface Categoria {
  id: string;
  nombre: string;
}

interface Tipo {
  id: string;
  nombre: string;
}

interface Marca {
  id: string;
  nombre: string;
}

interface EditarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  productoId: string | null;
  productoDetalles: Producto | null;
  onSave: (producto: Producto) => Promise<void>;
}

const EditarProducto: React.FC<EditarProductoProps> = ({
  isOpen,
  onClose,
  productoId,
  productoDetalles,
  onSave,
}) => {
  const [producto, setProducto] = useState<Producto | null>(productoDetalles);
  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  useEffect(() => {
    if (productoDetalles) {
      setProducto({
        ...productoDetalles,
        modelo: productoDetalles.modelo || "",
        origen: productoDetalles.origen || "",
        material: productoDetalles.material || "",
        marcaIndumentaria: productoDetalles.marcaIndumentaria || "",
        talles:
          typeof (productoDetalles as any).talle === "string"
            ? JSON.parse((productoDetalles as any).talle)
            : (productoDetalles as any).talle || {},
        medidas: productoDetalles.medidas || "",
        capacidad: productoDetalles.capacidad || "",
        textura: productoDetalles.textura || "",
        ancho: productoDetalles.ancho || "",
        largo: productoDetalles.largo || "",
      });

      setPreviewImagen(productoDetalles.imagen);
    }
  }, [productoDetalles]);

  useEffect(() => {
    const fetchCategorias = async () => {
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);
    };

    const fetchTipos = async () => {
      const tiposData = await getTipos();
      setTipos(tiposData);
    };

    const fetchMarcas = async () => {
      const marcasData = await getMarcas();
      setMarcas(marcasData);
    };

    fetchTipos();
    fetchCategorias();
    fetchMarcas();
  }, []);

  const handleChange = (e: React.ChangeEvent<any>) => {
    if (producto) {
      setProducto({
        ...producto,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNuevaImagen(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImagen(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!producto) return;

    const supabase = createClient();
    let imageUrl = producto.imagen;

    if (nuevaImagen && nuevaImagen.name) {
      const file = nuevaImagen;
      const fileName = `${Date.now()}_${file.name}`;
      const pathToUpload = `productos/${fileName}`;

      if (producto.imagen?.includes("/storage/v1/object/public/productos/")) {
        const partes = producto.imagen.split("/storage/v1/object/public/productos/");
        const rutaAEliminar = partes[1];

        const response = await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: rutaAEliminar }),
        });

        const result = await response.json();
        if (!response.ok) {
          console.warn("No se pudo eliminar imagen anterior:", result.message);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("productos")
        .upload(pathToUpload, file);

      if (uploadError) {
        alert("Error al subir imagen: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("productos")
        .getPublicUrl(pathToUpload);

      imageUrl = urlData.publicUrl;
    }

    const formData = new FormData();
    formData.append("id", producto.id.toString());
    formData.append("nombre", producto.nombre);
    formData.append("precio", producto.precio.toString());
    formData.append("stock", producto.stock.toString());
    formData.append("grupo_variantes", producto.grupo_variantes);
    formData.append("color", producto.color);
    formData.append("categoria_id", producto.categoria_id);
    formData.append("tipo_id", producto.tipo_id);
    formData.append("marca_id", producto.marca_id);
    formData.append("url", imageUrl);
    formData.append("peso", producto.peso);
    formData.append("descripcion", producto.descripcion);
    if (producto.modelo) formData.append("modelo", producto.modelo);
    if (producto.origen) formData.append("origen", producto.origen);
    if (producto.material) formData.append("material", producto.material);
    if (producto.medidas) formData.append("medidas", producto.medidas);
    if (producto.capacidad) formData.append("capacidad", producto.capacidad);
    if (producto.textura) formData.append("textura", producto.textura);
    if (producto.ancho) formData.append("ancho", producto.ancho);
    if (producto.largo) formData.append("largo", producto.largo);
    if (producto.talles) {
      formData.append("talle", JSON.stringify(producto.talles));
    }

    const result = await guardarEdit(formData);

    if (result) {
      setNuevaImagen(null);
      onSave(producto);
      onClose();
    } else {
      alert("Hubo un error al guardar el producto");
    }
  };

  if (!isOpen || !producto) return null;

  const categoriaSeleccionada = categorias.find(cat => cat.id === producto?.categoria_id);
  const nombreCategoria = categoriaSeleccionada?.nombre.toLowerCase();

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-2xl w-[1400px] max-w-[98vw] h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Producto</h2>
            <p className="text-gray-600 text-sm mt-1">
              ID: {producto.id} | {producto.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Cerrar"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Contenido principal - Dos columnas */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Columna izquierda - Datos generales */}
            <div className="w-2/5 border-r border-gray-200 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Sección de imagen */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <PhotoIcon className="h-5 w-5" />
                    Imagen del Producto
                  </h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-64 h-64 bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center">
                      {previewImagen ? (
                        <img
                          src={previewImagen}
                          alt="Vista previa"
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">Sin imagen</p>
                        </div>
                      )}
                    </div>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg cursor-pointer transition-colors font-medium shadow-md">
                      Cambiar Imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Información básica */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        name="nombre"
                        value={producto.nombre}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($) *</label>
                        <input
                          name="precio"
                          type="number"
                          step="0.01"
                          value={producto.precio}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                        <input
                          name="stock"
                          type="number"
                          value={producto.stock}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Descripción MÁS GRANDE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        rows={8} 
                        value={producto.descripcion}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y min-h-[150px]"
                        placeholder="Describe el producto..."
                        style={{ 
                          resize: 'vertical',
                          minHeight: '150px',
                          maxHeight: '300px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles adicionales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles Adicionales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                      <input
                        name="peso"
                        type="number"
                        step="0.01"
                        value={producto.peso}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input
                        name="color"
                        value={producto.color}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Variantes</label>
                      <input
                        name="grupo_variantes"
                        value={producto.grupo_variantes}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Categorización */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Categorización</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                      <select
                        name="categoria_id"
                        value={producto.categoria_id}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                      >
                        <option value="" disabled>Selecciona una categoría</option>
                        {categorias.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                        <select
                          name="tipo_id"
                          value={producto.tipo_id}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                        >
                          <option value="" disabled>Selecciona un tipo</option>
                          {tipos.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                        <select
                          name="marca_id"
                          value={producto.marca_id}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                        >
                          <option value="" disabled>Selecciona una marca</option>
                          {marcas.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Formularios condicionales (MÁS ANCHA) */}
            <div className="w-3/5 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-1">
                        {categoriaSeleccionada?.nombre || 'Categoría'}
                      </h3>
                      <p className="text-blue-700">
                        Configura los detalles específicos para {categoriaSeleccionada?.nombre?.toLowerCase() || 'esta categoría'}
                      </p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Específico
                    </div>
                  </div>
                </div>

                {/* Formularios condicionales */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  {nombreCategoria === "paletas" && (
                    <div className="space-y-6">
                      <FormularioPaleta product={producto} onChange={handleChange} />
                    </div>
                  )}

                  {nombreCategoria === "indumentaria" && (
                    <div className="space-y-6">
                      <FormularioIndumentaria
                        product={producto}
                        onChange={handleChange}
                        onChangeTalle={(talle: string, cantidad: number) => {
                          if (!producto) return;

                          const nuevosTalles = { ...(producto.talles || {}), [talle]: cantidad };
                          const nuevoStock = Object.values(nuevosTalles).reduce(
                            (acc, val) => acc + val,
                            0
                          );

                          setProducto({ ...producto, talles: nuevosTalles, stock: nuevoStock });
                        }}
                      />
                    </div>
                  )}

                  {nombreCategoria === "zapatillas" && (
                    <div className="space-y-6">
                      <FormularioZapatillas
                        product={producto}
                        onChange={handleChange}
                        onChangeTalle={(talle: string, cantidad: number) => {
                          if (!producto) return;

                          const nuevosTalles = { ...(producto.talles || {}), [talle]: cantidad };
                          const nuevoStock = Object.values(nuevosTalles).reduce(
                            (acc, val) => acc + val,
                            0
                          );

                          setProducto({ ...producto, talles: nuevosTalles, stock: nuevoStock });
                        }}
                      />
                    </div>
                  )}

                  {nombreCategoria === "bolsos" && (
                    <div className="space-y-6">
                      <FormularioBolsos product={producto} onChange={handleChange} />
                    </div>
                  )}

                  {nombreCategoria === "accesorios" && (
                    <div className="space-y-6">
                      <FormularioAccesorios product={producto} onChange={handleChange} />
                    </div>
                  )}

                  {/* Mensaje si no hay formulario específico */}
                  {!nombreCategoria && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-700">Selecciona una categoría</p>
                      <p className="text-gray-600 mt-2">
                        Elige una categoría en el panel izquierdo para ver los detalles específicos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 flex items-center gap-4">
              <span className="font-medium">ID: {producto.id}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-blue-700 text-white transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProducto;
