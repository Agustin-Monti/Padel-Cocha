// app/cart/layout.tsx
import PublicLayout from '@/components/public-layout';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export default async function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener el usuario autenticado
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <PublicLayout user={user}>
      {children}
    </PublicLayout>
  );
}