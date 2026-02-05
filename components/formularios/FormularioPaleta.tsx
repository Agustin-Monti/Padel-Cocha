"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  product: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormularioPaleta({ product, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-t pt-6">
      <div>
        <Label>Modelo</Label>
        <Input name="modelo" value={product.modelo || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Origen</Label>
        <Input name="origen" value={product.origen || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Forma</Label>
        <Input name="forma" value={product.forma || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Balance</Label>
        <Input name="balance" value={product.balance || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Material Externo</Label>
        <Input name="marco" value={product.marco || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Núcleo</Label>
        <Input name="nucleo" value={product.nucleo || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Acabado</Label>
        <Input name="acabado" value={product.acabado || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Potencia (Numero de 1 a 10)</Label>
        <Input type="number" name="potencia" value={product.potencia || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Control (Numero de 1 a 10)</Label>
        <Input type="number" name="control" value={product.control || ""} onChange={onChange} required />
      </div>
      <div>
        <Label>Juego</Label>
        <Input name="juego" value={product.juego || ""} onChange={onChange} required />
      </div>
    </div>
  );
}


