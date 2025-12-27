// components/CustomModal.jsx
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import React from 'react';

const CustomModal = ({ visible, onClose, title, message }) => {
  if (!visible) return null;

  // Determinar o ícone e a cor com base no título (pode ser ajustado)
  const isError = title.toLowerCase().includes('erro');
  const Icon = isError ? AlertTriangle : CheckCircle;
  const iconColor = isError ? 'text-red-500' : 'text-green-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md">
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <div className="flex items-center">
            <Icon className={`w-6 h-6 mr-2 ${iconColor}`} />
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;