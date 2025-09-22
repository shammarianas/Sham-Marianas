import React from "react";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const Analytics = () => {
  const [assets, setAssets] = useState([]);

  const fetchAssets = async () => {
    const assetsSnapshot = await getDocs(collection(db, "Assets"));
    const assetsList = assetsSnapshot.docs.map((doc) => doc.data());
    setAssets(assetsList);
  };

  return (
    <div className="page_content">
      <h1>Analytics</h1>
    </div>
  );
};

export default Analytics;
