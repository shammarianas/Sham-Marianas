import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/Digital-Marketing/Intro";
import Header from "../../Components/Digital-Marketing/Header";
import Digital from "../../Components/Digital-Marketing/Digital-Marketer";

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
        <Digital />
        <Marq2 />
      </body>
    </>
  );
}
