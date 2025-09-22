import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Header from "../../Components/Web_Development/Header";
import Intro from "../../Components/Web_Development/Intro";
import WebDev from "../../Components/Web_Development/web";


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
        {/* <WebDev/> */}
        <Marq2 />
      </body>
    </>
  );
}
