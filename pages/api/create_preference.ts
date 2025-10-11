import { NextApiRequest, NextApiResponse } from 'next';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({
    accessToken: process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN!,
});

const baseUrl = "https://2e3d27179d20.ngrok-free.app/";

// Configuración de Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// El middleware de CORS solo se puede usar dentro de una función handler de Next.js.
const corsMiddleware = cors();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Aplica CORS
    await new Promise((resolve, reject) => {
        corsMiddleware(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            resolve(result);
        });
    });

    if (req.method === 'POST') {
        try {

          
            const { carrito, total, payer, shipments } = req.body;

            if (!carrito || !payer || !payer.email || !payer.name) {
                return res.status(400).json({ error: "Faltan datos requeridos." });
            }


            const externalReference = "pedido_" + new Date().getTime();

            const backUrls = {
                success: `${baseUrl}success?status=success&email=${payer.email}&nombre=${payer.name}&total=${total}&external_reference=${externalReference}`,
                failure: `${baseUrl}failure?status=failure`,
                pending: `${baseUrl}pending?status=pending`,
            };
            

            const body = {
                items: carrito.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    currency_id: "ARS",
                    picture_url: item.picture_url,
                })),
                payer: {
                    name: payer.name,
                    surname: payer.surname,
                    email: payer.email,
                    phone: payer.phone,
                    identification: payer.identification,
                    address: payer.address,
                },
                shipments: {
                    cost: shipments.cost,
                },
                payment_methods: {
                    installments: 6, // 👈 hasta 6 cuotas
                },
                back_urls: backUrls,
                auto_return: "approved",
                external_reference: externalReference, // Referencia única del pedido
            };

            console.log('Cuerpo de la solicitud:', body); // Agrega este log

            // ✅ Crear la preferencia en Mercado Pago
            const preference = new Preference(client);
            const result = await preference.create({ body });


            console.log("✅ preference_id obtenido:", result.id);

            // ✅ Actualizar `back_urls.success` con el preference_id real
            const updatedBackUrls = {
                ...backUrls,
                success: `${baseUrl}success?status=success&email=${payer.email}&nombre=${payer.name}&total=${total}&preference_id=${result.id}`,
            };

            console.log("✅ URL de éxito actualizada:", updatedBackUrls.success);


            // ✅ Guardar en Supabase
            // En create_preference.ts - Corrige el insert en Supabase
            const { error: supabaseError } = await supabase.from("pagos").insert({
                productos_comprados: JSON.stringify(
                    carrito.map((item: any) => ({
                        id: item.id,
                        nombre: item.title,
                        cantidad: item.quantity,
                        precio_unitario: item.unit_price,
                        talle: item.talle || null,
                    }))
                ),
                producto_id: carrito.map((item: any) => item.id), // ✅ Ahora es array, no string
                nombre_comprador: payer.name,
                apellido_comprador: payer.surname || '', // ✅ Asegura que no sea null
                email_comprador: payer.email,
                telefono: payer.phone?.number || '', // ✅ Maneja posible undefined
                dni: payer.identification?.number || '', // ✅ Maneja posible undefined
                direccion: `${payer.address?.street_name || ''}, ${payer.address?.zip_code || ''}`,
                metodo_envio: shipments.cost.toString(),
                metodo_empresa: shipments.empresa,
                total: total,
                preference_id: result.id,
                external_reference: externalReference,
                status: "pendiente",
                estado_pedido: "En Proceso",
                metodo_pago: "Mercado Pago",
            });


            if (supabaseError) {
                console.error("Error de Supabase:", supabaseError);
                throw new Error("Error al guardar el pago en la base de datos");
            }

            res.json({
                id: result.id,
            });
        } catch (error) {
            console.error('Error al crear la preferencia:', error);
            const errorDetails = "Error desconocido";
            res.status(500).json({
                error: "Error al crear la preferencia :(",
                details: errorDetails,
            });
        }
    } else {
        // Manejar métodos HTTP no permitidos
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
