'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { createClient } from '@/utils/supabase/client';
import Alerta from '@/components/alerta';
import { Eye, EyeOff } from 'lucide-react'; // Importamos los íconos de eye


type AlertType = 'success' | 'error' | 'info' | 'warning';

export default function Seguridad() {
  const supabase = createClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [alerta, setAlerta] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as AlertType
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.newPassword !== formData.confirmPassword) {
      setAlerta({
        visible: true,
        mensaje: 'Las contraseñas nuevas no coinciden',
        tipo: 'error'
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setAlerta({
        visible: true,
        mensaje: 'La contraseña debe tener al menos 6 caracteres',
        tipo: 'error'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('No se pudo obtener el usuario');

      // Reautenticación
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword
      });

      if (authError) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Actualización de contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setAlerta({
        visible: true,
        mensaje: 'Contraseña actualizada con éxito',
        tipo: 'success'
      });
      
      // Resetear el formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMostrarFormulario(false);
      
    } catch (error: unknown) {
      let errorMessage = 'Error al cambiar la contraseña';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      setAlerta({
        visible: true,
        mensaje: errorMessage,
        tipo: 'error'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800">Seguridad</h2>
      <p className="text-gray-600">Configurá tu contraseña o revisá la actividad de tu cuenta.</p>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <p className="font-medium">Cambio de contraseña</p>
          {!mostrarFormulario ? (
            <button 
              onClick={() => setMostrarFormulario(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Cambiar contraseña
            </button>
          ) : (
            <button 
              onClick={() => setMostrarFormulario(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          )}
        </div>

        {mostrarFormulario && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Campo Contraseña actual */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña actual
              </label>
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute top-[38px] right-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Campo Nueva contraseña */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute top-[38px] right-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Campo Confirmar contraseña */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute top-[38px] right-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md shadow transition"
              >
                Actualizar contraseña
              </button>
            </div>
          </form>

        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="font-medium mb-4">Ver actividad reciente</p>
        <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">
          Mostrar actividad → Proximamente...
        </button>
      </div>
      
      <Alerta
        mensaje={alerta.mensaje}
        visible={alerta.visible}
        onClose={() => setAlerta({ ...alerta, visible: false })}
      />
    </div>
  );
}