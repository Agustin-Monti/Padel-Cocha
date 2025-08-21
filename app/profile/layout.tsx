// app/profile/layout.tsx
import PublicLayout from '@/components/public-layout';
import { createClient } from '@/utils/supabase/server';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PublicLayout user={user}>
      <section className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </section>
    </PublicLayout>
  );
}
