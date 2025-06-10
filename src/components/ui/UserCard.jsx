import { MapPinIcon, AwardIcon as IdCardIcon, UserIcon } from "lucide-react";
import { DownloadIcon } from "lucide-react"; 

const UserCard = ({ isLatest, log, onViewDocument }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    // Convert Firebase Timestamp to JavaScript Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${day}/${month}/${year} ${time}`;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform mb-10 w-[90%] ${isLatest ? "ring-2 ring-blue-500 scale-100" : "scale-98 opacity-80"
        }`}
    >
      <div
        className={`p-1 text-xs text-white ${isLatest ? "bg-blue-500" : "bg-gray-500"
          }`}
      >
        {isLatest ? "Latest Scan" : "Previous Scan"}
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {log?.profilePic ? (
              <img
                src={log.profilePic}
                alt={log.name || "User"}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-grow">
            {" "}
            
            <h2 className="text-2xl font-bold text-gray-800">
              {log?.name || "Name not shared"}
            </h2>
            
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon size={16} className="mr-2 text-blue-500" />
                <span>{log?.username || "Address not shared"}</span>
              </div>
            </div>
          </div>

          
          <div className="mt-4 md:mt-0 flex flex-col items-start mr-40">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
              <IdCardIcon size={18} className="mr-2 text-blue-500" />
              Documents
            </h3>

            {log?.documents && Object.keys(log.documents).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(log.documents).map(([docId, doc], idx) => (
                  <li
                    key={docId}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">
                      {doc.docName || `Document ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDocument(doc.downloadUrl)}
                        className="ml-2 px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                      >
                        View
                      </button>
                      <a
                        href={doc.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Document"
                      >
                        <DownloadIcon size={20} />
                      </a>
                    </div>
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
              Email : {log.email}
            </div>
            <div>{formatTimestamp(log.tappedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
