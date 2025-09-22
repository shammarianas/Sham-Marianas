"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const PrintMediaPage = () => {
  const sectionOne = {
    title: "From Concept to Impact Print That Drives Success",
    paragraphs: [
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we transform print into powerful brand experiences. Each project is
        approached with a single goal in mind: to design materials that not only
        stand out but also work tirelessly to elevate your brand. Whether
        launching a bold campaign or showcasing your latest product, our print
        solutions are engineered to captivate, build trust, and spark
        engagement.
      </>,
      "We take care of everything — from initial concept and creative ideation to design, production, and delivery — ensuring your print materials are aligned with your brand’s voice, laser-focused on your message, and optimized for maximum impact. Because great print isn’t just a visual; it’s a strategic tool that moves your brand forward.",
    ],
    image: "/assets/imgs/PrintMediaSolution/010.png",
  };

  const sectionTwo = {
    title: "Print That Captivates and Converts",
    paragraphs: [
      <>
        Print isn’t just paper and ink — it’s your brand’s chance to make a
        lasting impression. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we craft more than just visually striking materials; we create
        experiences that connect, resonate, and move your audience to act. From
        bold, captivating visuals to precisely crafted messaging, every piece is
        designed to stop the scroll, ignite curiosity, and inspire action.
      </>,
      "Whether it’s a sleek brochure, a powerful business card, or a standout flyer, every design is carefully tailored to leave a lasting mark. We blend cutting-edge design with smart marketing strategy, ensuring your print materials don’t just look great — they perform and deliver measurable results.",
    ],
    image: "/assets/imgs/PrintMediaSolution/0010.png",
  };
  const faqs = [
    {
      question: "Why Are Print Media Solutions Necessary?",
      answer:
        "In today’s digital world, print media solutions create a lasting, tangible connection that digital ads can’t. Materials like brochures, business cards, and posters build trust, leave a memorable impression, and make your brand stand out with a personal touch.",
    },
    {
      question: "What makes your print media solutions different from others?",
      answer:
        "Our focus is on creating impactful print that not only looks great but also works hard to elevate your brand. We combine creative excellence with strategic marketing, ensuring that every print piece is purposeful, memorable, and drives business growth.",
    },
    {
      question: "Can I get short-run prints or bulk printing?",
      answer:
        "We offer both short-run and bulk printing options depending on your needs. Whether you need a few items for a special event or a large batch for a nationwide campaign, we have you covered.",
    },
    {
      question: "How do you ensure the print materials align with my brand?",
      answer:
        "Our design process involves understanding your brand’s identity, voice, and goals. We collaborate closely with you from the first idea to the finished print, making sure that every piece reflects your brand and appeals to your target market.",
    },
    {
      question: "How do I get started with your print media services?",
      answer:
        "To get started, simply reach out through our contact form or schedule a discovery call. We’ll discuss your vision, goals, and how our print media solutions can help you make an impact.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="Print Media"
        highlightedText="Solutions"
        backgroundImage="/assets/imgs/background/bg5.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Print That Powers Your Brand — "
        highlightedWords={["Creative, Strategic, and Impactful"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we transform your brand vision into reality with print media
            solutions that captivate and convert. Our design process blends bold
            creativity with strategic thinking to create print materials that
            not only look stunning but also drive business results. Whether you
            need a high-impact brochure or a sleek business card, we craft print
            experiences that demand attention and leave a lasting impression.
          </>,
          "From concept to final print, we ensure every piece is crafted with purpose — capturing your brand’s essence while inspiring action. Print media isn’t just about aesthetics; it’s about creating materials that move your audience, and that’s exactly",
          "what we deliver",
          "just look good… It leaves a lasting mark.",
        ]}
        listItems={[
          "Brochure & Catalog Design",
          "Business Cards & Stationery",
          "Flyers, Posters & Banners",
          "Packaging & Labels",
          "Magazines & Booklets",
          "Event & Corporate Print Collateral",
          "Billboard & Signboard",
          "Digital Printing & Offset Printing",
          "Screen Printing",
          "Laser Printing",
        ]}
        imageSrc="/assets/imgs/PrintMediaSolution/10.png"
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

export default PrintMediaPage;
