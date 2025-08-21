import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { descontarStock } from '@/lib/descontarStock';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error al parsear el formulario:', err);
      return res.status(500).json({ error: 'Error al procesar el formulario' });
    }

    try {
      const {
        nombre,
        apellido,
        email,
        telefono,
        dni,
        direccion,
        metodo_envio,
        total,
        productos_comprados,
        banco,
        numero_operacion,
      } = fields;

      // Validación de campos obligatorios
      const totalStr = Array.isArray(total) ? total[0] : total;
      if (!totalStr) return res.status(400).json({ error: 'Falta el campo total.' });

      const productosRaw = fields.productos_comprados;
      const productosStr = Array.isArray(productosRaw) ? productosRaw[0] : productosRaw;

      if (!productosStr) {
        return res.status(400).json({ error: 'El campo productos_comprados es obligatorio.' });
      }

      let productosFinal: any[] = [];
      let productoIds: number[] = [];

      try {
        productosFinal = JSON.parse(productosStr);
        productoIds = productosFinal.map((p: any) => p.id);
      } catch (err) {
        return res.status(400).json({ error: 'El campo productos_comprados no contiene un JSON válido.' });
      }

      // Archivo del comprobante
      const archivo = Array.isArray(files.comprobante)
        ? files.comprobante[0]
        : files.comprobante;

      if (!archivo || !archivo.filepath) {
        return res.status(400).json({ error: 'Comprobante faltante o inválido' });
      }

      // Subida del archivo a Supabase Storage
      const buffer = fs.readFileSync(archivo.filepath);
      const filename = `${Date.now()}_${archivo.originalFilename}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(filename, buffer, {
          contentType: archivo.mimetype || 'application/octet-stream',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(filename);

      const urlComprobante = urlData.publicUrl;

      // Crear pago
      const pagoData = {
        nombre_comprador: Array.isArray(nombre) ? nombre[0] : nombre,
        apellido_comprador: Array.isArray(apellido) ? apellido[0] : apellido,
        telefono: Array.isArray(telefono) ? telefono[0] : telefono,
        dni: Array.isArray(dni) ? dni[0] : dni,
        direccion: Array.isArray(direccion) ? direccion[0] : direccion,
        metodo_envio: Array.isArray(metodo_envio) ? metodo_envio[0] : metodo_envio,
        total: parseFloat(totalStr),
        email_comprador: Array.isArray(email) ? email[0] : email,
        productos_comprados: JSON.stringify(productosFinal),
        producto_id: productoIds.map(String), // convierte [16, 17] → ["16", "17"]
        status: 'pendiente',
        estado_pedido: 'En Proceso',
        metodo_pago: 'Transferencia Bancaria',
      };

      console.log('🟢 Datos a insertar en pagos:', pagoData);

      const { data: pagoInsertado, error: pagoError } = await supabase
        .from('pagos')
        .insert([pagoData])
        .select('id')
        .single();

      if (pagoError || !pagoInsertado?.id) throw pagoError;

      const pagoId = pagoInsertado.id;

      // Crear comprobante
      const comprobanteData = {
        pago_id: pagoId,
        nombre_completo: `${pagoData.nombre_comprador} ${pagoData.apellido_comprador}`,
        email: pagoData.email_comprador,
        monto: pagoData.total,
        banco: Array.isArray(banco) ? banco[0] : banco || '',
        numero_operacion: Array.isArray(numero_operacion) ? numero_operacion[0] : numero_operacion || '',
        url_comprobante: urlComprobante,
      };

      console.log('🟢 Datos a insertar en comprobantes_transferencia:', comprobanteData);

      const { data: comprobanteInsertado, error: comprobanteError } = await supabase
        .from('comprobantes_transferencia')
        .insert([comprobanteData])
        .select('id')
        .single();

      if (comprobanteError || !comprobanteInsertado?.id) throw comprobanteError;

      const comprobanteId = comprobanteInsertado.id;

      // Relacionar el pago con el comprobante
      const { error: updateError } = await supabase
        .from('pagos')
        .update({ comprobante_transferencia_id: comprobanteId })
        .eq('id', pagoId);

      if (updateError) throw updateError;

      console.log('✅ Comprobante vinculado con éxito al pago.');
      console.log("🛒 Items a descontar stock:", productosFinal);

      // ✅ Descontar stock
      try {
        const items = productosFinal.map((p: any) => ({
          id: parseInt(p.id),
          cantidad: parseInt(p.cantidad),
          talle: Array.isArray(p.talle) ? p.talle[0] : p.talle || undefined, // Fuerza a string
        }));

        console.log("🛒 Items procesados para descontar stock:", items);

        await descontarStock(items);

        // Marcar como stock actualizado
        await supabase
          .from('pagos')
          .update({ stock_actualizado: true })
          .eq('id', pagoId);

        console.log('✅ Stock descontado correctamente.');
      } catch (error) {
        console.error('❌ Error descontando stock:', error);
      }

      // ✅ Enviar correo de confirmación
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: pagoData.email_comprador,
          subject: 'Pago por transferencia aprobado en GiovannaShop!',
          text: `
            Hola ${pagoData.nombre_comprador},

            Tu pago por transferencia ha sido aprobado con éxito.

            - Productos: ${pagoData.producto_id}
            - Monto del pago: $${pagoData.total}
            - Estado del pago: aprobado

            Gracias por tu compra.
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('📩 Correo enviado correctamente.');
      } catch (error) {
        console.error('❌ Error enviando el correo:', error);
      }

      return res.status(200).json({ message: 'Transferencia registrada correctamente' });
    } catch (error) {
      console.error('❌ Error en el flujo de transferencia:', error);
      return res.status(500).json({ error: 'Error al procesar el pago por transferencia' });
    }
  });
}
