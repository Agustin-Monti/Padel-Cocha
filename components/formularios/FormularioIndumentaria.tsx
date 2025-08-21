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
  onChangeTalle: (talle: string, cantidad: number) => void;
}

const tallesDisponibles = ["S", "M", "L", "XL", "XXL"];

export default function FormularioIndumentaria({
  product,
  onChange,
  onChangeTalle,
}: Props) {
  return (
    <div className="border p-6 rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Datos Indumentaria</h2>


      <div className="mb-4">
        <Label>Modelo</Label>
        <Input name="modelo" value={product.modelo || ""} onChange={onChange} />
      </div>

      <div className="mb-4">
        <Label>Origen</Label>
        <Input name="origen" value={product.origen || ""} onChange={onChange} />
      </div>

      <div className="mb-4">
        <Label>Color</Label>
        <Input name="color" value={product.color || ""} onChange={onChange} />
      </div>

      <div className="mb-4">
        <Label>Materiales</Label>
        <Input
          name="material"
          value={product.material || ""}
          onChange={onChange}
        />
      </div>

      <div className="mb-4">
        <Label className="block mb-2">Stock por Talle</Label>
        {tallesDisponibles.map((talle) => (
          <div key={talle} className="flex items-center gap-2 mb-2">
            <span className="w-10">{talle}</span>
            <Input
              type="number"
              min={0}
              value={product.talles?.[talle] || 0}
              onChange={(e) =>
                onChangeTalle(talle, Math.max(0, Number(e.target.value)))
              }
              className="w-20"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
