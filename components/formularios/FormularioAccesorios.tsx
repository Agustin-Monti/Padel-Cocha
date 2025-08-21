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

export default function FormularioAccesorios({ product, onChange }: Props) {
  return (
    <div className="border p-6 rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Datos del Accesorio</h2>

      <div className="mb-4">
        <Label>Origen</Label>
        <Input
          name="origen"
          value={product.origen || ""}
          onChange={onChange}
        />
      </div>

      <div className="mb-4">
        <Label>Ancho</Label>
        <Input
          name="ancho"
          value={product.ancho || ""}
          onChange={onChange}
          placeholder="Ej: 5 cm"
        />
      </div>

      <div className="mb-4">
        <Label>Largo</Label>
        <Input
          name="largo"
          value={product.largo || ""}
          onChange={onChange}
          placeholder="Ej: 25 cm"
        />
      </div>

      <div className="mb-4">
        <Label>Textura</Label>
        <Input
          name="textura"
          value={product.textura || ""}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
