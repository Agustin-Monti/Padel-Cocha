"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Camera, Info, CheckCircle, Package, User, Phone, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ProductUsed {
  nombre: string;
  color: string;
  descripcion: string;
  imagen: File | string;
  propietario: string;
  telefono: string;
  email: string;
}

export default function ContactClient() {
  const [product, setProduct] = useState<ProductUsed>({
    nombre: "",
    color: "",
    descripcion: "",
    imagen: "",
    propietario: "",
    telefono: "",
    email: "",
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    { number: 1, title: "Producto" },
    { number: 2, title: "Imagen" },
    { number: 3, title: "Propietario" }
  ];

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((prev) => ({ ...prev, imagen: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mostrar loading
    Swal.fire({
      title: "Enviando producto...",
      text: "Estamos procesando tu solicitud",
      allowOutsideClick: false,
      backdrop: `
        rgba(0, 0, 0, 0.4)
        url("/images/loading.gif")
        center left
        no-repeat
      `,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("/api/send-used-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "¡Excelente! 🎉",
          text: "Tu producto ha sido enviado exitosamente. Nuestro equipo lo revisará y te contactaremos en las próximas 24-48 horas.",
          icon: "success",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3b82f6",
          customClass: {
            popup: 'rounded-2xl',
            title: 'text-2xl',
            confirmButton: 'px-6 py-3 rounded-lg font-semibold'
          }
        });
        setProduct({
          nombre: "",
          color: "",
          descripcion: "",
          imagen: "",
          propietario: "",
          telefono: "",
          email: "",
        });
        setPreviewUrl(null);
        setCurrentStep(1);
      } else {
        throw new Error(data.message || "Error desconocido");
      }
    } catch (error) {
      Swal.fire({
        title: "Oops... 😕",
        text: "No se pudo enviar el producto. Por favor, intenta nuevamente o contáctanos directamente.",
        icon: "error",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-6 py-3 rounded-lg font-semibold'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con navegación */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-300 group mb-6"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md group-hover:bg-blue-50 transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium group-hover:translate-x-1 transition-transform">
              Volver a la tienda
            </span>
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full mb-4">
              <Package size={20} />
              <span className="font-semibold">VENDER USADO</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Vende o permuta tu equipo
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Completa el formulario y nuestro equipo se pondrá en contacto para evaluar tu producto.
            </p>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="mb-10">
          <div className="flex justify-between items-center relative">
            {/* Línea de progreso */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                    step.number <= currentStep 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {step.number < currentStep ? <CheckCircle size={24} /> : step.number}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header de la card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalles del producto</h2>
                <p className="text-gray-600">Llena los datos para evaluar tu equipo</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Sección 1: Información del producto */}
            <div className={`mb-8 ${currentStep >= 1 ? 'block' : 'hidden'}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">1</span>
                Información del producto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Package size={16} />
                      Nombre del producto
                    </Label>
                    <Input
                      name="nombre"
                      value={product.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Paleta Bullpadel Vertex 03"
                      className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-gray-700 mb-2">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      Color principal
                    </Label>
                    <Input
                      name="color"
                      value={product.color}
                      onChange={handleChange}
                      required
                      placeholder="Ej: Negro/Rojo"
                      className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Info size={16} />
                    Descripción y detalles
                  </Label>
                  <textarea
                    name="descripcion"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    value={product.descripcion}
                    onChange={handleChange}
                    placeholder="Describe el estado, marcas, accesorios incluidos, tiempo de uso, etc."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Sé lo más detallado posible para una mejor valoración
                  </p>
                </div>
              </div>
            </div>

            {/* Sección 2: Imagen */}
            <div className={`mb-8 ${currentStep >= 2 ? 'block' : 'hidden'}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">2</span>
                Imágenes del producto
              </h3>

              <div className="space-y-6">
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  previewUrl 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative mx-auto w-48 h-48 rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={previewUrl}
                            className="w-full h-full object-cover"
                            alt="Vista previa"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                            <button 
                              type="button"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium"
                            >
                              Cambiar imagen
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle size={20} />
                          <span className="font-medium">Imagen cargada correctamente</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <Upload className="text-blue-600" size={32} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Sube una foto de tu producto
                          </h4>
                          <p className="text-gray-600 mb-4">
                            Arrastra o haz clic para seleccionar una imagen
                          </p>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                          >
                            <Camera size={20} />
                            Seleccionar imagen
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Formatos: JPG, PNG, WEBP • Máx. 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Info className="text-amber-600 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">Consejo para mejores fotos</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Usa buena iluminación natural</li>
                        <li>• Muestra todos los ángulos del producto</li>
                        <li>• Enfoca en detalles importantes (golpes, desgaste)</li>
                        <li>• Incluye foto del grip y bordes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Datos del propietario */}
            <div className={`mb-8 ${currentStep >= 3 ? 'block' : 'hidden'}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">3</span>
                Tus datos de contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-gray-700 mb-2">
                      <User size={16} />
                      Nombre completo
                    </Label>
                    <Input
                      name="propietario"
                      value={product.propietario}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre y apellido"
                      className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Phone size={16} />
                      Teléfono
                    </Label>
                    <Input
                      type="tel"
                      name="telefono"
                      value={product.telefono}
                      onChange={handleChange}
                      required
                      placeholder="+54 9 11 1234-5678"
                      className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Mail size={16} />
                    Correo electrónico
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={product.email}
                    onChange={handleChange}
                    required
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Te enviaremos la cotización y actualizaciones a este correo
                  </p>
                </div>
              </div>
            </div>

            {/* Navegación entre pasos */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  Continuar
                </button>
              ) : (
                <SubmitButton 
                  type="submit" 
                  pendingText="Enviando..." 
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  <span className="flex items-center gap-2">
                    Enviar solicitud
                    <CheckCircle size={20} />
                  </span>
                </SubmitButton>
              )}
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Package size={20} />
              </div>
              <h4 className="font-semibold">¿Cómo funciona?</h4>
            </div>
            <p className="text-sm text-gray-600">
              Nuestros expertos evalúan tu producto y te contactamos con una oferta en 24-48 horas.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-semibold">Garantía de transparencia</h4>
            </div>
            <p className="text-sm text-gray-600">
              Valoración justa y proceso seguro. Sin compromiso hasta que aceptes la oferta.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <RefreshCw size={20} />
              </div>
              <h4 className="font-semibold">Permutas aceptadas</h4>
            </div>
            <p className="text-sm text-gray-600">
              También puedes permutar por otro producto de nuestro catálogo.
            </p>
          </div>
        </div>

        {/* Nota al pie */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Al enviar este formulario aceptas nuestros{" "}
            <a href="#" className="text-blue-600 hover:underline font-medium">
              términos y condiciones
            </a>
            . Tus datos están protegidos.
          </p>
        </div>
      </div>
    </div>
  );
}
