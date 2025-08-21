import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📩 API recibida en /api/send-tracking');

  if (req.method !== 'POST') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Método no permitido' });
  }

  console.log('✅ Método correcto (POST)');

  const { email, nombre, trackingNumber, direccion } = req.body;
  console.log('📨 Datos recibidos:', { email, nombre, trackingNumber, direccion });

  if (!email || !trackingNumber) {
    console.warn('❌ Faltan datos:', { email, trackingNumber });
    return res.status(400).json({ message: 'Faltan datos' });
  }

  console.log('✅ Datos completos, preparando el email...');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  console.log('✅ Transporter creado con usuario:', process.env.GMAIL_USER);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Tu pedido ha sido enviado 📦',
    html: `
      <h2>¡Hola ${nombre}!</h2>
      <p>Tu pedido ha sido enviado. Aquí tienes la información de seguimiento:</p>
      <p><strong>Número de Tracking:</strong> ${trackingNumber}</p>
      <p><strong>Dirección de entrega:</strong> ${direccion}</p>
      <p>Puedes hacer seguimiento de tu pedido en la página de la empresa de envíos.</p>
      <br>
      <p>Gracias por tu compra.</p>
    `,
  };

  try {
    console.log('📤 Enviando email a:', email);
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado correctamente');
    res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error('❌ Error enviando el correo:', error);
    res.status(500).json({ message: 'Error enviando el correo', error });
  }
}
