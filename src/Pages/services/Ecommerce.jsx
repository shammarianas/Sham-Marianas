import { useRef } from "react";
import "aos"; // Import AOS (Animate On Scroll) library // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Header from "../../Components/Ecommerce/Header";
import Intro from "../../Components/Ecommerce/Intro";
import EcommerceDev from "../../Components/Ecommerce/EcommerceDev";

export default function PageServicesDetails() {
  useRef();

  return (
    <>
      <Cursor />
      <ProgressScroll />
      <Lines />
      <Header />
      <Intro />
      <EcommerceDev />
      <Marq2 />

    </>
  );
}
