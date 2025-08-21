'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function GraficosProductosSection() {
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => {
    fetch('/api/graficos-productos')
      .then((res) => res.json())
      .then(setDatos)
      .catch(console.error);
  }, []);

  if (!datos) return <p className="text-gray-500">Cargando gráficos...</p>;

  const datosPorCategoria = Object.entries(datos?.productosPorCategoria || {}).map(
    ([nombre, cantidad]) => ({
      nombre,
      cantidad,
    })
  );

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,   // Mostrar solo 1 gráfico a la vez
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    // Centrar y limitar ancho del slider para que no se vea gigante
    <div className="mx-auto" style={{ maxWidth: 700 }}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Sección: Productos</h2>

      <Slider {...settings}>
        <div className="px-2">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="font-medium mb-2">Productos por categoría</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosPorCategoria}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="px-2">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="font-medium mb-2">Productos más añadidos al carrito</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datos.productosMasCarrito}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="px-2">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="font-medium mb-2">Productos más comprados</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datos.productosMasComprados}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Slider>
    </div>
  );
}
