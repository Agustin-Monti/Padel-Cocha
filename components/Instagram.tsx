"use client";

import Image from "next/image";
import { FaInstagram, FaHeart } from "react-icons/fa";

interface Post {
  id: string;
  imageUrl: string;
  link: string;
  alt: string;
  likes: string;
}

export default function Instagram() {
  // Datos mock
  const profileImage = "/instagram/logo.png";
  const username = "puntopadel_lf";
  const followers = 1914;
  const following = 1703;
  const posts = 60;

  const recentPosts: Post[] = [
    {
      id: "1",
      imageUrl: "/instagram/post1.jpg",
      link: "https://www.instagram.com/p/DCXviVEP69K/",
      alt: "Post 1",
      likes: "142",
    },
    {
      id: "2",
      imageUrl: "/instagram/post2.jpg",
      link: "https://www.instagram.com/p/DFdzMKVv4-b/",
      alt: "Post 2",
      likes: "85",
    },
    {
      id: "3",
      imageUrl: "/instagram/post3.jpg",
      link: "https://www.instagram.com/p/C9fAinku6jG/",
      alt: "Post 3",
      likes: "97",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-10 text-center font-sans">
      {/* Encabezado con botón seguir */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden relative border-2 border-gray-300">
            <Image
              src={profileImage}
              alt={`${username} profile`}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-semibold">@{username}</h2>
            <a
              href={`https://www.instagram.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              Ver perfil en Instagram
            </a>
          </div>
        </div>

        <a
          href={`https://www.instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition text-sm"
        >
          Seguir
        </a>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-16 text-lg text-gray-700 mb-10">
        <div>
          <span className="font-bold text-xl">{posts.toLocaleString("es-AR")}</span>
          <p>Posts</p>
        </div>
        <div>
          <span className="font-bold text-xl">{followers.toLocaleString("es-AR")}</span>
          <p>Seguidores</p>
        </div>
        <div>
          <span className="font-bold text-xl">{following.toLocaleString("es-AR")}</span>
          <p>Siguiendo</p>
        </div>
      </div>

      {/* Fotos recientes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recentPosts.map((post) => (
          <a
            href={post.link}
            key={post.id}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group rounded-xl overflow-hidden shadow-md"
          >
            <div className="relative w-full h-48 bg-white rounded overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.alt}
                fill
                className="object-contain"
              />
            </div>


            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <div className="flex items-center text-white gap-2 text-lg font-semibold">
                <FaHeart className="text-red-400" />
                {post.likes}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
