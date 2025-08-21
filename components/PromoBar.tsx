"use client";
import { motion } from "framer-motion";

const mensajes = [
  "3 y 6 cuotas sin interés",
  "Ofertas por el Día del Padre",
  "Envío gratis en compras mayores a $50.000",
  "10% OFF Transferencia",
  "15% OFF Efectivo",
];

export const PromoBar = () => {
  const texto = mensajes.join("      •      "); // separador entre mensajes

  return (
    <div className="text-white text-sm py-2 font-medium overflow-hidden whitespace-nowrap"
    style={{ backgroundColor: "#0A1F44" }}>
      <motion.div
        className="inline-block"
        initial={{ x: "100%" }} // empieza desde la derecha
        animate={{ x: "-100%" }} // se va hacia la izquierda
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
      >
        <span className="mx-4">{texto}</span>
      </motion.div>
    </div>
  );
};
