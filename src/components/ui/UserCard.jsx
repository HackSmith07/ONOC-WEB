import React,{ useEffect, useState }  from 'react';
import { UserIcon, CalendarIcon, MapPinIcon, AwardIcon as IdCardIcon } from 'lucide-react';
import {  db } from "../../firebase";
//import { doc, updateDoc, getDocs } from "firebase/firestore";
import { collection, query, where, onSnapshot, } from "firebase/firestore";

const UserCard = ({ uid, timestamp, isLatest, logs }) => {
//   const {
//     name = 'Not shared',
//     age = null,
//     address = 'Not shared',
//     id = 'Not shared',
//     photoUrl = '',
//     occupation = 'Not shared'
//   } = userData || {} ;  

  const[data,setdata]=useState([]);
   useEffect(() => {
  if (!logs?.uid) return;  // wait for logs.uid to exist

  const unsubscribe = onSnapshot(
    query(
      collection(db, "userinfo"),
      where("rfid", "==", logs.uid)  // 👈 match RFID to scanned UID
    ),
    (snapshot) => {
      const receiverData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
        setdata(receiverData[0] || null); // assuming only one match
    }
  );

  return () => unsubscribe();
}, [logs?.uid]); // 👈 rerun when logs.uid changes

console.log(logs)


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
        {/* <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={name} 
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
            <p className="text-gray-600 mb-4">{occupation}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
              {age && (
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon size={16} className="mr-2 text-blue-500" />
                  <span>Age: {age}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon size={16} className="mr-2 text-blue-500" />
                <span>{address}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <IdCardIcon size={16} className="mr-2 text-blue-500" />
                <span>ID: {id}</span>
              </div>
            </div>
          </div>
        </div> */}
         <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <div>
  UID: {uid ? `${uid.substring(0, 12)}${uid.length > 12 ? '...' : ''}` : 'N/A'}
</div>
            <div>{new Date(timestamp).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;