import Intro from "./../Components/about-us/Introl";
import Header from "./../Components/about-us/firstPage";
import Numbers from "./../Components/about-us/Numbers";
import Services from "./../Components/about-us/Services";
import Team from "./../Components/about-us/Team";
import Clients from "./../Components/about-us/Clients";
import Blog from "./../Components/about-us/Blog";
import Marq2 from "./../Components/marq2";
import Testimonials from "../Components/services/Testimonials";
function AboutUs() {
  return (
    <>
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
