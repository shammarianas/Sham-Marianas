import Intro from "./../Components/about-us/Introl";
import Header from "./../Components/about-us/firstPage";
import Numbers from "./../Components/about-us/Numbers";
import "../Components/about-us/aboutServices";
import Team from "./../Components/about-us/Team";
import "./../Components/about-us/Clients";
import "./../Components/about-us/Blog";
import Marq2 from "./../Components/marq2";
import "../Components/services/Testimonials";
import SEO from "../common/SEO";
import { SEO_CONFIG } from "../utils/seoConfig";
import SchemaMarkup from "../Components/SchemaMarkup";
function AboutUs() {
  return (
    <>
      <SchemaMarkup type="about" data={SEO_CONFIG.about} />
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
