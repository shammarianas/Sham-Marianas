import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/PrintMedia/Intro";
import Header from "../../Components/PrintMedia/Header";
import PhotographyAndVideo from "../../Components/PrintMedia/PhotographyAndVideo";

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
        <PhotographyAndVideo />
        <Marq2 />
      </body>
    </>
  );
}
