import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Lines from "../Components/Lines";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import Marq2 from "../Components/marq2";
import Header from "../Components/services/Header";
// import Numbers from "../Components/services/Numbers";
import Intro2 from "../Components/services/Intro2";
// import Services from "../Components/landing/Services";
import Services from "./../Components/services/Services";
import Testimonials from "../Components/services/Testimonials";

export default function PageServices() {
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
      <div id="smooth-wrapper" ref={main}>
        <main className="main-bg o-hidden">
          <Header />
          <Services />
          <Intro2 />
          {/* <Numbers /> */}
          <Testimonials />
          <Marq2 />
        </main>
      </div>
    </>
  );
}
