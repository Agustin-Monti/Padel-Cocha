import React, { useState, useEffect } from 'react';
import { guardarEdit, getCategorias, getTipos, getMarcas } from '@/actions/productos-actions';
import { createClient } from "@/utils/supabase/client";
import FormularioPaleta from "@/components/formularios/FormularioPaleta";
import FormularioIndumentaria from "@/components/formularios/FormularioIndumentaria";
import FormularioBolsos from "@/components/formularios/FormularioBolsos";
import FormularioAccesorios from "@/components/formularios/FormularioAccesorios";
import FormularioZapatillas from "@/components/formularios/FormularioZapatillas";

export type Producto = {
  id: string;
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
        material: productoDetalles.material  || "",
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
    formData.append("id", producto.id);
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
    if (producto.material ) formData.append("material", producto.material );
    // if (producto.marcaIndumentaria) formData.append("marcaIndumentaria", producto.marcaIndumentaria);
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[800px] max-w-[100%] h-[800px] flex flex-col overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-black">Editar Producto</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Campos generales */}
          <div>
            <label className="block text-sm font-medium text-black">Nombre</label>
            <input name="nombre" value={producto.nombre} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Precio</label>
            <input name="precio" type="number" value={producto.precio} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Stock</label>
            <input name="stock" type="number" value={producto.stock} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Peso</label>
            <input name="peso" type="number" step="0.01" value={producto.peso} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Grupo de Variantes</label>
            <input name="grupo_variantes" value={producto.grupo_variantes} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Color</label>
            <input name="color" value={producto.color} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Categoría</label>
            <select name="categoria_id" value={producto.categoria_id} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="" disabled>Selecciona una categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Tipo</label>
            <select name="tipo_id" value={producto.tipo_id} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="" disabled>Selecciona un tipo</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Marca</label>
            <select name="marca_id" value={producto.marca_id} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="" disabled>Selecciona un tipo</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-black">Imagen del Producto</label>
            <div className="flex items-center gap-4 mt-2">
              <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
                Cambiar Imagen
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {previewImagen && <img src={previewImagen} alt="Vista previa" className="h-24 w-24 rounded object-cover" />}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-black">Descripción</label>
            <textarea name="descripcion" rows={4} value={producto.descripcion} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Describe el producto..." />
          </div>
        </div>

        {/* Formularios condicionales */}
        <div className="mt-4">
          {nombreCategoria === "paletas" && <FormularioPaleta product={producto} onChange={handleChange} />}

          {nombreCategoria === "indumentaria" && (
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
          )}

          {nombreCategoria === "zapatillas" && (
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
          )}

          {nombreCategoria === "bolsos" && <FormularioBolsos product={producto} onChange={handleChange} />}
          {nombreCategoria === "accesorios" && <FormularioAccesorios product={producto} onChange={handleChange} />}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded m-1">Cancelar</button>
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded m-1">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default EditarProducto;
