import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Header from "../../Components/Ecommerce/Header";
import Intro from "../../Components/Ecommerce/Intro";
import EcommerceDev from "../../Components/Ecommerce/EcommerceDev";

export default function PageServicesDetails() {
  const main = useRef();

  return (
    <>
      <body>
        <Cursor />
        <ProgressScroll />
        <Lines />
        <Header />
        <Intro />
        <EcommerceDev />
        <Marq2 />
      </body>
    </>
  );
}
