'use client';
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/server";

export default function CategoryFilter({
  onFilterChange,
}: {
  onFilterChange: (categoryId: string) => void;
}) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("categorias").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor="categoryFilter" className="font-medium">
        Filtrar por categoría
      </label>
      <select
        id="categoryFilter"
        onChange={(e) => onFilterChange(e.target.value)}
        className="ml-2 p-2 border rounded"
      >
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.categoria}
          </option>
        ))}
      </select>
    </div>
  );
}
