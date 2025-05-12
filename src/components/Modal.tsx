import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal = ({ isOpen, children, title }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
