import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  product: any;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => void;
}

export default function FormularioBolsos({ product, onChange }: Props) {
  return (
    <div className="border p-6 rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Datos del Bolso</h2>

      <div className="mb-4">
        <Label>Modelo</Label>
        <Input name="modelo" value={product.modelo || ""} onChange={onChange} />
      </div>

      <div className="mb-4">
        <Label>Origen</Label>
        <Input name="origen" value={product.origen || ""} onChange={onChange} />
      </div>

      <div className="mb-4">
        <Label>Material</Label>
        <Input
          name="materiales"
          value={product.materiales || ""}
          onChange={onChange}
        />
      </div>

      <div className="mb-4">
        <Label>Medidas</Label>
        <Input
          name="medidas"
          value={product.medidas || ""}
          onChange={onChange}
          placeholder="Ej: 40x30x15 cm"
        />
      </div>

      <div className="mb-4">
        <Label>Capacidad</Label>
        <Input
          name="capacidad"
          value={product.capacidad || ""}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
