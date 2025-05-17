import React from "react";

const isImage = (url) => {
  return /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
};

const DocumentModal = ({ isOpen, onClose, documentUrl }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-7xl w-full h-[90vh] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-white bg-red-500 px-3 py-1 rounded z-10"
          onClick={onClose}
        >
          Close
        </button>

        <div className="w-full h-full flex justify-center items-center p-4">
          {isImage(documentUrl) ? (
            <img
              src={documentUrl}
              alt="Document Preview"
              className="max-h-full max-w-full object-contain"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <iframe
              src={documentUrl}
              title="Document Preview"
              className="w-[100%] h-[100%]"
              sandbox="allow-same-origin allow-scripts"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
