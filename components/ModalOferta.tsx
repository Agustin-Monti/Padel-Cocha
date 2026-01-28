import React, { useEffect, useState } from "react";
import { X, Percent, Tag, DollarSign } from "lucide-react";

interface ModalOfertaProps {
  isOpen: boolean;
  onClose: () => void;
  productoId: string | null;
  onSubmit: (oferta: { oferta_activa: boolean; precio_oferta: number }) => void;
  precioBase: number;
  ofertaActiva: boolean;
  precioOferta: number;
}

const ModalOferta: React.FC<ModalOfertaProps> = ({ 
  isOpen, 
  onClose, 
  productoId, 
  onSubmit, 
  precioBase, 
  ofertaActiva: ofertaActivaProp, 
  precioOferta: precioOfertaProp 
}) => {
  const [ofertaActiva, setOfertaActiva] = useState(ofertaActivaProp);
  const [precioOferta, setPrecioOferta] = useState<string>(precioOfertaProp > 0 ? precioOfertaProp.toFixed(2) : "");
  const [modoPorcentaje, setModoPorcentaje] = useState(false);
  const [porcentajeDescuento, setPorcentajeDescuento] = useState<string>("");

  const calcularDescuento = () => {
    if (!ofertaActiva || !precioOferta || Number(precioOferta) >= precioBase) return 0;
    return Math.round(((precioBase - Number(precioOferta)) / precioBase) * 100);
  };

  const calcularPrecioDesdePorcentaje = (porcentaje: number) => {
    const resultado = precioBase - (precioBase * (porcentaje / 100));
    return Math.round(resultado * 100) / 100;
  };

  useEffect(() => {
    setOfertaActiva(ofertaActivaProp);
    const precioFormateado = precioOfertaProp > 0 ? precioOfertaProp.toFixed(2) : "";
    setPrecioOferta(precioFormateado);
    
    if (precioOfertaProp > 0 && precioBase > 0) {
      const descuento = Math.round(((precioBase - precioOfertaProp) / precioBase) * 100);
      setPorcentajeDescuento(descuento.toString());
    } else {
      setPorcentajeDescuento("");
    }
  }, [ofertaActivaProp, precioOfertaProp, precioBase]);

  const handlePrecioOfertaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      if ((value.match(/\./g) || []).length <= 1) {
        setPrecioOferta(value);
        
        if (value && precioBase > 0) {
          const precioNum = Number(value);
          if (precioNum < precioBase && precioNum > 0) {
            const descuento = Math.round(((precioBase - precioNum) / precioBase) * 100);
            setPorcentajeDescuento(descuento.toString());
          } else {
            setPorcentajeDescuento("");
          }
        }
      }
    }
  };

  const handlePorcentajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === "" || /^\d{0,3}$/.test(value)) {
      const numValue = Number(value);
      if (numValue <= 100) {
        setPorcentajeDescuento(value);
        
        if (value && precioBase > 0) {
          const descuentoNum = Number(value);
          const nuevoPrecio = calcularPrecioDesdePorcentaje(descuentoNum);
          setPrecioOferta(nuevoPrecio.toFixed(2));
        }
      }
    }
  };

  const handleSubmit = () => {
    const precioFinal = precioOferta ? Number(precioOferta) : 0;
    onSubmit({ 
      oferta_activa: ofertaActiva && precioFinal > 0 && precioFinal < precioBase, 
      precio_oferta: precioFinal 
    });
  };

  if (!isOpen) return null;

  const descuentoActual = calcularDescuento();
  const precioOfertaNum = precioOferta ? Number(precioOferta) : 0;
  const ahorro = precioBase - precioOfertaNum;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Tag className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Configurar Oferta</h2>
              <p className="text-sm text-gray-600">Producto ID: {productoId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            
            {/* Columna izquierda: Precio base y activación */}
            <div className="space-y-4">
              {/* Precio Base */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <h3 className="font-bold text-gray-700 mb-2">Precio Base</h3>
                <div className="text-2xl font-bold text-gray-900">
                  ${precioBase.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500 mt-1">Precio regular del producto</p>
              </div>
              
              {/* Activar Oferta */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-gray-700">Oferta Activa</div>
                    <div className="text-sm text-gray-500 mt-1">Mostrar precio especial al público</div>
                  </div>
                  {/* Checkbox personalizado */}
                  <button
                    type="button"
                    onClick={() => setOfertaActiva(!ofertaActiva)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
                      ofertaActiva ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {/* Circulo deslizante */}
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        ofertaActiva ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                    
                    {/* Texto dentro del switch */}
                    <span className={`absolute text-xs font-bold ${
                      ofertaActiva 
                        ? 'left-2 text-white opacity-0' 
                        : 'right-2 text-gray-600'
                    } transition-opacity duration-300`}>
                      OFF
                    </span>
                    <span className={`absolute text-xs font-bold ${
                      ofertaActiva 
                        ? 'right-2 text-white' 
                        : 'left-2 text-gray-600 opacity-0'
                    } transition-opacity duration-300`}>
                      ON
                    </span>
                  </button>
                </div>
              </div>

              {/* Descuentos rápidos - SIEMPRE VISIBLE */}
              {ofertaActiva && (
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                  <h4 className="font-bold text-gray-700 mb-3">Descuentos Rápidos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 20, 30, 40, 50, 60].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setModoPorcentaje(true);
                          setPorcentajeDescuento(pct.toString());
                          const nuevoPrecio = calcularPrecioDesdePorcentaje(pct);
                          setPrecioOferta(nuevoPrecio.toFixed(2));
                        }}
                        className="p-2 border border-gray-300 rounded hover:border-blue-400 hover:bg-blue-100 transition-colors text-center"
                      >
                        <div className="font-bold text-gray-800">{pct}%</div>
                        <div className="text-xs text-gray-500 mt-1">
                          ${calcularPrecioDesdePorcentaje(pct).toFixed(0)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna central: Configuración */}
            <div className="space-y-4">
              {ofertaActiva ? (
                <>
                  {/* Selector de modo - SIEMPRE VISIBLE */}
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    <h3 className="font-bold text-gray-700 mb-3">¿Cómo quieres establecer el descuento?</h3>
                    <div className="flex gap-2 mb-6">
                      {/* Botón Monto Directo */}
                      <button
                        onClick={() => setModoPorcentaje(false)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                          !modoPorcentaje 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <DollarSign className="h-5 w-5" />
                        <span className="font-medium">Monto Directo</span>
                      </button>
                      
                      {/* Botón Porcentaje - SIEMPRE VISIBLE */}
                      <button
                        onClick={() => setModoPorcentaje(true)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                          modoPorcentaje 
                            ? 'bg-green-600 text-white border-green-600' 
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-300 text-gray-700'
                        }`}
                      >
                        <Percent className="h-5 w-5" />
                        <span className="font-medium">Porcentaje</span>
                      </button>
                    </div>

                    {/* Campo de entrada */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {modoPorcentaje ? 'Ingresar Porcentaje de Descuento' : 'Ingresar Precio de Oferta'}
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {modoPorcentaje ? <Percent className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                        </div>
                        <input
                          type="text"
                          value={modoPorcentaje ? porcentajeDescuento : precioOferta}
                          onChange={modoPorcentaje ? handlePorcentajeChange : handlePrecioOfertaChange}
                          placeholder={modoPorcentaje ? "Ej: 30 (para 30% de descuento)" : "Ej: 101500.00"}
                          className={`w-full px-4 py-3 pl-10 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            precioOfertaNum > 0 && precioOfertaNum < precioBase 
                              ? 'border-green-500 bg-green-50' 
                              : precioOfertaNum >= precioBase 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-300'
                          }`}
                        />
                        {modoPorcentaje && porcentajeDescuento && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            %
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {modoPorcentaje 
                          ? 'Ingresa el porcentaje de descuento (0-100%)'
                          : 'Ingresa el nuevo precio de oferta'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-600 mb-2">Oferta Desactivada</h3>
                  <p className="text-gray-500">
                    Activa la oferta para configurar precios especiales
                  </p>
                </div>
              )}
            </div>

            {/* Columna derecha: Vista previa */}
            <div className="space-y-4">
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <h3 className="font-bold text-gray-700 mb-3">Vista Previa</h3>
                
                {ofertaActiva && precioOfertaNum > 0 ? (
                  <div className="space-y-4">
                    {/* Porcentaje de descuento */}
                    <div className="text-center">
                      {descuentoActual > 0 ? (
                        <div className="text-2xl font-bold text-green-700 bg-green-50 py-2 rounded-lg">
                          {descuentoActual}% OFF
                        </div>
                      ) : (
                        <div className="text-lg text-gray-600 py-2">Sin descuento</div>
                      )}
                    </div>
                    
                    {/* Comparación de precios */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Precio Original</div>
                        <div className="text-lg font-bold text-gray-700 line-through">
                          ${precioBase.toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Precio con Oferta</div>
                        <div className={`text-2xl font-bold ${
                          precioOfertaNum < precioBase ? 'text-green-700' : 'text-red-700'
                        }`}>
                          ${precioOfertaNum.toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Estadísticas */}
                      {descuentoActual > 0 && (
                        <div className="pt-3 border-t">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">Ahorro</div>
                              <div className="font-bold text-green-700">
                                ${ahorro.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">Descuento</div>
                              <div className="font-bold text-green-700">
                                {descuentoActual}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Advertencia si el precio no es válido */}
                    {precioOfertaNum >= precioBase && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm text-red-700">
                          ⚠️ El precio de oferta debe ser menor al precio base (${precioBase.toFixed(2)})
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-4xl mb-4 text-gray-400">📊</div>
                    <p className="text-gray-500">La vista previa se mostrará cuando actives la oferta</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div>
            {ofertaActiva && precioOfertaNum >= precioBase && (
              <div className="text-red-600 font-medium">
                ⚠️ El precio de oferta debe ser menor al precio base
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* Botón Cancelar */}
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            
            {/* Botón Guardar */}
            <button
              onClick={handleSubmit}
              disabled={ofertaActiva && (!precioOferta || precioOfertaNum >= precioBase)}
              className={`px-5 py-2.5 rounded-lg font-bold text-white transition-colors ${
                ofertaActiva && precioOfertaNum < precioBase
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400' 
                  : ofertaActiva
                  ? 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:cursor-not-allowed`}
            >
              {ofertaActiva 
                ? (precioOfertaNum < precioBase ? '💾 GUARDAR OFERTA' : 'PRECIO INVÁLIDO')
                : 'GUARDAR'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalOferta;
