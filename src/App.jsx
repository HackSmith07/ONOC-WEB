import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onChildAdded } from "firebase/database";
import Header from "./components/ui/header";
import ScanAnimation from "./components/ui/ScanAnimation";
import ScanHistory from "./components/ui/ScanHistory";
import UserCard from "./components/ui/UserCard";
import DocumentModal from "./components/ui/DocumentModal";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
// import {  query, orderByChild, equalTo } from "firebase/database";

// Firebase config - Replace with your actual config values
const firebaseConfig = {
  apiKey: "AIzaSyCGRrFpJT4ekEWCUGqf_UTHfLh3cq53_nw",
  authDomain: "one-nation-one-card.firebaseapp.com",
  databaseURL: "https://one-nation-one-card-default-rtdb.firebaseio.com",
  projectId: "one-nation-one-card",
  storageBucket: "one-nation-one-card.firebasestorage.app",
  messagingSenderId: "745040048967",
  appId: "1:745040048967:web:1ae895ca2d7e48863c5262",
  measurementId: "G-44B4JCPXQ8",
};

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [rfidLogs, setRfidLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [rfid, setrfid] = useState([]);

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


  useEffect(() => {
    const fetchDocs = async () => {
      if (rfidLogs.length === 0) return;

      const firestore = getFirestore();
      const userinfoRef = collection(firestore, "rfidDocs");

      // Extract all unique UIDs from rfidLogs
      const uids = [...new Set(rfidLogs.map((log) => log.uid))];

      // Firestore allows up to 10 values in an 'in' query
      const chunks = [];
      for (let i = 0; i < uids.length; i += 10) {
        chunks.push(uids.slice(i, i + 10));
      }

      let results = [];
      for (const chunk of chunks) {
        const q = query(userinfoRef, where("rfid", "in", chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
      }

      setrfid(results); // setRfid is your state updater
    };

    fetchDocs();
  }, [rfidLogs]); // run whenever rfidLogs updates
  useEffect(() => {
    const handleRightClick = (e) => {
      if (selectedDocument) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleRightClick);

    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, [selectedDocument]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              RFID Scanner Status
            </h2>
            <div
              className={`px-3 py-1 text-xs rounded-full ${
                isScanning
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {isScanning ? "Active Scan" : "Ready to Scan"}
            </div>
          </div>
          <ScanAnimation isScanning={isScanning} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Scan Information
          </h2>
          {/* <ScanHistory logs={rfidLogs} /> */}
          {[...rfid].reverse().map((log, index) => (
            <UserCard
              key={log.uid + index}
              uid={log.uid}
              timestamp={new Date()}
              isLatest={index === 0}
              log={log}
              onViewDocument={setSelectedDocument}
            />
          ))}
        </div>
        <DocumentModal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          documentUrl={selectedDocument}
        />
      </main>
    </div>
  );
}

export default App;
