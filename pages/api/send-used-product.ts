import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const {
    nombre,
    precio,
    stock,
    descripcion,
    categoria_id,
    tipo_id,
    marca_id,
    color,
    peso,
    grupo_variantes,
    talles,
  } = req.body;

  // Validaciones básicas
  if (!nombre || !precio || !descripcion) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  try {
    // Configuración del transporter con Gmail (usar App Password si tenés 2FA)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // tu correo (ej: negocio@gmail.com)
        pass: process.env.GMAIL_PASSWORD, // tu contraseña o app password
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // acá recibís vos
      subject: `Nuevo producto usado para vender: ${nombre}`,
      html: `
        <h2>Detalles del producto usado</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Precio:</strong> $${precio}</p>
        <p><strong>Stock:</strong> ${stock || "-"}</p>
        <p><strong>Peso:</strong> ${peso || "-"}</p>
        <p><strong>Color:</strong> ${color || "-"}</p>
        <p><strong>Grupo Variantes:</strong> ${grupo_variantes || "-"}</p>
        <p><strong>Descripción:</strong> ${descripcion}</p>
        <p><strong>Categoría:</strong> ${categoria_id}</p>
        <p><strong>Tipo:</strong> ${tipo_id}</p>
        <p><strong>Marca:</strong> ${marca_id}</p>
        <p><strong>Talles:</strong> ${talles ? JSON.stringify(talles) : "-"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ message: "Error enviando el correo" });
  }
}
