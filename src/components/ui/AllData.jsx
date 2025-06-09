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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const sanitizedEmail = user.email.replace(/\./g, "_").replace(/@/g, "_");
          const docRef = doc(firestoreDB, "institute", sanitizedEmail);
          const snapshot = await getDoc(docRef);

          if (snapshot.exists()) {
            setInstituteData(snapshot.data());
          } else {
            setInstituteData(null);
          }
        } catch (error) {
          console.error("Error fetching user institute data:", error);
        }
      } else {
        setCurrentUser(null);
        setInstituteData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const rfidRef = ref(realtimeDB, "rfid");

    const unsubscribe = onChildAdded(rfidRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.uid) {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);

        // Avoid duplicates by UID
        setRfidLogs((prevLogs) => {
          const exists = prevLogs.some((log) => log.uid === data.uid);
          return exists ? prevLogs : [...prevLogs, data];
        });

        // Remove processed RFID data
        remove(snapshot.ref).catch((err) =>
          console.error("Failed to remove processed RFID entry:", err)
        );
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDocs = async () => {
      if (rfidLogs.length === 0 || !currentUser) return;

      const firestore = getFirestore();
      const userinfoRef = collection(firestore, "rfidDocs");

      const sanitizedEmail = currentUser.email
        .replace(/\./g, "_")
        .replace(/@/g, "_");
      const instituteDocRef = doc(firestore, "institute", sanitizedEmail);

      try {
        const docSnap = await getDoc(instituteDocRef);
        const existingDocs = docSnap.exists() ? docSnap.data().rfidDocs || [] : [];
        const existingUIDs = new Set(existingDocs.map((d) => d.uid));

        const newUIDs = rfidLogs
          .map((log) => log.uid)
          .filter((uid) => uid && !existingUIDs.has(uid));

        if (newUIDs.length === 0) return;

        const chunks = [];
        for (let i = 0; i < newUIDs.length; i += 10) {
          chunks.push(newUIDs.slice(i, i + 10));
        }

        let newDocs = [];
        for (const chunk of chunks) {
          const q = query(userinfoRef, where("rfid", "in", chunk));
          const snapshot = await getDocs(q);
          snapshot.forEach((doc) => {
            newDocs.push({ id: doc.id, ...doc.data() });
          });
        }

        if (newDocs.length === 0) return;

        for (const rfidDoc of newDocs) {
          await updateDoc(instituteDocRef, {
            rfidDocs: arrayUnion({
              ...rfidDoc,
              tappedAt: new Date(),
            }),
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
      if (selectedDocument) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleRightClick);
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
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
              className={`px-3 py-1 text-xs rounded-full ${
                isScanning ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
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
                key={log.uid ? log.uid.toString() : `log-${index}`}
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
