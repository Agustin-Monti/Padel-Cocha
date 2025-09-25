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
    subject: "Tu pedido de Punto Padel LF ha sido enviado 📦✨",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
        <h2 style="color: #2e7d32;">¡Hola ${nombre}! 👋</h2>
        
        <p style="font-size: 16px;">
          ¡Buenas noticias! 🎉 Tu pedido ha sido <strong>enviado</strong>.  
          Aquí tienes la información de seguimiento:
        </p>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0; font-size: 16px;">
            <strong>📦 Número de Tracking:</strong> ${trackingNumber}
          </p>
          <p style="margin: 5px 0; font-size: 16px;">
            <strong>🏠 Dirección de entrega:</strong> ${direccion}
          </p>
        </div>

        <p style="font-size: 15px;">
          🔍 Puedes hacer seguimiento de tu pedido en la página de la empresa de envíos.
        </p>

        <br>

        <p style="font-size: 15px; text-align: center;">
          🙏 Muchas gracias por tu compra y por confiar en nosotros.  
          ¡Esperamos que disfrutes de tu producto! 💚
        </p>
      </div>
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

