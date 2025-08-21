import React from 'react';

interface ModalVerComprobanteProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const ModalVerComprobante: React.FC<ModalVerComprobanteProps> = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  const isPDF = url.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white w-9 h-9 rounded-full flex items-center justify-center transition"
        >
          ✕
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
            Comprobante de Transferencia
          </h2>
          {isPDF ? (
            <iframe
              src={url}
              className="w-full h-[600px] border rounded-lg"
              title="PDF comprobante"
            />
          ) : (
            <img
              src={url}
              alt="Comprobante"
              className="w-full max-h-[600px] object-contain rounded-lg border"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalVerComprobante;
