import React from "react";
import { Link } from "react-router-dom";

function Services() {
  const services = [
    {
      num: "01",
      slug: "branding",
      category: "Branding Design",
      title: "Creative Identity",
      description:
        "Our branding design creates strong brand identities that attract audiences, build recognition, and grow businesses for long-term success.",
      img: "/assets/imgs/serv-img/1.jpg",
    },
    {
      num: "02",
      slug: "uiux-design",
      category: "UI-UX Design",
      title: "User Experience",
      description:
        "We offer UI/UX design that creates smooth, user-friendly experiences that boost engagement, conversions, and brand success, making every interaction seamless and enjoyable.",
      img: "/assets/imgs/serv-img/2.jpg",
    },
    {
      num: "03",
      slug: "web-design",
      category: "Web Development",
      title: "Innovative Solutions",
      description:
        "At Sham Marianas, we build cutting-edge web development solutions that blend innovation, performance, and seamless user experiences to help businesses thrive online.",
      img: "/assets/imgs/serv-img/3.jpg",
    },
    {
      num: "04",
      slug: "ecommerce",
      category: "E-Commerce Solutions",
      title: "Seamless Shopping",
      description:
        "We build e-commerce solutions that make online selling seamless and profitable. Our expert services enhance customer reach, conversions, and sales growth",
      img: "/assets/imgs/serv-img/4.jpg",
    },
    {
      num: "05",
      slug: "content",
      category: "Content Writing",
      title: "SEO-Optimized Content",
      description:
        "We create SEO-friendly content writing that captures attention, builds authority, and boosts online presence.",
      img: "/assets/imgs/serv-img/5.jpg",
    },
    {
      num: "06",
      slug: "product",
      category: "Product Design",
      title: "User-Centric Design",
      description:
        "We provide the best product design, creating seamless, user-focused experiences that drive engagement, innovation, and business success.",
      img: "/assets/imgs/serv-img/6.jpg",
    },
    {
      num: "07",
      slug: "digital",
      category: "Social Media & Digital Marketing",
      title: "Brand Growth",
      description:
        "We help businesses grow with social media & digital marketing, increasing brand awareness, interaction, and online reach.",
      img: "/assets/imgs/serv-img/7.jpg",
    },
    {
      num: "08",
      slug: "video-production",
      category: "Photography & Video Production",
      title: "Visual Storytelling",
      description:
        "We deliver photography & video production that captures your brand’s story, enhancing engagement, visibility, and trust with high-impact visuals.",
      img: "/assets/imgs/serv-img/8.jpg",
    },
    {
      num: "09",
      slug: "vfx",
      category: "VFX and CGI ADs",
      title: "High-Impact Visuals",
      description:
        "We design eye-catching VFX and CGI ads that boost brand visibility, engagement, and audience impact with stunning, high-quality visuals.",
      img: "/assets/imgs/serv-img/9.jpg",
    },
    {
      num: "10",
      slug: "printing",
      category: "Print Media Solution",
      title: "Effective Branding",
      description:
        "We craft print media solutions that boost brand visibility, marketing impact, and audience engagement with high-quality designs and materials.",
      img: "/assets/imgs/serv-img/10.jpg",
    },
  ];

  return (
    <section className="services-inline2 section-padding sub-bg bord-bottom-grd">
      <div className="container ontop">
        <div className="sec-head mb-80">
          <div className="d-flex align-items-center">
            <div>
              <span className="sub-title main-color mb-5">
                Our Specializations
              </span>
              <h3 className="fw-600 fz-50 text-u d-rotate wow">
                <span className="rotate-text">
                  Featured <span className="fw-200">Services</span>
                </span>
              </h3>
            </div>
          </div>
        </div>
        {services.map((service, index) => (
          <div className="item" key={index}>
            <div className="row md-marg align-items-end">
              <div className="col-lg-4">
                <div>
                  <span className="num">{service.num}</span>
                  <div>
                    <span className="sub-title main-color mb-10">
                      {service.category}
                    </span>
                    <h2>
                      {service.title.split(" ")[0]}{" "}
                      <span className="fw-200">
                        {service.title.split(" ")[1] || ""}
                      </span>
                    </h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="text md-mb80">
                  <p>{service.description}</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="img">
                  <img src={service.img} alt={service.category} />
                  <Link to={`/services/${service.slug}`}>
                    <span className="ti-arrow-top-right"></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;
