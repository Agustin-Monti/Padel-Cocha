import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Esta es una página protegida y sólo podés acceder a ella como un
          usuario autenticado.
        </div>
      </div>
      <div className="flex-1 w-full flex flex-row gap-12">
        <div className="flex flex-col gap-2 items-start">
          <h2 className="font-bold text-2xl mb-4">El detalle de tu usuario</h2>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <h2 className="font-bold text-2xl mb-4">El detalle de tu perfil</h2>
          {profileError && <>Error obteniendo tu perfil</>}
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
