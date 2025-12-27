import React, { useEffect, useRef } from "react";
import AOS from "aos"; 
import Lines from "../Components/Lines";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import MarqStock from "../Components/marqStock";
import Header from "../Components/stock/Header";
import SEO from "../common/SEO";
import {SEO_CONFIG} from "../utils/seoConfig";

export default function StockPage() {
  const main = useRef();
  // useEffect hook to initialize AOS and refresh it
  useEffect(() => {
    AOS.init({
      once: true, // Set animation to occur only once
      duration: 300, // Set animation duration to 300 milliseconds
    });
    AOS.refresh(); // Refresh AOS
  }, []);

  return (
    <>
      <SEO {...SEO_CONFIG.templates} />
      <Cursor />
      <ProgressScroll />
      <Lines />
      <Header />
      <MarqStock />
    </>
  );
}
