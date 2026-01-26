"use client";

import Image from "next/image";
import { FaInstagram, FaHeart, FaComment, FaPaperPlane, FaBookmark, FaEllipsisH } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { useState } from "react";

interface Post {
  id: string;
  imageUrl: string;
  link: string;
  alt: string;
  likes: string;
  caption: string;
  timeAgo: string;
  comments: number;
}

export default function Instagram() {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  // Datos mock mejorados
  const profileImage = "/instagram/logo.png";
  const username = "puntopadel_lf";
  const fullName = "Punto Padel LF";
  const bio = "🏆 Tienda oficial de pádel\n📍 Buenos Aires, Argentina\n🛒 Productos y asesoramiento\n📩 DM para consultas";
  const website = "www.puntopadellf.com";
  
  const stats = {
    posts: 68,
    followers: 2059,
    following: 1704
  };

  const recentPosts: Post[] = [
    {
      id: "1",
      imageUrl: "/instagram/post1.jpeg",
      link: "https://www.instagram.com/p/DIKe7WGvI0p/",
      alt: "Nueva paleta de pádel",
      likes: "142",
      caption: "¡Nueva colección llegó! 🎾 La paleta que todos estaban esperando...",
      timeAgo: "2 días",
      comments: 12
    },
    {
      id: "2",
      imageUrl: "/instagram/post2.jpeg",
      link: "https://www.instagram.com/p/DM0M5TouZn-/",
      alt: "Clínica de pádel",
      likes: "85",
      caption: "Clínica exclusiva con nuestro equipo profesional 🏅",
      timeAgo: "1 semana",
      comments: 8
    },
    {
      id: "3",
      imageUrl: "/instagram/post3.jpeg",
      link: "https://www.instagram.com/p/DNQW9z_uqam/",
      alt: "Productos destacados",
      likes: "97",
      caption: "Los más vendidos del mes 🔥 No te quedes sin el tuyo...",
      timeAgo: "3 semanas",
      comments: 15
    },
    {
      id: "4",
      imageUrl: "/instagram/post4.jpg", // Cambiar por imagen real
      link: "https://www.instagram.com/p/DT-oe_CjuQ3/?img_index=1",
      alt: "Torneo interno",
      likes: "203",
      caption: "Gran final del torneo interno 🏆",
      timeAgo: "1 mes",
      comments: 24
    },
    {
      id: "5",
      imageUrl: "/instagram/post5.jpeg", // Cambiar por imagen real
      link: "https://www.instagram.com/p/DS8kJ0ijgU0/",
      alt: "Ofertas especiales",
      likes: "156",
      caption: "Ofertas de temporada ✨",
      timeAgo: "1 mes",
      comments: 11
    },
    {
      id: "6",
      imageUrl: "/instagram/post6.jpg", // Cambiar por imagen real
      link: "https://www.instagram.com/p/DRr4B2ajs97/?img_index=1",
      alt: "Nuevas zapatillas",
      likes: "189",
      caption: "Las zapatillas que revolucionan el juego 👟",
      timeAgo: "2 meses",
      comments: 19
    }
  ];

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden font-sans">
      {/* Header estilo Instagram */}
      <div className="p-6 md:p-8">
        {/* Perfil móvil */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-pink-500">
              <Image
                src={profileImage}
                alt={`${username} profile`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{username}</h2>
              <p className="text-sm text-gray-500">{fullName}</p>
            </div>
          </div>
          <FaEllipsisH className="text-gray-600 text-xl" />
        </div>

        {/* Perfil desktop */}
        <div className="hidden md:flex items-start gap-10">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden relative border-4 border-white shadow-lg">
              <Image
                src={profileImage}
                alt={`${username} profile`}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-6 mb-4">
              <h1 className="text-2xl font-light">{username}</h1>
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.instagram.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0095f6] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1877f2] transition"
                >
                  Seguir
                </a>
                <a
                  href={`https://www.instagram.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50 transition"
                >
                  Mensaje
                </a>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FiMoreVertical className="text-xl" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mb-5">
              <div>
                <span className="font-semibold">{stats.posts.toLocaleString("es-AR")}</span>
                <span className="text-gray-600 ml-1">publicaciones</span>
              </div>
              <div>
                <span className="font-semibold">{stats.followers.toLocaleString("es-AR")}</span>
                <span className="text-gray-600 ml-1">seguidores</span>
              </div>
              <div>
                <span className="font-semibold">{stats.following.toLocaleString("es-AR")}</span>
                <span className="text-gray-600 ml-1">seguidos</span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{fullName}</p>
              <div className="whitespace-pre-line text-gray-800">
                {bio.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <a 
                href={`https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00376b] font-medium hover:underline"
              >
                {website}
              </a>
            </div>
          </div>
        </div>

        {/* Stats móvil */}
        <div className="flex justify-around py-4 border-y border-gray-200 md:hidden">
          <div className="text-center">
            <p className="font-semibold">{stats.posts}</p>
            <p className="text-gray-600 text-sm">Publicaciones</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{stats.followers}</p>
            <p className="text-gray-600 text-sm">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{stats.following}</p>
            <p className="text-gray-600 text-sm">Seguidos</p>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-t border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
              activeTab === 'posts' 
                ? 'text-gray-900 border-t border-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-current rounded-[1px]" />
              ))}
            </div>
            <span>PUBLICACIONES</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
              activeTab === 'saved' 
                ? 'text-gray-900 border-t border-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaBookmark className="text-lg" />
            <span>GUARDADOS</span>
          </button>
        </div>
      </div>

      {/* Grid de posts */}
      <div className="grid grid-cols-3 gap-0.5 bg-gray-100">
        {recentPosts.map((post) => (
          <a
            href={post.link}
            key={post.id}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square group bg-white"
          >
            <div className="relative w-full h-full">
              <Image
                src={post.imageUrl}
                alt={post.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 300px"
              />
            </div>

            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white">
              <div className="flex items-center gap-2 font-semibold">
                <FaHeart className="text-lg" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <FaComment className="text-lg transform scale-x-[-1]" />
                <span>{post.comments}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t border-gray-200">
        <a
          href={`https://www.instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#0095f6] hover:text-[#1877f2] font-medium text-sm"
        >
          <FaInstagram className="text-lg" />
          Ver perfil completo en Instagram
        </a>
        <p className="text-gray-500 text-xs mt-2">
          Actualizado recientemente • Siguenos para más contenido
        </p>
      </div>
    </section>
  );
}
