import React, { useState, useEffect } from "react";
import { ref, onChildAdded, remove } from "firebase/database";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { auth, firestoreDB, realtimeDB } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

import Header from "./header";
import ScanAnimation from "./ScanAnimation";
import UserCard from "./UserCard";
import DocumentModal from "./DocumentModal";

export default function AllData() {
  const [instituteData, setInstituteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [rfidLogs, setRfidLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [rfid, setrfid] = useState([]);

  // Get current user and institute info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const sanitizedEmail = user.email.replace(/\./g, "_").replace(/@/g, "_");
        const docRef = doc(firestoreDB, "institute", sanitizedEmail);
        const snapshot = await getDoc(docRef);
        setInstituteData(snapshot.exists() ? snapshot.data() : null);
      } else {
        setCurrentUser(null);
        setInstituteData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to realtimeDB for RFID taps
  useEffect(() => {
    const rfidRef = ref(realtimeDB, "rfid");

    const unsubscribe = onChildAdded(rfidRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.uid) {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);

        setRfidLogs((prev) => {
          const exists = prev.some((log) => log.uid === data.uid);
          return exists ? prev : [...prev, data];
        });

        remove(snapshot.ref).catch((err) =>
          console.error("Failed to remove processed RFID entry:", err)
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch matching documents and push to institute rfidDocs
  useEffect(() => {
    const fetchDocs = async () => {
      if (rfidLogs.length === 0 || !currentUser) return;

      const firestore = getFirestore();
      const rfidDocsRef = collection(firestore, "rfidDocs");

      // Sanitize the email to match Firestore doc ID format
      const sanitizedEmail = currentUser.email.replace(/\./g, "_").replace(/@/g, "_");
      const instituteDocRef = doc(firestore, "institute", sanitizedEmail);

      try {
        const docSnap = await getDoc(instituteDocRef);
        const existingDocs = docSnap.exists() ? docSnap.data().rfidDocs || [] : [];

        
        const existingRequestIds = new Set(existingDocs.map((d) => d.requestId));

        
        const rfidValues = Array.from(new Set(rfidLogs.map((log) => log.uid).filter(Boolean)));

        if (rfidValues.length === 0) return;

        
        const chunks = [];
        for (let i = 0; i < rfidValues.length; i += 10) {
          chunks.push(rfidValues.slice(i, i + 10));
        }

        let newDocs = [];
        for (const chunk of chunks) {
          const q = query(rfidDocsRef, where("rfid", "in", chunk));
          const snapshot = await getDocs(q);
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.requestId && !existingRequestIds.has(data.requestId)) {
              newDocs.push({ id: docSnap.id, ...data });
            }
          });
        }

        if (newDocs.length === 0) return;

        for (const rfidDoc of newDocs) {
          const cleanDoc = JSON.parse(JSON.stringify({
            ...rfidDoc,
            tappedAt: new Date(),
          }));

          // Add to institute's rfidDocs array
          await updateDoc(instituteDocRef, {
            rfidDocs: arrayUnion(cleanDoc),
          });

          // Mark the document as synced
          await updateDoc(doc(rfidDocsRef, rfidDoc.id), {
            syncedToInstitute: true,
            syncedAt: new Date(),
          });
        }

        setrfid((prev) => [...prev, ...newDocs]);
      } catch (error) {
        console.error("Failed to sync new RFID docs:", error);
      }
    };

    fetchDocs();
  }, [rfidLogs, currentUser]);




  useEffect(() => {
    const handleRightClick = (e) => {
      if (selectedDocument) e.preventDefault();
    };
    document.addEventListener("contextmenu", handleRightClick);
    return () => document.removeEventListener("contextmenu", handleRightClick);
  }, [selectedDocument]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header instituteData={instituteData} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              RFID Scanner Status
            </h2>
            <div
              className={`px-3 py-1 text-xs rounded-full ${isScanning ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                }`}
            >
              {isScanning ? "Active Scan" : "Ready to Scan"}
            </div>
          </div>
          <ScanAnimation isScanning={isScanning} />
        </div>

        <div className="mb-8 flex flex-col items-center">
          <div className="w-[90%] flex justify-between items-center mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Scan Information
            </h2>
            <button
              onClick={handleRefresh}
              className="w-32 bg-[#ea2323] text-white font-semibold py-2 rounded-xl hover:bg-[#ec4848] transition"
            >
              Refresh
            </button>
          </div>

          {[...(instituteData?.rfidDocs || [])]
            .reverse()
            .map((log, index) => (
              <UserCard
                key={log.uid || `log-${index}`}
                uid={log.uid}
                timestamp={new Date(log.tappedAt?.seconds * 1000 || Date.now())}
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
