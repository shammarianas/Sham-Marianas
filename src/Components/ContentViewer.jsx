import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../Context/UserProvider";
// import { Button } from "@/components/ui/button";
import { Lock, Eye, Check, Clipboard } from "lucide-react";

const ContentViewer = ({ fileUrl, fileName, fileType, price, id }) => {
  const { currentUser, userProfile } = useUser();
  const [purchased, setPurchased] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isPurchased =
      currentUser?.userProfile?.purchasedItems?.includes(id) || price === 0;
    setPurchased(isPurchased);
  }, [currentUser, userProfile, price, id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* {!purchased && (
        <div className="flex items-center justify-center bg-gray-800 text-gray-400 p-4 rounded-md">
          <Lock className="w-6 h-6 mr-2" />
          <span>Purchase to access this file</span>
        </div>
      )} */}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{fileName}</h2>

        {purchased && (
          <button onClick={handleCopy} className="copy_btn">
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Clipboard className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {purchased && (
        <div className="p-4 rounded-md bg-gray-800">
          {fileType === "graphics" || fileType === "mockups" ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="w-full h-auto rounded-md"
            />
          ) : fileType === "fonts" ? (
            <div className="text-center">
              <p className="text-lg">Preview: {fileName.split(".")[0]}</p>
              <p className="text-4xl" style={{ fontFamily: fileUrl }}>
                AaBbCc
              </p>
            </div>
          ) : fileType === "videos" || fileType === "templates" ? (
            <video controls className="w-full rounded-md">
              <source src={fileUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className="text-gray-400">Unsupported file type</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentViewer;
