import "react";
import { Link } from "react-router-dom";

function Services() {
  const services = [
    {
      num: "01",
      slug: "branding-design",
      category: "Branding Design",
      title: "Creative Identity",
      description:
        "For startups and established UAE businesses, we create logos, visual identities and brand guidelines that make your company memorable and consistent across every touchpoint.",
      img: "/assets/imgs/serv-img/1.jpg",
    },
    {
      num: "02",
      slug: "uiux-design",
      category: "UI-UX Design",
      title: "User Experience",
      description:
        "We design clear, user-friendly interfaces for UAE websites and digital products, including wireframes, prototypes and responsive designs that improve usability and conversions.",
      img: "/assets/imgs/serv-img/2.jpg",
    },
    {
      num: "03",
      slug: "web-development",
      category: "Web Development",
      title: "Innovative Solutions",
      description:
        "We build fast corporate websites, landing pages and custom web platforms for Dubai businesses, with responsive development, CMS integration and SEO-ready structure.",
      img: "/assets/imgs/serv-img/3.jpg",
    },
    {
      num: "04",
      slug: "ecommerce-solutions",
      category: "E-Commerce Solutions",
      title: "Seamless Shopping",
      description:
        "We create online stores for UAE brands with product setup, payment integration, mobile-friendly layouts and conversion-focused shopping journeys.",
      img: "/assets/imgs/serv-img/4.jpg",
    },
    {
      num: "05",
      slug: "content-writing",
      category: "Content Writing",
      title: "SEO-Optimized Content",
      description:
        "We write SEO content, website copy, service pages and blogs that match how UAE customers search, helping businesses build authority and attract relevant visitors.",
      img: "/assets/imgs/serv-img/5.jpg",
    },
    {
      num: "06",
      slug: "product-design",
      category: "Product Design",
      title: "User-Centric Design",
      description:
        "We help startups and growing businesses turn ideas into practical digital products through research, user flows, prototypes and interface design.",
      img: "/assets/imgs/serv-img/6.jpg",
    },
    {
      num: "07",
      slug: "social-media-digital-marketing",
      category: "Social Media & Digital Marketing",
      title: "Brand Growth",
      description:
        "We manage strategy, content, campaigns, community engagement and reporting on the platforms popular with audiences in Dubai and across the UAE.",
      img: "/assets/imgs/serv-img/7.jpg",
    },
    {
      num: "08",
      slug: "video-production",
      category: "Photography & Video Production",
      title: "Visual Storytelling",
      description:
        "We produce brand photography, promotional videos and social content for UAE companies that need professional visuals for campaigns, websites and digital channels.",
      img: "/assets/imgs/serv-img/8.jpg",
    },
    {
      num: "09",
      slug: "vfx-and-cgi-ads",
      category: "VFX and CGI Ads",
      title: "High-Impact Visuals",
      description:
        "We create VFX and CGI advertisements for brands that want to explain products, launch campaigns or stand out in Dubai’s competitive digital market.",
      img: "/assets/imgs/serv-img/9.jpg",
    },
    {
      num: "10",
      slug: "print-media-solutions",
      category: "Print Media Solutions",
      title: "Effective Branding",
      description:
        "We design brochures, business stationery, exhibition materials and promotional assets that keep your brand consistent across offline and UAE business environments.",
      img: "/assets/imgs/serv-img/10.jpg",
    },
    {
      num: "11",
      slug: "https://agentixsystem.com/",
      category: "AI & Automation",
      title: "Smart workflows",
      description:
        "We build practical AI workflows, system integrations and business-process automations that reduce repetitive work and help teams operate more efficiently.",
      img: "/assets/imgs/serv-img/11.png",
    },
    {
      num: "12",
      slug: "exhibition-booth-design",
      category: "Exhibition Booth Design",
      title: "Engaging Spaces",
      description:
        "We design exhibition booths for UAE trade shows and business events, including creative concepts, layouts, graphics and branded visitor experiences.",
      img: "/assets/imgs/serv-img/12.png",
    },
  ];

  return (
    <section className="services-inline2 section-padding sub-bg bord-bottom-grd">
      <div className="container ontop">
        <div className="sec-head mb-80">
          <div className="d-flex align-items-center">
            <div>
              <h5 className="fw-600 fz-40 text-u d-rotate wow">
                <span className="rotate-text">
                  Digital Marketing &amp;
                  <br />
                  IT Services in Dubai, UAE
                </span>
              </h5>
              <p className="mt-10 mb-0">
                Sham Marianas is a Dubai-based digital marketing and IT agency
                helping UAE businesses
                <br />
                grow through SEO, paid media, branding,
                web development, social media and AI automation.
              </p>
            </div>
          </div>
        </div>
        {services.map((service, index) => {
          const isExternalLink = /^https?:\/\//i.test(service.slug);
          const serviceLink = isExternalLink ? service.slug : `/services/${service.slug}`;

          return (
            <div className="item" key={index}>
              <div className="row md-marg align-items-end">
                <div className="col-lg-4">
                  <div>
                    <span className="num">{service.num}</span>
                    <div>
                      <span className="sub-title main-color mb-10">
                        {service.category}
                      </span>
                      <h3>
                        {service.title.split(" ")[0]}{" "}
                        <span className="fw-200">
                          {service.title.split(" ")[1] || ""}
                        </span>
                      </h3>
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
                    <img loading="lazy" src={service.img} alt={service.category} />
                    {isExternalLink ? (
                      <a href={serviceLink} target="_blank" rel="noreferrer">
                        <span className="ti-arrow-top-right"></span>
                      </a>
                    ) : (
                      <Link to={serviceLink}>
                        <span className="ti-arrow-top-right"></span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Services;
