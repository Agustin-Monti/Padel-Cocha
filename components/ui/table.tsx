import React, { useState } from 'react';

// Definir las propiedades de la tabla
interface TableProps {
  headers: string[];
  data: any[];
  filterKey?: string;
  searchPlaceholder?: string;
}

// Componente Tabla con Filtros, Búsqueda y Paginación
export function Table({ headers, data, filterKey = 'status', searchPlaceholder = 'Buscar...' }: TableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar los datos según búsqueda y filtro
  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === 'string' &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    ) && (!filter || item[filterKey] === filter)
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      {/* Barra de búsqueda y filtro */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="border p-2 rounded-lg w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border p-2 rounded-lg"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="approved">Aprobados</option>
          <option value="pending">Pendientes</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="border p-3 text-left font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="border hover:bg-gray-50">
                {Object.values(item).map((value, idx) => (
                  <td key={idx} className="border p-3">
                    {React.isValidElement(value) ? value : String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-blue-500 rounded-lg disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span className="text-gray-600">Página {currentPage} de {totalPages}</span>
        <button
          className="px-4 py-2 bg-blue-500 rounded-lg disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
