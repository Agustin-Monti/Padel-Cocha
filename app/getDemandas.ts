import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../utils/supabase/client';

const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('demandas')
    .select('id, empresa, responsable_solicitud, email, telefono, fecha_inicio, fecha_vencimiento, rubro_demanda, detalle');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}