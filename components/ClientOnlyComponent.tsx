'use client'; // Agrega esta línea

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ClientOnlyComponent = () => {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if (pathname !== null) {
      setCurrentPath(pathname);
    } else {
      setCurrentPath(''); // O algún valor por defecto
    }
  }, [pathname]);

  return (
    <div>
      <p>La ruta actual es: {currentPath}</p>
    </div>
  );
};

export default ClientOnlyComponent;
