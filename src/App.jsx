import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onChildAdded } from "firebase/database";
import Header from "./components/ui/header";
import ScanAnimation from "./components/ui/ScanAnimation";
import ScanHistory from "./components/ui/ScanHistory";
import UserCard from "./components/ui/UserCard";

// Firebase config - Replace with your actual config values
const firebaseConfig = {
  apiKey: "AIzaSyCGRrFpJT4ekEWCUGqf_UTHfLh3cq53_nw",
  authDomain: "one-nation-one-card.firebaseapp.com",
  databaseURL: "https://one-nation-one-card-default-rtdb.firebaseio.com",
  projectId: "one-nation-one-card",
  storageBucket: "one-nation-one-card.firebasestorage.app",
  messagingSenderId: "745040048967",
  appId: "1:745040048967:web:1ae895ca2d7e48863c5262",
  measurementId: "G-44B4JCPXQ8"
}

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [rfidLogs, setRfidLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const rfidRef = ref(database, "rfid");

    // Listen for new RFID entries added in the realtime database
    const unsubscribe = onChildAdded(rfidRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Show scanning animation
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);

        // Add new log to the state
        setRfidLogs((prevLogs) => [...prevLogs, data]);
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);


  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      {rfidLogs.map((log, index) => (
        <UserCard
          key={index}
          uid={log.uid}
          timestamp={log.time}
          isLatest={index === 0} // or whatever logic you want
          log={log}
        />
      ))}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-800">RFID Scanner Status</h2>
            <div className={`px-3 py-1 text-xs rounded-full ${isScanning ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {isScanning ? 'Active Scan' : 'Ready to Scan'}
            </div>
          </div>
          <ScanAnimation isScanning={isScanning} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Scan Information</h2>
          <ScanHistory logs={rfidLogs} />
        </div>
      </main>
    </div>
  );
}

export default App;