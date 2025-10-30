import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library
import FirstPage from "../Components/landing/firstPage";
import Intro from "../Components/landing/Intro";
import Marq from "../Components/landing/marq";
import Services from "../Components/landing/Services";
import Team from "../Components/landing/Team";
import Cursor from "../common/cusor";
import ProgressScroll from "../common/ProgressScroll";
import Clients from "../Components/landing/Clients";
import Contact from "../Components/landing/Contact";
import Marq2 from "../Components/marq2";
import WhatsAppButton from "../Components/whatsappButton";
import LoadingScreen from "../common/loader";

const Home = () => {
  const main = useRef();
  // useEffect hook to initialize AOS and refresh it
  useEffect(() => {
    AOS.init({
      once: true, // Set animation to occur only once
      duration: 500, // Set animation duration to 300 milliseconds
    });
    AOS.refresh(); // Refresh AOS
  }, []);

  return (
    <>
      <LoadingScreen />
      <Cursor />  
      <ProgressScroll />
      <div id="smooth-wrapper" ref={main}>
        <div id="smooth-content">
        <main className="main-bg o-hidden ">
          <FirstPage />
          <Intro />
          <Marq />
          <Services />
          <Team />
          <Clients />
          <Contact />
          <Marq2 />
        </main>
        </div>
      </div>
      <WhatsAppButton />
    </>
  );
};

export default Home;
