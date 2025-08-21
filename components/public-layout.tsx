"use client";

import { GeistSans } from 'geist/font/sans';
import Carrito from '@/components/Carrito';
import { Header } from '@/components/header';
import { ReactNode, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { PromoBar } from "@/components/PromoBar";
import Footer from "@/components/Footer";

interface PublicLayoutProps {
  children: ReactNode;
  user: User | null;
}

export default function PublicLayout({ children, user }: PublicLayoutProps) {
  const [isCarritoOpen, setIsCarritoOpen] = useState(false);

  return (
    <>
      <PromoBar />
      <Header user={user} onOpenCarrito={() => setIsCarritoOpen(true)} />
      <Carrito
        isOpen={isCarritoOpen}
        onClose={() => setIsCarritoOpen(false)}
        carritoModificado={false}
      />
      <div>{children}</div>
      <Footer />
    </>
  );
}
