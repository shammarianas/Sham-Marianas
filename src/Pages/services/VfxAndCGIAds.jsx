import { useRef } from "react";
import "aos"; // Import AOS (Animate On Scroll) library // Import AOS (Animate On Scroll) library

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/VFXCGIAds/Intro";
import Header from "../../Components/VFXCGIAds/Header";
import PhotographyAndVideo from "../../Components/VFXCGIAds/PhotographyAndVideo";

export default function PageServicesDetails() {
  useRef();

  return (
    <>
      <Cursor />
      <ProgressScroll />
      <Lines />
      <Header />
      <Intro />
      <PhotographyAndVideo />
      <Marq2 />
    </>
  );
}
