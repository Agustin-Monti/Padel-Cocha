'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react'; // Ícono moderno
import clsx from 'clsx';

export default function Alerta({
  mensaje,
  visible,
  onClose,
}: {
  mensaje: string;
  visible: boolean;
  onClose?: () => void;
}) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, 3000); // Se oculta a los 3 segundos
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 z-50',
        {
          'opacity-0 pointer-events-none translate-y-10': !show,
          'opacity-100 translate-y-0': show,
        }
      )}
    >
      <CheckCircle className="w-5 h-5" />
      <span>{mensaje}</span>
    </div>
  );
}
