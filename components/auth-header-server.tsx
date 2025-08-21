import { createClient } from "@/utils/supabase/server";

export default async function AuthHeaderServer() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span>Hola,</span>
        <p>{user.email}</p>
      </div>
    </div>
  ) : (
    <p>Usuario no autenticado</p>
  );
}
