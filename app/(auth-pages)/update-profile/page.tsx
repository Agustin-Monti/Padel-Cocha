// "use client"; // Convertimos este componente en un cliente
// import React, { useEffect, useState } from "react";
// import { updateProfileAction } from "@/actions/profile-actions/index";
// import { FormMessage, Message } from "@/components/form-message";
// import { SubmitButton } from "@/components/submit-button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { createClient } from "@/utils/supabase/client";

// export default function UpdateProfilePage(){
//  {/*searchParams,
// }: {
//   searchParams: Message;
// }) {*/} 
//   const [user, setUser] = useState<any>(null);
//   const [profile, setProfile] = useState<any>({
//     provincia: "",
//     municipio: "",
//     localidad: "",
//     codigo_postal: "",
//     direccion: "",
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       const supabase = createClient();
//       const {
//         data: { user },
//         error,
//       } = await supabase.auth.getUser();

//       if (error) {
//         return (
//           <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
//             {error.message}
//           </div>
//         );
//       }
//       if (user) {
//         setUser(user);

//         const { data: profileData, error: profileError } = await supabase
//           .from("profile")
//           .select("*")
//           .eq("id", user.id)
//           .single(); // single() se usa para obtener un solo registro

//         if (profileError) {
//           console.error("Error fetching profile:", profileError);
//         } else {
//           setProfile(profileData || {});
//         }
//       }

//       setLoading(false);
//     };

//     fetchProfileData();
//   }, []);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   {/*if ("message" in searchParams) {
//     return (
//       <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
//         <FormMessage message={searchParams} />
//       </div>
//     );
//   }*/}

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setProfile({
//       ...profile,
//       [e.target.name]: e.target.value,
//     });
//   };

//   return (
//     <>
//       <form
//         className="flex flex-col max-w-3xl mx-auto"
//         style={{ width: "700px" }}
//         method="post"
//       >
//         <h1 className="text-2xl font-medium">Completá tu información</h1>
//         <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
//           <Label htmlFor="email">Email</Label>
//           <Input
//             name="email"
//             placeholder="you@example.com"
//             required
//             defaultValue={user?.email}
//           />

//           <Label htmlFor="nombre">Nombre</Label>
//           <Input
//             name="nombre"
//             placeholder="Nombre"
//             required
//             value={profile.nombre}
//             onChange={handleChange}
//           />

//           <Label htmlFor="apellido">Apellido</Label>
//           <Input
//             name="apellido"
//             placeholder="Apellido"
//             required
//             value={profile.apellido}
//             onChange={handleChange}
//           />

//           <Label htmlFor="provincia">Provincia</Label>
//           <Input
//             name="provincia"
//             placeholder="Provincia"
//             value={profile.provincia}
//             onChange={handleChange}
//           />

//           <Label htmlFor="municipio">Municipio</Label>
//           <Input
//             name="municipio"
//             placeholder="Municipio"
//             value={profile.municipio}
//             onChange={handleChange}
//           />

//           <Label htmlFor="localidad">Localidad</Label>
//           <Input
//             name="localidad"
//             placeholder="Localidad"
//             value={profile.localidad}
//             onChange={handleChange}
//           />

//           <Label htmlFor="codigo_postal">Código Postal</Label>
//           <Input
//             name="codigo_postal"
//             placeholder="Código Postal"
//             type="number"
//             value={profile.codigo_postal}
//             onChange={handleChange}
//           />

//           <Label htmlFor="direccion">Dirección</Label>
//           <Input
//             name="direccion"
//             placeholder="Dirección"
//             value={profile.direccion}
//             onChange={handleChange}
//           />

//           <SubmitButton
//             formAction={updateProfileAction}
//             pendingText="Actualizando..."
//           >
//             Actualizar información
//           </SubmitButton>
//           {/*<FormMessage message={searchParams} />*/}
//         </div>
//       </form>
//     </>
//   );
// }
