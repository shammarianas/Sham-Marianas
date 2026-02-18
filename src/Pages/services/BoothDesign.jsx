import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/BoothDesign/Intro";
import Header from "../../Components/BoothDesign/Header";
import BoothDesign from "../../Components/BoothDesign/BoothDesign";


export default function PageServicesDetails() {
  const main = useRef();

  return (
    <>

      <Cursor />
      <ProgressScroll />
      <Lines />
      <Header />
      <Intro />
      <BoothDesign />
      <Marq2 />

    </>
  );
}
