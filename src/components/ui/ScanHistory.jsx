import React from 'react';
import UserCard from './UserCard';

const ScanHistory = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No RFID scans yet.</p>
        <p className="text-gray-400 text-sm mt-2">Scan a card to see information</p>
      </div>
    );
  }

  // Sort logs by timestamp in descending order (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = a.time ? new Date(a.time).getTime() : 0;
    const timeB = b.time ? new Date(b.time).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="space-y-6">
      {sortedLogs.map((log, index) => (
        <div 
          key={index}
          className={`transition-all duration-500 ${index === 0 ? 'animate-fadeIn' : ''}`}
        >
          <UserCard 
            userData={log.userData || {}}
            uid={log.uid}
            timestamp={log.time || new Date().toISOString()}
            isLatest={index === 0}
          />
        </div>
      ))}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ScanHistory;