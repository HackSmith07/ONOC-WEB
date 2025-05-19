import React from 'react';
import { ScanIcon as ScannerIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // adjust path if needed
import { useNavigate } from 'react-router-dom';


const Header = ({instituteData}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ScannerIcon size={50} className="text-white" />
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{instituteData.name}</h1>
            <h1 className="text-l font-bold">@{instituteData.username}</h1>
          </div>
        </div>
        <div className="flex items-center justify-between space-x-8">
          <div className="hidden md:block">
            <div className="text-sm text-blue-100">
              Secure Identity Verification System
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-32 bg-[#ea2323] text-white font-semibold py-2 rounded-xl hover:bg-[#ec4848] transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
