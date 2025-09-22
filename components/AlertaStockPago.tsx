// components/AlertaStockPago.tsx
import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface AlertaStockPagoProps {
  isOpen: boolean;
  onClose: () => void;
  mensaje: string;
}

const AlertaStockPago: React.FC<AlertaStockPagoProps> = ({ isOpen, onClose, mensaje }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
              <Dialog.Title className="text-lg font-semibold text-red-600 mb-4">
                ¡Lamento informarle que el producto que desea comprar se quedo sin stock en este momento!
              </Dialog.Title>
              <div className="mb-4 whitespace-pre-line">{mensaje}</div>
              <div className="text-right">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AlertaStockPago;
