import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { obtenerImagenesProducto, eliminarImagenGaleria } from '@/actions/productos-actions';
import { 
  TrashIcon, 
  PhotoIcon, 
  XMarkIcon,
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type GaleriaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productoId: string;
  productoNombre?: string;
};

const GaleriaModal = ({ isOpen, onClose, productoId, productoNombre }: GaleriaModalProps) => {
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Efecto para obtener imágenes
  useEffect(() => {
    const fetchGaleria = async () => {
      if (productoId && isOpen) {
        setIsLoading(true);
        try {
          const urls = await obtenerImagenesProducto(productoId);
          setImagenes(urls);
        } catch (error) {
          console.error('Error obteniendo imágenes:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las imágenes',
            confirmButtonColor: '#3b82f6',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGaleria();
  }, [isOpen, productoId]);

  // Efecto para prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setArchivosSeleccionados(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (!archivosSeleccionados) return;

    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(archivosSeleccionados).forEach((file) => {
      formData.append('files', file);
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
        // Agregar nuevas imágenes al estado
        setImagenes((prevImagenes) => [...prevImagenes, ...data.urls]);
        setArchivosSeleccionados(null);
        
        // Mostrar notificación de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Imágenes subidas!',
          text: `${archivosSeleccionados.length} imagen(es) agregada(s) correctamente`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
          background: '#10b981',
          color: 'white',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Error al subir las imágenes',
          confirmButtonColor: '#3b82f6',
        });
      }
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (productoId: string, imgUrl: string, index: number) => {
    Swal.fire({
      title: '¿Eliminar imagen?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-6 py-2.5 rounded-lg',
        cancelButton: 'px-6 py-2.5 rounded-lg',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsDeleting(imgUrl);
        try {
          await eliminarImagenGaleria(productoId, imgUrl);
          
          // Actualizar estado local
          setImagenes((prevImagenes) => prevImagenes.filter((img) => img !== imgUrl));
          
          // Mostrar notificación de éxito
          Swal.fire({
            icon: 'success',
            title: '¡Eliminada!',
            text: 'La imagen ha sido eliminada',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            background: '#10b981',
            color: 'white',
          });
        } catch (error: any) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Error al eliminar la imagen',
            confirmButtonColor: '#3b82f6',
          });
        } finally {
          setIsDeleting(null);
        }
      }
    });
  };

  const handleClearSelection = () => {
    setArchivosSeleccionados(null);
  };

  const openFullscreen = (imgUrl: string) => {
    setSelectedImage(imgUrl);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setSelectedImage(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay con backdrop blur */}
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Contenedor del Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all">
            
            {/* Header del Modal */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <PhotoIcon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Galería del Producto
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {productoNombre || `ID: ${productoId}`} • {imagenes.length} imagen(es)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openFullscreen('')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Ver en pantalla completa"
                  >
                    <ArrowsPointingOutIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-8">
              {/* Sección de Subida */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Subir nuevas imágenes
                  </h3>
                  {archivosSeleccionados && (
                    <button
                      onClick={handleClearSelection}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Limpiar selección
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Drop Zone */}
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`block border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50 ${
                        archivosSeleccionados 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                          <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {archivosSeleccionados 
                              ? `${archivosSeleccionados.length} archivo(s) seleccionado(s)`
                              : 'Arrastra o haz clic para seleccionar imágenes'}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, JPEG hasta 10MB cada una
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Vista Previa */}
                  {archivosSeleccionados && archivosSeleccionados.length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                        Vista Previa ({archivosSeleccionados.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from(archivosSeleccionados).map((file, index) => (
                          <div key={index} className="group relative">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Vista previa ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="mt-2 text-center">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón de Subida */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleUpload}
                      disabled={!archivosSeleccionados || isUploading || archivosSeleccionados.length === 0}
                      className={`inline-flex items-center justify-center px-8 py-3 rounded-xl font-medium transition-all ${
                        !archivosSeleccionados || archivosSeleccionados.length === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                          Subir {archivosSeleccionados ? `(${archivosSeleccionados.length})` : ''}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm font-medium text-gray-500">
                    Imágenes en la galería
                  </span>
                </div>
              </div>

              {/* Galería de Imágenes */}
              <div>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Cargando galería...</p>
                  </div>
                ) : imagenes.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {imagenes.length} {imagenes.length === 1 ? 'imagen' : 'imágenes'} en la galería
                      </h3>
                      <div className="text-sm text-gray-500">
                        Haz clic para ampliar
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {imagenes.map((imgUrl, index) => (
                        <div 
                          key={index} 
                          className="group relative bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                          {/* Imagen con efecto hover */}
                          <div 
                            className="aspect-square cursor-zoom-in overflow-hidden"
                            onClick={() => openFullscreen(imgUrl)}
                          >
                            <img
                              src={imgUrl}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Botón eliminar con overlay */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleDelete(productoId, imgUrl, index)}
                              disabled={isDeleting === imgUrl}
                              className={`p-2 rounded-full shadow-lg transition-all ${
                                isDeleting === imgUrl
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-white/90 hover:bg-white hover:scale-110'
                              }`}
                              title="Eliminar imagen"
                            >
                              {isDeleting === imgUrl ? (
                                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <TrashIcon className="w-5 h-5 text-red-600" />
                              )}
                            </button>
                          </div>

                          {/* Número de imagen */}
                          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                      <PhotoIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Galería vacía
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      No hay imágenes en la galería. Sube imágenes usando el formulario superior.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Máximo 10 imágenes por producto
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Fullscreen */}
      {isFullscreen && selectedImage && (
        <div className="fixed inset-0 z-[60] bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Botones de control */}
            <button
              onClick={closeFullscreen}
              className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white z-10 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            {/* Imagen */}
            <div className="max-w-[90vw] max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Imagen ampliada"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Contador */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {imagenes.indexOf(selectedImage) + 1} / {imagenes.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GaleriaModal;
