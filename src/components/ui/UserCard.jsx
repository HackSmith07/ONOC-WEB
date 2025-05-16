import React, { useEffect, useState } from 'react';
import { MapPinIcon, AwardIcon as IdCardIcon, UserIcon } from 'lucide-react';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestoreDB } from "../../firebase";

const UserCard = ({ uid, timestamp, isLatest, log }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!log?.uid) return;

    const unsubscribe = onSnapshot(
      query(
        collection(firestoreDB, "userinfo"),
        where("rfid", "==", log.uid)
      ),
      (snapshot) => {
        const receiverData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(receiverData[0] || null);
      }
    );

    return () => unsubscribe();
  }, [log?.uid]);

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform ${
        isLatest ? 'ring-2 ring-blue-500 scale-100' : 'scale-98 opacity-80'
      }`}
    >
      <div className={`p-1 text-xs text-white ${isLatest ? 'bg-blue-500' : 'bg-gray-500'}`}>
        {isLatest ? 'Latest Scan' : 'Previous Scan'}
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {data?.profilePic ? (
              <img
                src={data.profilePic}
                alt={data.name || 'User'}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
              </div>
            )}
          </div>

     <div className="flex-grow">      {/* Name and documents in one row */}

       <h2 className="text-2xl font-bold text-gray-800">
          {data?.name || 'Name not shared'}
       </h2>

   {/* Address and other info below */}
  <div className="flex flex-col md:flex-row md:items-start md:gap-8">

    <div className="flex items-center text-sm text-gray-600">
      <MapPinIcon size={16} className="mr-2 text-blue-500" />
      <span>{data?.username|| 'Address not shared'}</span>
    </div>
  </div>
  </div>

{/* Documents Section */}
<div className="mt-4 md:mt-0 flex flex-col items-start mr-40">
  <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
    <IdCardIcon size={18} className="mr-2 text-blue-500" />
    Documents
  </h3>

  {data?.uploadedDocuments && Object.keys(data.uploadedDocuments).length > 0 ? (
    <ul className="space-y-2">
      {Object.entries(data.uploadedDocuments).map(([docId, doc], idx) => (
        <li
          key={docId}
          className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
        >
          <span className="text-sm text-gray-700">{doc.name || `Document ${idx + 1}`}</span>
          <a
            href={doc.path}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            View
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-400">No documents uploaded</p>
  )}
</div>
 
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <div>
              UID: {uid ? `${uid.substring(0, 12)}${uid.length > 12 ? '...' : ''}` : 'N/A'}
            </div>
            <div>{timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
