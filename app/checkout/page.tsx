'use client';

import { useState, useEffect } from 'react';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';
import { useCarrito } from "@/context/CarritoContext";
import Image from 'next/image';
import FormTransferencia from '@/components/FormTransferencia';
import AlertaStockPago from '@/components/AlertaStockPago';


interface CarritoItem {
    id: string;
    cantidad: number;
    producto_id: string; // ID del producto
    producto: {
        id:string;
        nombre: string;
        precio: number;
        imagen: string;
        peso: number;
        precio_oferta?: number;
        oferta_activa?: boolean;
    } | null;
}

interface TarifaEnvio {
    empresa: string;
    precio: number;
    imagen: string;
}

export default function CheckoutPage() {
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [isCreatingPreference, setIsCreatingPreference] = useState(false);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);
    const [activeTab, setActiveTab] = useState('informacion');
    const [pesoTotal, setPesoTotal] = useState(0);
    const [esRegional, setEsRegional] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState('');
    const [tarifasEnvio, setTarifasEnvio] = useState<TarifaEnvio[]>([]);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        direccion: '',
        piso: '',
        codigoPostal: '',
        ciudad: '',
        provincia: '',
        telefono: '',
        email: '',
        aceptarTerminos: false,
        guardarInformacion: false,
        envio: 0,
        empresaEnvio: '',
    });

    const { carrito, carritoModificado, fetchCarrito } = useCarrito();

    const subtotal = carrito.reduce((acc, item) => {
        const precioUnitario =
            item.producto?.oferta_activa && item.producto?.precio_oferta
            ? item.producto.precio_oferta
            : item.producto?.precio || 0;
        return acc + precioUnitario * item.cantidad;
    }, 0);

    const total = subtotal + formData.envio; // Suma el costo de envío al subtotal
    const [direccionGuardada, setDireccionGuardada] = useState<any[]>([]);
    const [agregarNueva, setAgregarNueva] = useState(false);

    const resumenProductos = carrito.map((item) => ({
        id: item.producto?.id || '', // ← este es el id correcto del producto
        nombre: item.producto?.nombre || '',
        cantidad: item.cantidad,
        precio_unitario:
            item.producto?.oferta_activa && item.producto?.precio_oferta
            ? item.producto.precio_oferta
            : item.producto?.precio || 0,
            talle: item.talle
        }
    ));



    const supabase = createClient();

    useEffect(() => {

        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string;
        if (publicKey) {
        initMercadoPago(publicKey, {
            locale: 'es-AR',
        });
        }

        // const fetchUserAndCarrito = async () => {
        //     const { data: { user } } = await supabase.auth.getUser();
        //     if (user) {
        //         setFormData((prevData) => ({
        //             ...prevData,
        //             email: user.email || '',
        //         }));

        //         const { data, error } = await supabase
        //             .from('carrito')
        //             .select(`id, cantidad, producto_id, productos!inner(id, nombre, precio, imagen, peso, precio_oferta, oferta_activa)`)
        //             .eq('user_id', user.id);

        //         if (error) {
        //             console.error('Error obteniendo el carrito:', error);
        //             return;
        //         }

        //         const carritoData: CarritoItem[] = data.map(item => ({
        //             id: item.id,
        //             cantidad: item.cantidad,
        //             producto_id: item.producto_id, // ID del producto
        //             producto: Array.isArray(item.productos) ? item.productos[0] : item.productos,
        //         }));

        //         setCarrito(carritoData);

        //         const totalCalculado = carritoData.reduce((acc, item) => {
        //             if (!item.producto) return acc;
        //             const precioUnitario =
        //                 item.producto.oferta_activa && typeof item.producto.precio_oferta === 'number'
        //                 ? item.producto.precio_oferta
        //                 : item.producto.precio;
        //             return acc + precioUnitario * item.cantidad;
        //         }, 0);


        //     }
        // };

        // fetchUserAndCarrito();
    }, [supabase.auth]);

    useEffect(() => {
        setPesoTotal(carrito.reduce((total, item) => total + ((item.producto?.peso || 0) * item.cantidad) / 1000, 0));
    }, [carrito]);

    useEffect(() => {
        const verificarProvincia = async () => {
            if (!formData.codigoPostal) return;
            const provincia = await obtenerProvinciaNominatim(formData.codigoPostal);
            setEsRegional(provincia === "Entre Ríos");
        };
        verificarProvincia();
    }, [formData.codigoPostal]);
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    useEffect(() => {
        const calcularEnvio = async () => {
            if (pesoTotal === 0) {
            console.log("🔸 Peso total es 0, no se calcula envío.");
            return;
            }

            console.log("📦 Peso total (kg):", pesoTotal);
            console.log("🌎 ¿Es regional (Entre Ríos)?", esRegional);

            const { data: tarifas, error } = await supabase
            .from("metodos_envios")
            .select("*")
            .gte("peso_max", pesoTotal)
            .order("precio_nacional", { ascending: true });

            if (error) {
            console.error("❌ Error al obtener tarifas:", error);
            setTarifasEnvio([]);
            return;
            }

            if (tarifas && tarifas.length > 0) {
                console.log("✅ Tarifas encontradas:", tarifas);

                // Agrupar por empresa y tomar la tarifa con menor peso_max que cumpla
                const tarifasFiltradas: { [empresa: string]: any } = {};

                for (const tarifa of tarifas) {
                    const empresa = tarifa.empresa;

                    // Si no hay ninguna guardada aún o la actual tiene menor peso_max, reemplazala
                    if (
                    !tarifasFiltradas[empresa] ||
                    tarifa.peso_max < tarifasFiltradas[empresa].peso_max
                    ) {
                    tarifasFiltradas[empresa] = tarifa;
                    }
                }

                const tarifasProcesadas = Object.values(tarifasFiltradas).map((tarifa: any) => {
                    const precioSeleccionado = esRegional
                    ? tarifa.precio_regional
                    : tarifa.precio_nacional;

                    console.log(
                    `🚚 Empresa: ${tarifa.empresa} | Tipo: ${esRegional ? 'Regional' : 'Nacional'} | Precio aplicado: $${precioSeleccionado}`
                    );

                    return {
                    empresa: tarifa.empresa,
                    precio: precioSeleccionado,
                    imagen: tarifa.imagen,
                    };
                });

                setTarifasEnvio(tarifasProcesadas);
                } else {
                    console.warn("⚠️ No se encontraron tarifas para este peso.");
                    setTarifasEnvio([]);
                }
        };

        calcularEnvio();
    }, [pesoTotal, esRegional]); // 👈 importante que 'esRegional' esté en dependencias



    const obtenerProvinciaNominatim = async (codigoPostal: string): Promise<string> => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&country=Argentina&postalcode=${codigoPostal}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.length > 0) {
            const displayName = data[0].display_name.toLowerCase();
            console.log("📍 display_name recibido:", displayName);

            const departamentosEntreRios = [
                "concordia",
                "colón",
                "diamante",
                "federación",
                "feliciano",
                "gualeguay",
                "gualeguaychú",
                "islas del ibicuy",
                "la paz",
                "nogoyá",
                "paraná",
                "san salvador",
                "tala",
                "uruguay",
                "villaguay",
                "victoria"
            ];

            const esEntreRios = departamentosEntreRios.some((dpto) =>
                displayName.includes(dpto)
            );

            return esEntreRios ? "Entre Ríos" : "Nacional";
            }

            return "Nacional";
        } catch (error) {
            console.error("❌ Error al obtener la provincia:", error);
            return "Nacional";
        }
    };

    

    const handleFinalizarCompra = async () => {
        try {
            setIsCreatingPreference(true);

            // 🔹 Armar payload filtrando productos nulos
            const carritoConProductos = carrito.filter((item) => item.producto !== null);

           

            const payload = {
                carrito: carritoConProductos.map((item) => {
                    const producto = item.producto!;
                    const esOferta = producto.oferta_activa && producto.precio_oferta;
                    const precioFinal = esOferta ? producto.precio_oferta : producto.precio;

                    return {
                    id: item.producto?.id || '',
                    title: producto.nombre,
                    quantity: item.cantidad,
                    unit_price: precioFinal,
                    currency_id: "ARS",
                    picture_url: producto.imagen,
                    talle: item.talle || null,
                    };
                }),
                total,
                payer: {
                    name: formData.nombre,
                    surname: formData.apellido,
                    email: formData.email,
                    phone: { number: formData.telefono },
                    identification: { type: "DNI", number: formData.dni },
                    address: {
                    street_name: `${formData.direccion}, ${formData.ciudad}, ${formData.provincia}`,
                    street_number: formData.piso,
                    zip_code: formData.codigoPostal,
                    },
                },
                shipments: {
                    cost: formData.envio,
                    empresa: formData.empresaEnvio,
                },
            };

            console.log("Datos enviados a Mercado Pago:", payload);

            // 🔸 Guardar dirección si es necesario
            if ((formData.guardarInformacion && direccionGuardada.length === 0) || agregarNueva) {
            try {
                const {
                data: { user },
                } = await supabase.auth.getUser();

                if (!user) throw new Error("Usuario no autenticado");

                const { error: insertError } = await supabase.from("direcciones").insert([
                {
                    user_id: user.id,
                    direccion: formData.direccion,
                    piso: formData.piso,
                    codigo_postal: formData.codigoPostal,
                    ciudad: formData.ciudad,
                    provincia: formData.provincia,
                },
                ]);

                if (insertError) {
                console.error("Error al guardar dirección:", insertError);
                } else {
                console.log("Dirección guardada con éxito");
                }
            } catch (err) {
                console.error("Error al intentar guardar la dirección:", err);
            }
            }

            // 🔸 Crear preferencia en Mercado Pago
            const response = await axios.post("/api/create_preference", payload);

            if (response.data.id) {
            setPreferenceId(response.data.id);
            }
        } catch (error) {
            console.error("Error al finalizar compra:", error);
        } finally {
            setIsCreatingPreference(false);
        }
    };


    useEffect(() => {
        const fetchUserAndData = async () => {
            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data: perfil, error: perfilError } = await supabase
                .from("profiles")
                .select("nombre, apellido, telefono, dni")
                .eq("id", user.id)
                .single();

            const { data: direcciones, error: dirError } = await supabase
                .from("direcciones")
                .select("*")
                .eq("user_id", user.id)
                .order("creada_el", { ascending: false });

            setFormData((prevData) => ({
                ...prevData,
                email: user.email || "",
                nombre: perfil?.nombre || "",
                apellido: perfil?.apellido || "",
                telefono: perfil?.telefono || "",
                dni: perfil?.dni || "",
            }));

            if (direcciones && direcciones.length > 0) {
                setDireccionGuardada(direcciones); // crea un estado para esto
            }
        };

        fetchUserAndData();
    }, []);

    
    const [alertaStockOpen, setAlertaStockOpen] = useState(false);
    const [mensajeStock, setMensajeStock] = useState("");


    const handleShowPaymentMethods = async () => {
        try {
            // ids válidos
            const idsProductos = carrito.map((item) => item.producto?.id).filter(Boolean);
            if (idsProductos.length === 0) {
            setShowPaymentMethods(true);
            return;
            }

            // <-- SIN COMENTARIOS DENTRO DE LA CADENA .select
            const { data, error } = await supabase
            .from("productos")
            .select(`
                id,
                nombre,
                stock,
                talle,
                categoria_id,
                categorias ( id, nombre )
            `)
            .in("id", idsProductos);

            if (error) {
            console.error("❌ Error verificando stock:", error);
            alert("Error verificando stock. Intenta nuevamente.");
            return;
            }

            const productosStock = (data || []) as any[]; // tipado relajado para poder inspeccionar
            console.log("Debug productosStock:", productosStock);
            console.log("Debug carrito:", carrito);

            const sinStock = carrito.filter((item) => {
            const productoId = item.producto?.id;
            if (!productoId) return true;

            // Buscar la fila que vino desde la consulta
            let productoBD = productosStock.find((p) => p.id === productoId);

            // Si no encontramos por id, intentar fallback por nombre
            if (!productoBD) {
                productoBD = productosStock.find((p) => p.nombre === item.producto?.nombre);
            }
            if (!productoBD) return true;

            // intentar parsear `talle` como JSON si viene serializado
            let tallesObj: Record<string, number> | null = null;
            if (productoBD.talle && typeof productoBD.talle === "string") {
                const posible = productoBD.talle.trim();
                if (posible.startsWith("{")) {
                try {
                    tallesObj = JSON.parse(posible);
                } catch (err) {
                    // no es JSON, seguir con otras comprobaciones
                    tallesObj = null;
                }
                }
            }

            const categoriaNombre = productoBD.categorias?.[0]?.nombre?.toLowerCase?.() || "";

            // 1) Si hay talles en JSON y el item trae talle -> comprobar ese talle
            if (tallesObj && item.talle) {
                const stockTalle = Number(tallesObj[item.talle]) || 0;
                return stockTalle < item.cantidad;
            }

            // 2) Si la fila productoBD tiene `talle` como string simple y coincide con el item.talle
            if (productoBD.talle && item.talle && !tallesObj) {
                if (String(productoBD.talle) === String(item.talle)) {
                return Number(productoBD.stock || 0) < item.cantidad;
                } else {
                // si la fila no coincide, intentar encontrar la variante (misma nombre + talle)
                const variante = productosStock.find(
                    (p) => p.nombre === productoBD.nombre && String(p.talle) === String(item.talle)
                );
                if (variante) return Number(variante.stock || 0) < item.cantidad;

                // también intentar encontrar una fila padre que tenga talles (JSON) por nombre
                const padreConTalles = productosStock.find(
                    (p) => p.nombre === productoBD.nombre && typeof p.talle === "string" && p.talle.trim().startsWith("{")
                );
                if (padreConTalles) {
                    try {
                    const obj = JSON.parse(padreConTalles.talle);
                    return (Number(obj[item.talle]) || 0) < item.cantidad;
                    } catch {}
                }

                // no encontramos variante, considerarlo sin stock (o ajustar política)
                return true;
                }
            }

            // 3) Caso general: validar stock global
            return Number(productoBD.stock || 0) < item.cantidad;
            });

            if (sinStock.length > 0) {
                setMensajeStock(
                    `Los siguientes productos no tienen stock suficiente:\n${sinStock
                    .map((p) => `${p.producto?.nombre} ${p.talle ? `(Talle ${p.talle})` : ""}`)
                    .join("\n")}`
                );
                setAlertaStockOpen(true);
                return;
            }


            // todo ok
            setShowPaymentMethods(true);
        } catch (err) {
            console.error("Error en check stock:", err);
            alert("Ocurrió un error chequeando stock. Reintenta.");
        }
    };




    useEffect(() => {
        fetchCarrito();
    }, [carritoModificado]);


    return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Proceso de pago</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pestañas */}
                    <div className="flex flex-col gap-4">
                        <div className="flex border-b">
                            <span
                                className={`py-2 px-4 ${activeTab === 'informacion' ? 'border-b-2 border-blue-600' : ''}`}
                            >
                                Información
                            </span>
                            <span
                                className={`py-2 px-4 ${activeTab === 'envios' ? 'border-b-2 border-blue-600' : ''}`}
                            >
                                Envíos
                            </span>
                            <span
                                className={`py-2 px-4 ${activeTab === 'pagos' ? 'border-b-2 border-blue-600' : ''}`}
                            >
                                Pagos
                            </span>
                        </div>

                        {/* Contenido de cada pestaña */}
                        {activeTab === 'informacion' && (
                            <div className="p-4 bg-white rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-4">Información</h2>
                                    <form className="space-y-4">
                                        {/* Datos del perfil */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                required
                                            />
                                            </div>
                                            <div>
                                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                            <input
                                                type="text"
                                                name="apellido"
                                                value={formData.apellido}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                required
                                            />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">DNI</label>
                                            <input
                                            type="text"
                                            name="dni"
                                            value={formData.dni}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                            <input
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            required
                                            disabled
                                            />
                                        </div>

                                        {/* Mostrar direcciones guardadas */}
                                        {direccionGuardada.length > 0 && !agregarNueva ? (
                                            <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Seleccionar dirección guardada</label>
                                            {direccionGuardada.map((dir, index) => (
                                                <label 
                                                    key={index} 
                                                    className={`block border rounded-xl p-4 shadow-sm cursor-pointer transition 
                                                    hover:shadow-md hover:border-blue-400 
                                                    ${formData.direccion === dir.direccion ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="direccionSeleccionada"
                                                        value={index}
                                                        checked={formData.direccion === dir.direccion}
                                                        onChange={async () => {
                                                        const nuevaData = {
                                                            ...formData,
                                                            direccion: dir.direccion,
                                                            piso: dir.piso,
                                                            codigoPostal: dir.codigo_postal,
                                                            ciudad: dir.ciudad,
                                                            provincia: dir.provincia,
                                                        };
                                                        setFormData(nuevaData);

                                                        const provinciaDetectada = await obtenerProvinciaNominatim(dir.codigo_postal);
                                                        console.log("🌍 Provincia detectada desde dirección guardada:", provinciaDetectada);
                                                        setEsRegional(provinciaDetectada === "Entre Ríos");
                                                        }}
                                                        className="mt-1 accent-blue-600"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                        {dir.direccion} {dir.piso && `, ${dir.piso}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                        {dir.codigo_postal}, {dir.ciudad}
                                                        </p>
                                                        <p className="text-xs text-gray-500 italic">{dir.provincia}</p>
                                                    </div>
                                                    </div>
                                                </label>
                                            ))}


                                            <button
                                                type="button"
                                                onClick={() => setAgregarNueva(true)}
                                                className="flex items-center gap-2 text-sm font-medium text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                                            >
                                                <span className="text-lg">＋</span> Agregar Nueva Dirección
                                            </button>


                                            </div>
                                        ) : (
                                            // Mostrar formulario para nueva dirección
                                            <div className="space-y-4 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                                <input
                                                type="text"
                                                name="direccion"
                                                value={formData.direccion}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Piso (Opcional)</label>
                                                <input
                                                type="text"
                                                name="piso"
                                                value={formData.piso}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                                                <input
                                                    type="text"
                                                    name="codigoPostal"
                                                    value={formData.codigoPostal}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    required
                                                />
                                                </div>
                                                <div>
                                                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                                <input
                                                    type="text"
                                                    name="ciudad"
                                                    value={formData.ciudad}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    required
                                                />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Provincia</label>
                                                <input
                                                type="text"
                                                name="provincia"
                                                value={formData.provincia}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                required
                                                />
                                            </div>
                                            </div>
                                        )}

                                        {/* Checkboxes */}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="aceptarTerminos"
                                                checked={formData.aceptarTerminos}
                                                onChange={handleChange}
                                                className="mr-2 p-3"
                                                required
                                            />
                                            <label className="text-sm text-gray-700">
                                            Acepto <a href="/paginas/terminos-y-condiciones" className="text-blue-600" target="_blank">los Términos y Condiciones</a>
                                            </label>
                                        </div>

                                        {/* Botón continuar */}
                                        <button
                                            type="button"
                                            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md"
                                            onClick={() => {
                                            const camposRequeridos = [
                                                formData.nombre,
                                                formData.apellido,
                                                formData.dni,
                                                formData.direccion,
                                                formData.codigoPostal,
                                                formData.ciudad,
                                                formData.provincia,
                                                formData.telefono,
                                                formData.email,
                                            ];

                                            const hayCamposVacios = camposRequeridos.some((campo) => campo.trim() === '');

                                            if (hayCamposVacios) {
                                                setErrorMensaje("Por favor completá todos los campos obligatorios.");
                                                return;
                                            }

                                            if (!formData.aceptarTerminos) {
                                                setErrorMensaje("Debes aceptar los Términos y Condiciones para continuar.");
                                                return;
                                            }

                                            setErrorMensaje('');
                                            setActiveTab("envios");
                                            }}
                                        >
                                            Continuar al Envio
                                        </button>

                                        {/* Mensaje de error visual */}
                                        {errorMensaje && (
                                            <div className="mt-2 text-red-600 text-sm font-medium">
                                            {errorMensaje}
                                            </div>
                                        )}
                                    </form>
                            </div>
                        )}

                        {activeTab === 'envios' && (
                            <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">📦 Detalles de Envío</h2>

                                {/* Info de contacto y dirección */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-300 text-sm text-gray-700">
                                <div>
                                    <strong>📧 Contacto:</strong> <span>{formData.email}</span>
                                </div>
                                <div>
                                    <strong>📍 Enviar a:</strong>
                                    <div className="ml-2 text-gray-600">
                                    <div>{formData.nombre} {formData.apellido}</div>
                                    <div>{formData.dni}</div>
                                    <div>{formData.direccion}, {formData.piso}</div>
                                    <div>{formData.ciudad}, {formData.provincia}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 pt-2 border-t border-gray-300">
                                    ❓ Si deseas modificar estos datos, volvé a la pestaña de información.
                                </p>
                                </div>

                                {/* Métodos de envío */}
                                <h2 className="text-xl font-semibold text-gray-800">🚚 Métodos de envío disponibles</h2>
                                <div className="space-y-4">
                                    {tarifasEnvio.length > 0 || subtotal >= 200000 ? (
                                        <div className="space-y-4">
                                            {subtotal >= 200000 && (
                                            <label
                                                htmlFor="envio-gratis"
                                                className={`flex items-center justify-between p-4 border rounded-xl shadow-sm cursor-pointer transition hover:shadow-md ${
                                                formData.empresaEnvio === "Envío Gratis"
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                <img
                                                    src="/envio-gratis.png"
                                                    alt="Envío Gratis"
                                                    className="w-14 h-14 object-contain rounded"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">Envío Gratis</p>
                                                    <p className="text-gray-600 text-sm">¡Por superar los $200.000!</p>
                                                </div>
                                                </div>
                                                <input
                                                type="radio"
                                                name="envio"
                                                id="envio-gratis"
                                                value="0"
                                                className="w-5 h-5 text-green-600"
                                                checked={formData.empresaEnvio === "Envío Gratis"}
                                                onChange={() =>
                                                    setFormData((prev) => ({
                                                    ...prev,
                                                    envio: 0,
                                                    empresaEnvio: "Envío Gratis",
                                                    }))
                                                }
                                                />
                                            </label>
                                            )}

                                            {tarifasEnvio.map((tarifa, index) => (
                                            <label
                                                key={index}
                                                htmlFor={`envio-${index}`}
                                                className={`flex items-center justify-between p-4 border rounded-xl shadow-sm cursor-pointer transition hover:shadow-md ${
                                                formData.empresaEnvio === tarifa.empresa
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                <img
                                                    src={tarifa.imagen}
                                                    alt={tarifa.empresa}
                                                    className="w-14 h-14 object-contain rounded"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">{tarifa.empresa}</p>
                                                    <p className="text-gray-600 text-sm">
                                                    Costo: ${tarifa.precio.toLocaleString()}
                                                    </p>
                                                </div>
                                                </div>
                                                <input
                                                type="radio"
                                                name="envio"
                                                id={`envio-${index}`}
                                                value={tarifa.precio}
                                                className="w-5 h-5 text-blue-600"
                                                checked={formData.empresaEnvio === tarifa.empresa}
                                                onChange={() =>
                                                    setFormData((prevData) => ({
                                                    ...prevData,
                                                    envio: tarifa.precio,
                                                    empresaEnvio: tarifa.empresa,
                                                    }))
                                                }
                                                />
                                            </label>
                                            ))}
                                        </div>
                                    ) : (
                                    <p className="text-gray-500 text-sm">Calculando tarifas de envío...</p>
                                    )}
                                </div>

                                {/* Botones de navegación */}
                                <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
                                    onClick={() => setActiveTab("informacion")}
                                >
                                    ← Volver a Información
                                </button>
                                <button
                                    type="button"
                                    className={`px-5 py-2 rounded-lg transition 
                                        ${formData.empresaEnvio 
                                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                                    disabled={!formData.empresaEnvio} 
                                    onClick={() => {
                                        if (formData.empresaEnvio) {
                                        setActiveTab("pagos");
                                        }
                                    }}
                                >
                                    Continuar al Pago →
                                </button>

                                </div>
                            </div>
                        )}


                        {activeTab === 'pagos' && (
                            <div className="p-6 bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">💳 Resumen de Pago</h2>

                                {/* Información del usuario */}
                                <div className="space-y-1 text-sm text-gray-700">
                                <div>
                                    <strong>📧 Contacto:</strong> <span>{formData.email}</span>
                                </div>
                                <div>
                                    <strong>📍 Enviar a:</strong>
                                    <div className="ml-2 text-gray-600">
                                    <div>{formData.dni}</div>
                                    <div>{formData.direccion}, {formData.piso}</div>
                                    <div>{formData.ciudad}, {formData.provincia}</div>
                                    </div>
                                </div>
                                <div>
                                    <strong>🚚 Método de envío:</strong>{' '}
                                    {formData.empresaEnvio ? (
                                    <span className="text-gray-800 font-medium">
                                        {formData.empresaEnvio} - ${formData.envio.toLocaleString()}
                                    </span>
                                    ) : (
                                    <span className="text-red-600 font-medium">No seleccionado</span>
                                    )}
                                </div>
                                </div>

                                {/* Botones de pago */}
                                <div className="mt-6 space-y-4">
                                {!showPaymentMethods && (
                                    <button
                                    type="submit"
                                    className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition"
                                    onClick={handleShowPaymentMethods}
                                    >
                                    Finalizar Compra
                                    </button>
                                )}

                                {showPaymentMethods && (
                                    <div className="space-y-4">
                                        {!preferenceId && (
                                            <button
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                                            onClick={handleFinalizarCompra}
                                            disabled={isCreatingPreference}
                                            >
                                            {isCreatingPreference ? (
                                                "Creando preferencia..."
                                            ) : (
                                                <>
                                                <img src="/mercado_pago.svg" alt="Mercado Pago" className="w-15 h-12" />
                                                Pagar con Mercado Pago
                                                </>
                                            )}
                                            </button>
                                        )}
                                        {preferenceId && <Wallet initialization={{ preferenceId }} />}

                                        <FormTransferencia formData={formData} total={total} productos={JSON.stringify(resumenProductos)} envio={formData.envio}/>

                                    </div>
                                )}
                                </div>

                                <div className="flex justify-start">
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                        onClick={() => setActiveTab("envios")}
                                    >
                                        ← Volver a Envíos
                                    </button>
                                </div>

                            </div>
                        )}


                        <div className="mt-8 text-sm text-center text-gray-600 space-x-4">
                            <a
                                href="/politica-reembolso"
                                className="hover:underline hover:text-blue-600 transition underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Política de reembolso
                            </a>
                            <a
                                href="/politica-envio"
                                className="hover:underline hover:text-blue-600 transition underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Política de envío
                            </a>
                            <a
                                href="/politica-privacidad"
                                className="hover:underline hover:text-blue-600 transition underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Política de privacidad
                            </a>
                        </div>

                    </div>
                    {/* Columna derecha: Resumen del pedido */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
                            🛒 Resumen del pedido
                        </h2>

                        {/* Lista de productos */}
                        <div className="space-y-4">
                            {carrito.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm"
                            >
                                <div className="w-20 h-20 relative flex-shrink-0 overflow-hidden rounded-lg border">
                                <Image
                                    src={item.producto?.imagen || ''}
                                    alt={item.producto?.nombre || ''}
                                    layout="fill"
                                    objectFit="cover"
                                />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-md font-medium text-gray-900">
                                        {item.producto?.nombre}
                                    </h3>

                                    {item.talle && (
                                        <p className="text-sm text-gray-500">Talle: {item.talle}</p>
                                    )}

                                    {item.producto ? (() => {
                                        const esOferta = item.producto.oferta_activa === true && typeof item.producto.precio_oferta === 'number';
                                        const precioUnitario = esOferta
                                        ? item.producto.precio_oferta!
                                        : item.producto.precio;
                                        const totalPorProducto = precioUnitario * item.cantidad;

                                        return (
                                        <>
                                            <p className="text-sm text-gray-600">
                                            {esOferta ? (
                                                <>
                                                <span className="text-red-600 font-semibold">
                                                    ${item.producto.precio_oferta!.toLocaleString()}
                                                </span>
                                                <span className="line-through ml-2 text-xs text-gray-400">
                                                    ${item.producto.precio.toLocaleString()}
                                                </span>
                                                </>
                                            ) : (
                                                `$${item.producto.precio.toLocaleString()}`
                                            )}{" "}
                                            Cantidad : {item.cantidad}
                                            </p>

                                            <p className="text-md font-semibold text-gray-800 mt-1">
                                            ${totalPorProducto.toLocaleString()}
                                            </p>
                                        </>
                                        );
                                    })() : (
                                        <p className="text-red-500 text-sm">Producto no disponible</p>
                                    )}
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* Totales */}
                        <div className="mt-6 space-y-3 bg-gray-100 rounded-xl p-4 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span className="font-medium">📦 Peso total</span>
                                <span>{pesoTotal} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">🧾 Subtotal</span>
                                <span>${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">🚚 Envío</span>
                                <span>
                                    {formData.envio === 0 ? (
                                        <span className="text-green-600 font-semibold">Gratis</span>
                                    ) : (
                                        `$${formData.envio.toLocaleString()}`
                                    )}
                                </span>
                            </div>
                            <div className="border-t border-gray-300 pt-3 flex justify-between text-base font-bold text-gray-900">
                                <span>Total a pagar</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <AlertaStockPago
                    isOpen={alertaStockOpen}
                    onClose={() => setAlertaStockOpen(false)}
                    mensaje={mensajeStock}
                />

            </div>
            
    );
}

