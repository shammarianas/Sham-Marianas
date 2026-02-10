import Intro from "./../Components/about-us/Introl";
import Header from "./../Components/about-us/firstPage";
import Numbers from "./../Components/about-us/Numbers";
import Services from "../Components/about-us/aboutServices";
import Team from "./../Components/about-us/Team";
import Clients from "./../Components/about-us/Clients";
import Blog from "./../Components/about-us/Blog";
import Marq2 from "./../Components/marq2";
import Testimonials from "../Components/services/Testimonials";
import SEO from "../common/SEO";
import { SEO_CONFIG } from "../utils/seoConfig";
function AboutUs() {
  return (
    <>
      <SEO {...SEO_CONFIG.about} />
      <Header />
      <Intro />
      <Numbers />
      {/* <Services /> */}
      {/* <Testimonials /> */}

      <Team />

      {/* <Clients /> */}

      {/* <Blog /> */}

      <Marq2 />
    </>
  );
}

export default AboutUs;
