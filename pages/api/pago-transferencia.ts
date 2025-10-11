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

// 🔥 FUNCIÓN PARA GENERAR ID DE TRANSACCIÓN ÚNICO
function generarIdTransaccion(): string {
  const timestamp = Date.now().toString(36); // Ej: "kf9z3m"
  const random = Math.random().toString(36).substr(2, 5); // Ej: "x7k9a"
  return `TRF-${timestamp}-${random}`.toUpperCase();
}

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
        metodo_empresa,
        total,
        productos_comprados,
        banco,
        numero_operacion,
      } = fields;

      // Validación de campos obligatorios
      const totalStr = Array.isArray(total) ? total[0] : total;
      if (!totalStr) return res.status(400).json({ error: 'Falta el campo total.' });

      // Obtener costo_envio (puede ser 0 para envío gratis)
      const metodoEnvioStr = Array.isArray(metodo_envio) ? metodo_envio[0] : metodo_envio;
      const metodoEnvio = metodoEnvioStr ? parseFloat(metodoEnvioStr) : 0;
      
      const metodoEmpresa = Array.isArray(metodo_empresa) ? metodo_empresa[0] : metodo_empresa || 'Desconocido';

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

      // 🔥 GENERAR ID DE TRANSACCIÓN ANTES DE CREAR EL PAGO
      const idTransaccion = generarIdTransaccion();
      console.log('🆔 ID Transacción generado:', idTransaccion);

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

      // Crear pago - INCLUIR id_transaccion EN EL INSERT
      const pagoData = {
        nombre_comprador: Array.isArray(nombre) ? nombre[0] : nombre,
        apellido_comprador: Array.isArray(apellido) ? apellido[0] : apellido,
        telefono: Array.isArray(telefono) ? telefono[0] : telefono,
        dni: Array.isArray(dni) ? dni[0] : dni,
        direccion: Array.isArray(direccion) ? direccion[0] : direccion,
        metodo_envio: metodoEnvio,
        metodo_empresa: metodoEmpresa,
        total: parseFloat(totalStr),
        email_comprador: Array.isArray(email) ? email[0] : email,
        productos_comprados: JSON.stringify(productosFinal),
        producto_id: productoIds.map(String),
        status: 'pendiente',
        estado_pedido: 'En Proceso',
        metodo_pago: 'Transferencia Bancaria',
        id_transaccion: idTransaccion, // ← AGREGAR EL ID DE TRANSACCIÓN AQUÍ
      };

      console.log('🟢 Datos a insertar en pagos:', pagoData);
      console.log('🚚 Detalles envío:', {
        empresa: pagoData.metodo_empresa,
        costo: pagoData.metodo_envio,
        total: pagoData.total
      });

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
      console.log('✅ ID Transacción asignado:', idTransaccion);
      console.log("🛒 Items a descontar stock:", productosFinal);

      // ✅ Descontar stock
      try {
        const items = productosFinal.map((p: any) => ({
          id: parseInt(p.id),
          cantidad: parseInt(p.cantidad),
          talle: Array.isArray(p.talle) ? p.talle[0] : p.talle || undefined,
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

      // ✅ Enviar correo de confirmación - INCLUIR EL ID DE TRANSACCIÓN
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });

        const productosNombres = productosFinal
          .map((p: any) => `<li>${p.nombre} (x${p.cantidad}) ${p.talle ? `- Talle: ${p.talle}` : ''}</li>`)
          .join('');

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: pagoData.email_comprador,
          subject: 'Pago por Transferencia Aprobado en Punto Padel LF!',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
              <h2>Hola ${pagoData.nombre_comprador},</h2>
              <p>Tu pago por transferencia ha sido aprobado con éxito ✅</p>

              <h3>📋 Detalles de la transacción:</h3>
              <p><strong>ID de Transacción:</strong> ${idTransaccion}</p>
              
              <h3>🛒 Productos comprados:</h3>
              <ul>
                ${productosNombres}
              </ul>

              <h3>🚚 Detalles de envío:</h3>
              <p><strong>Empresa:</strong> ${pagoData.metodo_empresa}</p>
              <p><strong>Costo de envío:</strong> $${pagoData.metodo_envio.toLocaleString()}</p>
              
              <p><strong>💵 Total pagado:</strong> $${pagoData.total.toLocaleString()}</p>
              <p><strong>📦 Estado del pedido:</strong> En Proceso</p>

              <p><em>💡 <strong>Guarda este ID de transacción para cualquier consulta:</strong> ${idTransaccion}</em></p>

              <p>Tu pedido está en proceso. Cuando los productos estén listos, recibirás otro correo con la confirmación de envío.</p>

              <p>Gracias por tu compra en <strong>Punto Padel LF</strong>!</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('📩 Correo enviado correctamente.');
      } catch (error) {
        console.error('❌ Error enviando el correo:', error);
      }

      return res.status(200).json({ 
        message: 'Transferencia registrada correctamente',
        id_transaccion: idTransaccion 
      });
    } catch (error) {
      console.error('❌ Error en el flujo de transferencia:', error);
      return res.status(500).json({ error: 'Error al procesar el pago por transferencia' });
    }
  });
}
