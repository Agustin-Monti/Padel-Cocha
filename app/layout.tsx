// app/layout.tsx
import "./globals.css";
import { CarritoProvider } from "@/context/CarritoContext";
import { FavoritosProvider } from "@/context/FavoritosContext";
import { Poppins, Amatic_SC, Roboto,Bebas_Neue } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-poppins" });
const amatic = Amatic_SC({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-amatic" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-roboto" });
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas',})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${amatic.variable} ${roboto.variable} ${bebas.variable}`}>
      <body className="font-poppins text-gray-800" style={{ backgroundColor: '#e6dfd6' }}>
        <CarritoProvider>
          <FavoritosProvider>
            {children}
          </FavoritosProvider>
        </CarritoProvider>
      </body>
    </html>
  );
}
