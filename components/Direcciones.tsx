'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Alerta from '@/components/alerta';

type Direccion = {
  id: string;
  direccion: string;
  piso: string | null;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  creada_el: string;
};

type AlertType = 'success' | 'error' | 'info' | 'warning';

export default function Direcciones() {
  const supabase = createClient();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [alerta, setAlerta] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as AlertType
  });

  const [formData, setFormData] = useState({
    direccion: '',
    piso: '',
    codigo_postal: '',
    ciudad: '',
    provincia: ''
  });

  const fetchDirecciones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('direcciones')
        .select('*')
        .eq('user_id', user.id)
        .order('creada_el', { ascending: false });

      if (error) throw error;

      setDirecciones(data || []);
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      setAlerta({
        visible: true,
        mensaje: 'Error al cargar las direcciones',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirecciones();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('direcciones').insert({
      user_id: user.id,
      direccion: formData.direccion,
      piso: formData.piso || null,
      codigo_postal: formData.codigo_postal,
      ciudad: formData.ciudad,
      provincia: formData.provincia
    });

    if (error) {
      setAlerta({
        visible: true,
        mensaje: 'Error al guardar la dirección',
        tipo: 'error'
      });
      return;
    }

    setAlerta({
      visible: true,
      mensaje: 'Dirección guardada con éxito',
      tipo: 'success'
    });

    await fetchDirecciones();
    setMostrarFormulario(false);
    setFormData({
      direccion: '',
      piso: '',
      codigo_postal: '',
      ciudad: '',
      provincia: ''
    });
  };

  const handleEliminar = async (id: string) => {
    const { error } = await supabase.from('direcciones').delete().eq('id', id);

    if (error) {
      setAlerta({
        visible: true,
        mensaje: 'Error al eliminar la dirección',
        tipo: 'error'
      });
      return;
    }

    setAlerta({
      visible: true,
      mensaje: 'Dirección eliminada con éxito',
      tipo: 'success'
    });

    setDirecciones(direcciones.filter((d) => d.id !== id));
  };

  if (loading) return <p className="text-gray-500">Cargando direcciones...</p>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800">Direcciones</h2>
      <p className="text-gray-600">Gestioná tus direcciones de envío o facturación.</p>

      <Alerta
        mensaje={alerta.mensaje}
        visible={alerta.visible}
        onClose={() => setAlerta({ ...alerta, visible: false })}
      />

      {!mostrarFormulario ? (
        <div className="space-y-4">
          {direcciones.length > 0 ? (
            direcciones.map((direccion) => (
              <div key={direccion.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {direccion.direccion}
                      {direccion.piso && `, Piso ${direccion.piso}`}
                    </p>
                    <p className="text-gray-700">{direccion.ciudad}, {direccion.provincia}</p>
                    <p className="text-gray-700">CP: {direccion.codigo_postal}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Agregada el {new Date(direccion.creada_el).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEliminar(direccion.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-700 mb-4">Aún no tenés direcciones registradas.</p>
            </div>
          )}

          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Agregar nueva dirección
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Agregar nueva dirección</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección*</label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                value={formData.direccion}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="piso" className="block text-sm font-medium text-gray-700 mb-1">Piso/Departamento (opcional)</label>
              <input
                id="piso"
                name="piso"
                type="text"
                value={formData.piso}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="codigo_postal" className="block text-sm font-medium text-gray-700 mb-1">Código Postal*</label>
                <input
                  id="codigo_postal"
                  name="codigo_postal"
                  type="text"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">Ciudad*</label>
                <input
                  id="ciudad"
                  name="ciudad"
                  type="text"
                  value={formData.ciudad}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="provincia" className="block text-sm font-medium text-gray-700 mb-1">Provincia*</label>
              <input
                id="provincia"
                name="provincia"
                type="text"
                value={formData.provincia}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Guardar dirección
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
