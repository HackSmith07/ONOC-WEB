import React, { useState, useEffect } from 'react'
import { ref, onChildAdded } from "firebase/database";
import Header from "./header";
import ScanAnimation from "./ScanAnimation";
import UserCard from "./UserCard";
import DocumentModal from "./DocumentModal";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { auth, firestoreDB, realtimeDB } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';


export default function AllData() {

    const [instituteData, setInstituteData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uid = user.uid;

                try {
                    const instituteRef = collection(firestoreDB, 'institute');
                    const q = query(instituteRef, where('id', '==', uid));

                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        setInstituteData(snapshot.docs[0].data());
                    } else {
                        setInstituteData(null);
                    }
                } catch (error) {
                    console.error("Error fetching user institute data:", error);
                }
            } else {
                setInstituteData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    console.log(instituteData);



    const [rfidLogs, setRfidLogs] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [rfid, setrfid] = useState([]);

    useEffect(() => {
        const rfidRef = ref(realtimeDB, "rfid");

        const unsubscribe = onChildAdded(rfidRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setIsScanning(true);
                setTimeout(() => setIsScanning(false), 2000);
                setRfidLogs((prevLogs) => [...prevLogs, data]);
            }
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        const fetchDocs = async () => {
            if (rfidLogs.length === 0) return;

            const firestore = getFirestore();
            const userinfoRef = collection(firestore, "rfidDocs");

            const uids = [...new Set(rfidLogs.map((log) => log.uid))];
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
            setrfid(results);
        };
        fetchDocs();
    }, [rfidLogs]);

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
                            className={`px-3 py-1 text-xs rounded-full ${isScanning
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-600"
                                }`}
                        >
                            {isScanning ? "Active Scan" : "Ready to Scan"}
                        </div>
                    </div>
                    <ScanAnimation isScanning={isScanning} />
                </div>

                <div className="mb-8 flex flex-col items-center ">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Scan Information
                    </h2>
                    {[...rfid].reverse().map((log, index) => (
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
    )
}
