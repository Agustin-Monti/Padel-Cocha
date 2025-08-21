// app/ofertas/layout.tsx
import PublicLayout from '@/components/public-layout';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export default async function OfertasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Crear cliente de Supabase para obtener usuario autenticado
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser(); // Obtener datos del usuario autenticado

  return (
    <PublicLayout user={user}>
      <div>{children}</div> {/* El contenido específico de la página de producto */}
    </PublicLayout>
  );
}
