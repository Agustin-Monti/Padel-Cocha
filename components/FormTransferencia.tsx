'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalCargando from './ModalCargando';
import { useCarrito } from '@/context/CarritoContext';


interface Props {
  formData: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    email: string;
    empresaEnvio: string;
  };
  total: number;
  productos: string; // puedes pasar JSON.stringify(carrito) o resumen
}

export default function FormTransferencia({ formData, total, productos }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { vaciarCarrito } = useCarrito();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje('📎 Subí el comprobante antes de continuar.');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const data = new FormData();

      // 1. Primero parsea los productos para incluir el talle
      const productosCarrito = JSON.parse(productos); // Parsea el string JSON a array
      const productosConTalles = productosCarrito.map((producto: any) => ({
        ...producto,
        talle: producto.talle || undefined 
      }));

      // 2. Campos personales (sin cambios)
      data.append('nombre', formData.nombre);
      data.append('apellido', formData.apellido);
      data.append('dni', formData.dni);
      data.append('telefono', formData.telefono);
      data.append('email', formData.email);
      data.append('direccion', `${formData.direccion}, ${formData.ciudad}, ${formData.provincia}`);
      data.append('codigo_postal', formData.codigoPostal);
      data.append('metodo_envio', formData.empresaEnvio || 'Desconocido');
      data.append('total', total.toString());

      // 3. Ahora usa productosConTalles (con talle incluido)
      data.append('productos_comprados', JSON.stringify(productosConTalles)); // Vuelve a stringify

      // Campos opcionales
      data.append('banco', '');
      data.append('numero_operacion', '');
      data.append('comprobante', archivo);

      // Debug: Verifica los datos antes de enviar
      console.log("📦 Productos a enviar:", productosConTalles);

      const response = await fetch('/api/pago-transferencia', {
        method: 'POST',
        body: data,
      });

      const resJson = await response.json();

      if (!response.ok) throw new Error(resJson.error || 'Error inesperado');

      await vaciarCarrito();

      router.push('/success');
    } catch (error: any) {
      console.error(error);
      setMensaje('❌ Hubo un error al enviar el comprobante.');
    } finally {
      setCargando(false);
    }
  };


  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-4 mt-6 border border-gray-300 rounded-lg space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-800">💸 Transferencia Bancaria</h3>

      <p className="text-sm text-gray-700">
        Transferí el total a la cuenta y subí el comprobante para confirmar tu pedido.
      </p>

      <div className="bg-white border p-3 rounded text-sm text-gray-800 space-y-1">
        <p><strong>CBU:</strong> 0000003100092710000001</p>
        <p><strong>Alias:</strong> tienda.padel.mp</p>
        <p><strong>Banco:</strong> Banco Nación</p>
        <p><strong>Titular:</strong> Agustin Monti</p>
        <p><strong>Monto:</strong> ${total.toLocaleString()}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adjuntar comprobante (imagen o PDF)
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          className="block w-full border border-gray-300 rounded p-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        {cargando ? 'Enviando...' : 'Enviar comprobante'}
      </button>

      {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
    </form>

    {/* 👇 Modal de cargando */}
    <ModalCargando abierto={cargando} mensaje="Procesando pago..." />
    </>
  );
}
