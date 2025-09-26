import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { nombre, color, descripcion, propietario, telefono, email, imagen  } = req.body;

  // Validaciones básicas
  if (!nombre || !descripcion || !propietario || !telefono || !email) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  try {
    // Configuración del transporter con Gmail (usar App Password si tenés 2FA activado)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Nuevo producto usado: ${nombre}`,
      html: `
        <h2>Detalles del producto usado</h2>
        <p><strong>Nombre del producto:</strong> ${nombre}</p>
        <p><strong>Color:</strong> ${color || "-"}</p>
        <p><strong>Descripción:</strong> ${descripcion}</p>
        <hr/>
        <h3>Datos del propietario</h3>
        <p><strong>Nombre:</strong> ${propietario}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr/>
        <p>Se adjunta la imagen del producto.</p>
      `,
      attachments: imagen
        ? [
            {
              filename: `producto-usado-${Date.now()}.jpg`,
              content: imagen.split("base64,")[1], // quitar el encabezado "data:image/jpeg;base64,"
              encoding: "base64",
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ message: "Error enviando el correo" });
  }
}
