"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const WebDevelopmentPage = () => {
  const sectionOne = {
    title: "Your Website is Your — Business’s Digital Powerhouse",
    paragraphs: [
      "In today’s fast-moving digital world, your website is your 24/7 storefront. A well-developed website builds trust, shows credibility, and gives visitors a smooth, satisfying experience — no matter the device or browser.",
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we combine fast performance, modern design, and strong SEO foundations
        to build websites that attract, engage, and convert. Whether it’s your
        first site or a full redesign, we help you stay ahead of the competition
        and grow with confidence.
      </>,
    ],
    image: "/assets/imgs/WebDev/03.png",
  };

  const sectionTwo = {
    title: "Unlock Your Business’s Potential with a High-Performing Website",
    paragraphs: [
      "In today’s fast-moving digital world, your website is the face of your business online. With attention spans shrinking and competition growing, having a well-designed website can make all the difference.",

      <>
        {" "}
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we build websites that not only look amazing but also work flawlessly.
        We focus on fast load times, mobile-friendly designs, and smooth
        navigation. Plus, our websites are search engine optimized (SEO), so
        they’re built to rank higher and bring in more traffic. Our goal is to
        create a website that’s easy to use and designed to turn visitors into
        loyal customers.
      </>,
      "Simply put — if your website isn’t delivering results, it’s holding you back. Don’t let your online presence fall behind — let us help you stand out in today’s competitive digital world.",
    ],
    image: "/assets/imgs/WebDev/003.png",
  };
  const faqs = [
    {
      question: "Can you build custom websites for my business?",
      answer:
        "Yes, we specialize in custom website development tailored to your business needs. Whether you need a simple website or a complex web application, we ensure the design and functionality align with your brand’s goals.",
    },
    {
      question: "Can you help improve my website’s SEO?",
      answer:
        "Yes, our web development services include SEO optimization to enhance your website’s visibility on search engines. We ensure that your site’s structure, content, and performance align with SEO best practices, helping you rank higher in search results.",
    },
    {
      question: "Do you provide ongoing website support?",
      answer:
        "Yes, we offer website maintenance and support services to keep your site secure, up-to-date, and functioning smoothly. From bug fixes to content updates, we ensure that your website runs optimally.",
    },
    {
      question: "Will my website be mobile-friendly?",
      answer:
        "Absolutely! All websites we create are responsive and mobile-friendly, ensuring a seamless experience for your users, whether they’re accessing your site from a desktop, tablet, or smartphone.",
    },
    {
      question: "How long does it take to create a website?",
      answer:
        "The length of time required depends on how complicated the project is. Typically, it takes 4-8 weeks, including design, development, and testing, to create a high-quality, fully functional website.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="Web Development"
        backgroundImage="/assets/imgs/background/b2.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Building Websites "
        highlightedWords={["That", " ", " Work"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we create websites that do more than just look great they load fast,
            run smoothly on all devices, and leave a strong first impression.
            With responsive layouts, clean code, and SEO-friendly structures,
            your site will not only look professional but also rank higher and
            perform consistently across all browsers.
          </>,
          "We build digital experiences that grow with your business. From fully customized designs that reflect your brand’s voice to smart features like booking systems, forms, and online stores — everything is tailored to your needs. You’ll have full control to update your content easily, without any tech skills just real results.",
        ]}
        listItems={[
          "Ibexa DXP Development",
          // "Sharepoint Development",
          "Wordpress Development",
          // "Sitecore Development",
          "Ruby on Rails Development",
          "CMS Development",
          // "Laravel Development",
          // "PHP Development",
          "Python, PHP , Laravel Development",
          "Website Maintenance",
          "Enterprise Development",
          // "Pentesting",
          // "WhatsApp Integration",
          "Drupal Development",
          "ASP.Net Development",
          "AngularJS Development",
        ]}
        imageSrc="/assets/imgs/WebDev/3.png"
        imageAlt="Intro branding"
      />
      <BrandingContentSection sectionOne={sectionOne} sectionTwo={sectionTwo} />
      <div className="bord-bottom-grd pb-40 pt-40 ontop"></div>
      <FAQAccordion
        title="Frequently Asked Questions"
        faqs={faqs}
        imageSrc="/assets/imgs/FAQ.png"
      />
      ;
      <Marq2 />
    </>
  );
};

export default WebDevelopmentPage;
