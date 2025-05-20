import React, { useEffect } from 'react';

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: {
      container: 'bg-green-50 border border-green-200',
      icon: 'text-green-400',
      text: 'text-green-800',
      button: 'text-green-500 hover:bg-green-100'
    },
    error: {
      container: 'bg-red-50 border border-red-200',
      icon: 'text-red-400',
      text: 'text-red-800',
      button: 'text-red-500 hover:bg-red-100'
    },
    warning: {
      container: 'bg-yellow-50 border border-yellow-200',
      icon: 'text-yellow-400',
      text: 'text-yellow-800',
      button: 'text-yellow-500 hover:bg-yellow-100'
    },
    info: {
      container: 'bg-blue-50 border border-blue-200',
      icon: 'text-blue-400',
      text: 'text-blue-800',
      button: 'text-blue-500 hover:bg-blue-100'
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const style = alertStyles[type] || alertStyles.info;

  return (
    <div className={`fixed bottom-8 right-10 z-50 rounded-lg shadow-lg animate-fade-in-up ${style.container}`}>
      <div className="p-4 flex items-center">
        <div className={`flex-shrink-0 ${style.icon}`}>
          {type === 'success' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className={`ml-3 ${style.text}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 focus:outline-none ${style.button}`}
          >
            <span className="sr-only">Tutup</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;