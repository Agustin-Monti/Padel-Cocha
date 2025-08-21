'use client'

import React from 'react';
import { Button } from './ui/button';
import { usePathname, useRouter } from 'next/navigation';

interface OfertasProps {
  id_demanda: string | number; 
}

const BotonOfertas: React.FC<OfertasProps> = ({ id_demanda }) => {
  const router : any = useRouter();
  //const pathname = usePathname();

  const handleButtonClick = () => {

   localStorage.setItem('id_demanda', String(id_demanda));

   router.push('/ofertas/new');
  };

  return (
    <div key={id_demanda}>
      <Button
        onClick={handleButtonClick}
        className='bg-cyan-400 py-3 px-5 rounded-lg hover:opacity-90'
      >
        Crear Oferta
      </Button>
    </div>
  );
}

export default BotonOfertas;

