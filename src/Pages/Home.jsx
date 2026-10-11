import { useEffect, useRef, Suspense } from "react";
import AOS from "aos";
import LoadingScreen from "../common/loader";
import { SEO_CONFIG } from "../utils/seoConfig";
import SEO from "../common/SEO.jsx";

import FirstPage from "../Components/landing/firstPage";
import Intro from "../Components/landing/Intro";
import Marq from "../Components/landing/marq";
import Services from "../Components/landing/Services";
import HowWeWork from "../Components/landing/HowWeWork";

import Team from "../Components/landing/Team";
import Clients from "../Components/landing/Clients";
import FAQ from "../Components/landing/FAQ";
import Marq2 from "../Components/marq2";

import Cursor from "../common/cusor";
import ProgressScroll from "../common/ProgressScroll";
import WhatsAppButton from "../Components/whatsappButton";
import ChatWidget from "../Components/ChatWidget";
import SchemaMarkup from '../Components/SchemaMarkup.jsx';

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
      <SchemaMarkup type="homepage" />
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
              <HowWeWork />
              <Team />
              <Clients />
              <FAQ />
              <Marq2 />
            </main>
          </div>
        </div>
        <WhatsAppButton />
        <ChatWidget />
      </Suspense>
    </>
  );
};

export default Home;
