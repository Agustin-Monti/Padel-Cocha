'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Alerta from '@/components/alerta';

export default function DatosPerfil() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [alertaVisible, setAlertaVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    created_at: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nombre, apellido, dni, telefono, created_at')
          .eq('id', user.id)
          .single();

        // Formatear la fecha a formato latinoamericano (DD/MM/AAAA)
        const fechaCreacion = profile?.created_at ? new Date(profile.created_at) : new Date();
        const fechaFormateada = `${fechaCreacion.getDate()}/${fechaCreacion.getMonth() + 1}/${fechaCreacion.getFullYear()}`;

        setFormData({
          nombre: profile?.nombre || '',
          apellido: profile?.apellido || '',
          dni: profile?.dni || '',
          telefono: profile?.telefono || '',
          email: user.email || '',
          created_at: fechaFormateada
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        telefono: formData.telefono
      })
      .eq('id', user.id);

    if (!error) {
      setAlertaVisible(true);
    }
  };

  if (loading) return <p className="text-gray-500">Cargando datos...</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto px-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">DNI</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-md cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de creación</label>
            <input
              type="text"
              value={formData.created_at}
              disabled
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-md cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200"
          >
            Guardar cambios
          </button>
        </div>
      </form>


      <Alerta
        mensaje="¡Datos actualizados con éxito!"
        visible={alertaVisible}
        onClose={() => setAlertaVisible(false)}
      />
    </>
  );
}