import React, { useEffect, useRef, Suspense, lazy } from "react";
import AOS from "aos";
import LoadingScreen from "../common/loader";
import { SEO_CONFIG } from "../utils/seoConfig";
import SEO from "../common/SEO.jsx";

import FirstPage from "../Components/landing/firstPage";
import Intro from "../Components/landing/Intro";

// ✅ 1. Sabhi heavy components ko LAZY load karein
const Marq = lazy(() => import("../Components/landing/marq"));
const Services = lazy(() => import("../Components/landing/Services"));
const Team = lazy(() => import("../Components/landing/Team"));
const Clients = lazy(() => import("../Components/landing/Clients"));
const Contact = lazy(() => import("../Components/landing/contact"));
const Marq2 = lazy(() => import("../Components/marq2"));

// Common components (chote hain toh direct rehne dein)
import Cursor from "../common/cusor";
import ProgressScroll from "../common/ProgressScroll";
import WhatsAppButton from "../Components/whatsappButton";

const Home = () => {
  const main = useRef();

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 500,
    });
    AOS.refresh();
  }, []);

  return (
    <>
      <SEO {...SEO_CONFIG.home} />
      
      {/* ✅ 2. Suspense ke andar saara main content rakhen */}
      <Suspense fallback={<LoadingScreen />}>
        <Cursor />
        <ProgressScroll />
        <div id="smooth-wrapper" ref={main}>
          <div id="smooth-content">
            <main className="main-bg o-hidden">
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
      </Suspense>
    </>
  );
};

export default Home;