import React from 'react';
import { ScanIcon as ScannerIcon } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ScannerIcon size={32} className="text-white" />
          <h1 className="text-3xl font-bold">RFID Dashboard</h1>
        </div>
        <div className="hidden md:block">
          <div className="text-sm text-blue-100">
            Secure Identity Verification System
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;