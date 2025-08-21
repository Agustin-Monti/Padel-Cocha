"use client";

import { useState, useRef, useEffect } from "react";
import { signOutAction } from "@/actions/auth-actions/actions";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { User } from "@supabase/supabase-js";
import { ChevronDown, User as UserIcon, LogOut } from "lucide-react";

interface HeaderAuthProps {
  user: User | null;
}

export default function AuthButton({ user }: HeaderAuthProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge variant="default" className="font-normal pointer-events-none">
          Please update .env.local file with anon key and url
        </Badge>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled className="opacity-75">
            <Link href="/sign-in">Iniciar Sesión</Link>
          </Button>
          <Button size="sm" variant="default" disabled className="opacity-75">
            <Link href="/sign-up">Registrarse</Link>
          </Button>
        </div>
      </div>
    );
  }

  return user ? (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 bg-gray-100 hover:bg-gray-400"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700">{user.email}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-[280px] bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100 animate-fade-in">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
          </div>
          
          <ul className="py-2">
            <li>
              <Link
                href="/profile"
                className="flex items-center px-6 py-4 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span className="font-medium">Perfil</span>
              </Link>
            </li>
            <li className="border-t border-gray-100"></li>
            <li>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="flex items-center w-full justify-start px-6 py-4 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">Cerrar Sesión</span>
                </Button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Iniciar Sesión</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Registrarse</Link>
      </Button>
    </div>
  );
}