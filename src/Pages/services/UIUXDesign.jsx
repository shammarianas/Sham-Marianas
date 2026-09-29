import { useRef } from "react";
import "aos"; // Import AOS (Animate On Scroll) library // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/UiUx-Design/Intro";
import Header from "../../Components/UiUx-Design/Header";
import UiUx from "../../Components/services/UiUx";

export default function PageServicesDetails() {
  useRef();

  return (
    <>
      <Cursor />
      <ProgressScroll />
      <Lines />
      <Header />
      <Intro />
      <UiUx />
      {/* <Feat /> */}
      <Marq2 />

    </>
  );
}
