import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { descontarStock } from '@/lib/descontarStock'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('Webhook recibido:', req.body);

      const { type, data } = req.body;
      const paymentId = data?.id;

      if (type === 'payment' && paymentId) {
        // Obtener detalles del pago desde Mercado Pago
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN}`,
          },
        });

        const paymentData = await response.json();
        console.log('Pago recibido desde Mercado Pago:', paymentData);

        if (paymentData.status === 'approved' || paymentData.status === 'success') {
          const externalReference = paymentData.external_reference;

          if (!externalReference) {
            console.error('❌ Error: No se encontró external_reference en el pago.');
            return res.status(400).json({ message: 'No se encontró external_reference en el pago.' });
          }

          // Buscar el pago en Supabase
          const { data: existingPayment, error: fetchError } = await supabase
            .from('pagos')
            .select('*')
            .eq('external_reference', externalReference)
            .single();

          if (fetchError || !existingPayment) {
            console.error('Error buscando el registro de pago:', fetchError);
            return res.status(404).json({ message: 'Registro de pago no encontrado.' });
          }

          // Evitar repetir el descuento si ya se actualizó stock
          if (!existingPayment.stock_actualizado) {
            try {
              const productos = JSON.parse(existingPayment.productos_comprados)

              // Adaptar formato para la función descontarStock
              const items = productos.map((item: any) => ({
                id: parseInt(item.id),
                cantidad: parseInt(item.cantidad),
                talle: item.talle || undefined
              }))

              await descontarStock(items)

              // Marcar como stock actualizado
              await supabase
                .from('pagos')
                .update({ stock_actualizado: true })
                .eq('id', existingPayment.id)

            } catch (error) {
              console.error('❌ Error procesando productos_comprados:', error)
            }
          } else {
            console.log('🟡 Stock ya fue actualizado para este pago.')
          }


          // Actualizar el estado del pago
          await supabase
            .from('pagos')
            .update({
              status: paymentData.status,
              id_transaccion: paymentId,
            })
            .eq('external_reference', externalReference);

          console.log(`✅ Pago aprobado para productos: ${existingPayment.producto_id}`);

          // Enviar correo
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASSWORD,
            },
          });

          const mailOptions = {
            from: process.env.GMAIL_USER,
            to: existingPayment.email_comprador,
            subject: `Pago aprobado en GiovannaShop!`,
            text: `
              Hola ${existingPayment.nombre_comprador},

              Tu pago ha sido aprobado con éxito. Aquí están los detalles:

              - Productos: ${existingPayment.producto_id}
              - Monto del pago: $${paymentData.transaction_amount}
              - Estado del pago: ${paymentData.status}

              Gracias por tu compra.
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log('📩 Correo de confirmación enviado correctamente.');
        } else {
          console.log('🟡 Estado de pago no aprobado:', paymentData.status);
        }
      }

      return res.status(200).json({ message: 'Webhook procesado correctamente.' });
    } catch (error) {
      console.error('Error procesando el webhook:', error);
      return res.status(500).json({ message: 'Error procesando el webhook.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
