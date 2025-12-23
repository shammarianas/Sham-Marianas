import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/Product-Design/Intro";
import Header from "../../Components/Product-Design/Header";
import Product from "../../Components/Product-Design/Product-design";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";

export default function PageServicesDetails() {
  const main = useRef();

  return (
    <>
      <SEO {...SEO_CONFIG.productDesign} />
      <body>
        <Cursor />
        <ProgressScroll />
        <Lines />
        <Header />
        <Intro />
        <Product />
        <Marq2 />
      </body>
    </>
  );
}
