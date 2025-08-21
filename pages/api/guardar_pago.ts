import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el servicio de correo que estés utilizando
  auth: {
    user: process.env.GMAIL_USER, // Tu correo electrónico (en este caso Gmail)
    pass: process.env.GMAIL_PASSWORD, // La contraseña o app password de tu correo
  },
});

// Función para enviar el correo
const sendEmail = async (demandaData: any, pagoData: any) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: pagoData.correo_pagador, // Correo del pagador
    subject: `Pago aprobado para la demanda de NesecitoEsto!`,
    text: `
      Hola ${pagoData.nombre_pagador},

      El pago para la demanda ${demandaData.detalle} ha sido aprobado con éxito. Aquí están los detalles:

      - Empresa: ${demandaData.empresa}
      - Responsable: ${demandaData.responsable_solicitud}
      - Teléfono: ${demandaData.telefono}
      - Rubro Demanda: ${demandaData.rubro_demanda}
      - Detalle de la demanda: ${demandaData.detalle}
      

      Detalles adicionales:
      - Monto del pago: $${pagoData.monto} USD
      - Estado del pago: ${pagoData.estado_pago}

      Gracias por usar nuestros servicios.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      demanda_id,
      detalle_demanda,
      nombre_pagador,
      correo_pagador,
      numero_pago,
      monto,
      fecha_pago,
      estado_pago,
      id_transaccion,
      moneda,
    } = req.body;

    try {
      // Guardar el pago en la base de datos
      const { data, error } = await supabase
        .from('pagos')
        .insert([
          {
            demanda_id,
            detalle_demanda,
            nombre_pagador,
            correo_pagador,
            numero_pago,
            monto,
            fecha_pago,
            estado_pago,
            metodo_pago: "PayPal", // Método fijo para PayPal
            id_transaccion,
            moneda,
          },
        ]);

      if (error) {
        console.error('Error al guardar el pago en Supabase:', error);
        return res.status(500).json({ message: 'Error al guardar el pago', error: error.message });
      }

      // Obtener los datos de la demanda (por ejemplo, desde la tabla "demandas")
      const { data: demandaData, error: demandaError } = await supabase
        .from('demandas')
        .select('*')
        .eq('id', demanda_id)
        .single();

      if (demandaError || !demandaData) {
        console.error('Error al obtener los datos de la demanda:', demandaError);
        return res.status(500).json({ message: 'Error al obtener los datos de la demanda.' });
      }

      // Enviar el correo con los detalles de la demanda y el pago
      await sendEmail(demandaData, {
        correo_pagador,
        nombre_pagador,
        monto,
        estado_pago,
      });

      return res.status(201).json({ message: 'Pago guardado con éxito', data });
    } catch (error) {
      console.error('Error al guardar el pago:', error);
      return res.status(500).json({ message: 'Error al guardar el pago' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
