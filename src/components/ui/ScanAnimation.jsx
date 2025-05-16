import React from 'react';

const ScanAnimation = ({ isScanning }) => {
  return (
    <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
      {isScanning && (
        <div 
          className="absolute h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
          style={{
            animation: 'scanning 2s infinite',
            width: '30%',
          }}
        />
      )}
      <style jsx>{`
        @keyframes scanning {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default ScanAnimation;