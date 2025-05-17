import React from "react";

const isImage = (url) => {
  return /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
};

const DocumentModal = ({ isOpen, onClose, documentUrl }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg overflow-hidden max-w-6xl w-full h-[95vh] relative p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-white bg-red-500 px-3 py-1 rounded"
          onClick={onClose}
        >
          Close
        </button>

        {isImage(documentUrl) ? (
          <img
            src={documentUrl}
            alt="Document Preview"
            className="max-h-[70vh] max-w-[60%] mx-auto object-contain"
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <iframe
            src={documentUrl}
            title="Document Preview"
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts"
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentModal;
