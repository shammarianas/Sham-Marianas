import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/AiAutomation/Intro";
import Header from "../../Components/AiAutomation/Header";
import AiAutomation from "../../Components/AiAutomation/AiAutomation";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";
import SchemaMarkup from "../../common/SchemaMarkup";

export default function PageServicesDetails() {
  const main = useRef();

  return (
    <>
      <SEO {...SEO_CONFIG.aiAutomation} />
 
        <Cursor />
        <ProgressScroll />
        <Lines />
        <Header />
        <Intro />
        <AiAutomation />
        <Marq2 />
    
    </>
  );
}
