import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library
import FirstPage from "../Components/landing/firstPage";
import Intro from "../Components/landing/Intro";
import Marq from "../Components/marq2";
import Services from "../Components/landing/Services";
import Team from "../Components/landing/Team";
import Cursor from "../common/cusor";
import ProgressScroll from "../common/ProgressScroll";
import Clients from "../Components/landing/Clients";
import Marq2 from "../Components/marq2";

const Home = () => {
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
      <div id="smooth-wrapper" ref={main}>
        <main className="main-bg o-hidden">
          <FirstPage />
          <Intro />
          <Marq />
          <Services />
          <Team />
          <Clients />
          <Marq2 />
        </main>
      </div>
    </>
  );
};

export default Home;
