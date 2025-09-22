import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library
// import image from "../assets/Images/b8.jpg";
import Lines from "../Components/Lines";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import Marq2 from "../Components/marq2";
import Header from "../Components/stock/Header";

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
      <Cursor />
      <ProgressScroll />
      <Lines />
      <Header />
      <Marq2 />
    </>
  );
}
