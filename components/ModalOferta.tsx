import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface ModalOfertaProps {
  isOpen: boolean;
  onClose: () => void;
  productoId: string | null;
  onSubmit: (oferta: { oferta_activa: boolean; precio_oferta: number }) => void;
  precioBase: number;
  ofertaActiva: boolean;
  precioOferta: number;
}

type CheckedState = boolean | 'indeterminate';

const ModalOferta: React.FC<ModalOfertaProps> = ({ isOpen, onClose, productoId , onSubmit, precioBase, ofertaActiva: ofertaActivaProp, precioOferta: precioOfertaProp }) => {
  const [ofertaActiva, setOfertaActiva] = useState(ofertaActivaProp);
  const [precioOferta, setPrecioOferta] = useState<number | "">(precioOfertaProp);

  // Calcular porcentaje de descuento
  const calcularDescuento = () => {
    if (!ofertaActiva || !precioOferta || precioOferta >= precioBase) return 0;
    return Math.round(((precioBase - Number(precioOferta)) / precioBase) * 100);
  };

  // Actualizar los valores cuando el modal se abre
  useEffect(() => {
    setOfertaActiva(ofertaActivaProp); // Actualizar el estado del checkbox
    setPrecioOferta(precioOfertaProp); // Establecer el precio de la oferta
  }, [ofertaActivaProp, precioOfertaProp]);

  if (!isOpen) return null; // No renderizar si el modal está cerrado

  const handleCheckboxChange = (checked: CheckedState) => {
    // Convertir el valor de "checked" a booleano, ya que "checked" puede ser "indeterminate" o "false"
    const isChecked = checked === true; // Si el valor es "true", se convierte a "true", de lo contrario a "false".
    setOfertaActiva(isChecked);
    if (!isChecked) {
      setPrecioOferta(0); // Resetear el precio si la oferta no está activa
    }
  };
  

  const handlePrecioOfertaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrecioOferta(event.target.value ? Number(event.target.value) : 0);
  };

  const handleSubmit = () => {
    onSubmit({ oferta_activa: ofertaActiva, precio_oferta: Number(precioOferta) });
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Agregar Oferta</h2>

        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            checked={ofertaActiva}
            onCheckedChange={(checked) => handleCheckboxChange(checked)}
          />
          <span>Oferta activa</span>
        </div>

        {ofertaActiva && (
          <div className="mb-4">
            <Input
              type="number"
              value={precioOferta}
              onChange={handlePrecioOfertaChange}
              placeholder="Precio de la oferta"
            />
          </div>
        )}

        {ofertaActiva && precioOferta && precioOferta < precioBase && (
          <p className="text-green-600 font-semibold mt-2 text-center">
            Descuento aplicado: {calcularDescuento()}%
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </div>
      </div>
    </div>
  );
};

export default ModalOferta;
