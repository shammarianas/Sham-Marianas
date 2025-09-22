import { useEffect, useRef } from "react";

// import ProgressScroll from "../components/common/ProgressScroll";
// import { ScrollSmoother } from 'gsap-trial/ScrollSmoother';

// import Lines from "../Components/Lines";
// import Cursor from "../common/cusor";
import Intro from "../Components/page-team/Intro";
import Header from "../Components/page-team/Header";
import Numbers from "../Components/services/Numbers";
import Marq2 from "../Components/marq2";
import Team from "../Components/about-us/Team";
import { Helmet } from "react-helmet-async";

export default function PageTeam() {
  const main = useRef();

  return (
    <>
      <Helmet>
        <title>Sham Marianas Teams</title>
      </Helmet>
      <body>
        {/* <LoadingScreen /> */}
        {/* <Cursor />
        <Lines /> */}
        <div id="smooth-wrapper" ref={main}>
          <div id="smooth-content">
            <main className="main-bg o-hidden">
              <Header />
              <Intro />
              <Numbers />
              <Team />
              <Marq2 />
            </main>
          </div>
        </div>
      </body>
    </>
  );
}
