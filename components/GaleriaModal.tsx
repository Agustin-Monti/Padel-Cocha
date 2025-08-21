import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { obtenerImagenesProducto, eliminarImagenGaleria  } from '@/actions/productos-actions';
import { TrashIcon, PhotoIcon } from '@heroicons/react/24/solid';

type GaleriaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productoId: string;
};


const GaleriaModal = ({ isOpen, onClose, productoId }: GaleriaModalProps) => {
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<FileList | null>(null);

  useEffect(() => {
    const fetchGaleria = async () => {
      if (productoId && isOpen) {
        const urls = await obtenerImagenesProducto(productoId);
        setImagenes(urls);
      }
    };

    fetchGaleria();
  }, [isOpen, productoId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setArchivosSeleccionados(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (archivosSeleccionados) {
      const formData = new FormData();
      Array.from(archivosSeleccionados).forEach((file, i) => {
        console.log('Agregando archivo:', file.name, 'Tamaño:', file.size);
        formData.append('files', file); // intenta también con 'files[]'
      });
      formData.append('productoId', productoId);

      try {
        const response = await fetch('/api/subir_imagenes', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log('Respuesta de subida:', data);

        if (data.success) {
          setImagenes((prevImagenes) => [...prevImagenes, ...data.urls]);
          setArchivosSeleccionados(null);
        } else {
          console.error('Error en subida:', data.error);
          alert('Error al subir las imágenes: ' + data.error);
        }
      } catch (err) {
        console.error('Error al enviar solicitud:', err);
        alert('Error en la solicitud al servidor');
      }
    } else {
      console.warn('No se seleccionaron archivos');
    }
  };


  const handleDelete = (productoId: string, imgUrl: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminarla',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700',
        cancelButton: 'bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarImagenGaleria(productoId, imgUrl).then(() => {
          setImagenes((prevImagenes) => prevImagenes.filter((img) => img !== imgUrl));
        }).catch((error) => {
          alert('Error al eliminar la imagen: ' + error);
        });
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-5/6 max-w-5xl h-auto max-h-[80vh] overflow-y-auto relative">
        
        {/* Contenedor de la X en la esquina superior derecha */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="pb-1"
          >
            ✖
          </button>
        </div>
  
        <h2 className="text-2xl font-semibold text-center mb-4 text-black">
          <PhotoIcon className="w-6 h-6" />Galería del Producto "<span className='text-black'>{productoId}</span>"
        </h2>
  
        {/* Parte superior: Seleccionar Archivos */}
        <div className="mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*"
            className="border border-gray-300 p-2 rounded-md w-full mb-2"
          />
  
          {/* Vista previa de las imágenes seleccionadas */}
          {archivosSeleccionados && archivosSeleccionados.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Vista Previa</h3>
              <div className="flex gap-4">
                {Array.from(archivosSeleccionados).map((file, index) => (
                  <div key={index} className="text-center">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Vista previa ${index + 1}`}
                      className="max-w-[100px] max-h-[100px] object-cover rounded-md mb-2"
                    />
                    <span className="text-sm text-gray-500">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          <button
            onClick={handleUpload}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Subir Imágenes
          </button>
        </div>
  
        <div>
          <h3 className="text-xl font-semibold mb-2 text-center text-black">Imágenes Agregadas</h3>
          <div className="grid grid-cols-3 gap-4">
            {imagenes.length > 0 ? (
              imagenes.map((imgUrl, index) => (
                <div key={index} className="relative group">
                  {/* Imagen */}
                  <img
                    src={imgUrl}
                    alt={`Imagen ${index + 1}`}
                    className="max-w-[170px] max-h-[170px] object-cover rounded-md mb-2"
                  />
  
                  {/* Botón eliminar debajo de la imagen */}
                  <div className="text-center mt-2">
                    <button
                      onClick={() => handleDelete(productoId, imgUrl)} // Llamada a la función eliminarImagenGaleria
                      className="text-red"
                    >
                      <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-black text-center">No hay imágenes agregadas aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  
  
  
};

export default GaleriaModal;
