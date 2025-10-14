"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const BoothDesignPage = () => {
  const sectionOne = {
    title: "The Importance of Exhibition Booth Design",
    paragraphs: [
      "Your exhibition booth isn’t just a display, it’s your first impression. In a busy exhibition hall, hundreds of brands are competing for attention. What makes people stop at your booth is design that connects instantly.",
      <>
        A well-designed booth doesn’t just attract visitors; it keeps them engaged. It builds trust, sparks curiosity, and gives people a reason to remember your brand. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>, we design booths that balance creativity and clarity, so your space feels open, inviting, and aligned with your brand identity.
      </>,
      "When your booth feels well-designed, your audience feels confident about your brand. That’s the power of design done right, it turns curiosity into connection, and visitors into potential clients.",
      "From sketch to setup, we handle everything so you can focus on your event while we bring your booth to life."
    ],
    image: "/assets/imgs/VFXandCGIADs/09.png",
  };

  const sectionTwo = {
    title: "Designed for the Modern Brand",
    paragraphs: [
      "In today’s fast-moving world of trade shows and expos, standing out is essential. Visitors don’t just look for flashy visuals, they look for experiences. Your booth should feel alive, reflect your brand’s purpose, and create a lasting emotional impact.",
       "That’s where we come in. Our Exhibition Booth Design Services are made for brands that want to be seen, heard, and remembered. We keep every design modern, clean, and easy to explore. Whether you want a minimalist setup or an interactive digital display, our team tailors each detail to fit your goals.",
       "We also make sure your booth feels comfortable and functional. The flow of space, lighting, materials, and colors, all are thoughtfully chosen to create a setting where people naturally want to step in and engage.",
        <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we believe design isn’t about decoration, it’s about communication. Every booth we build is designed to tell your story visually, consistently, and effectively.
      </>
    ],
    image: "/assets/imgs/VFXandCGIADs/009.png",
  };
  const faqs = [
    {
      question: "What processes can you automate?",
      answer:
        "Our area of expertise is automating time-consuming, repetitive, and data-driven tasks. This includes marketing campaigns, customer service, sales tracking, finance operations, and industry-specific workflows that can be enhanced with AI.",
    },
    {
      question: "Will automation replace my employees?",
      answer:
        "We want to strengthen your team, not take its place. Automation takes over repetitive tasks so your employees can focus on creative, strategic, and high-value work that drives your business forward.",
    },
    {
      question: "How do you ensure automation fits my business needs?",
      answer:
        "We begin with a deep discovery session to understand your operations. Then, we design custom AI automation systems tailored to your workflow, ensuring they integrate seamlessly with your tools and processes.",
    },
    {
      question: "Do you offer AI chatbot and virtual assistant solutions?",
      answer:
        "Yes. We design AI chatbots and virtual assistants that can handle customer inquiries, manage leads, and provide instant support, while improving over time with machine learning.",
    },
    {
      question: "How do I get started?",
      answer:
      <>
        Make a consultation appointment by visiting our website at  <span className="text-bold underline main-color">Sham Marianas</span>. We will identify automation opportunities and start building a system that will save time, cut costs, and boost productivity.
   </>
      },
  ];

  return (
    <>
      <HeaderSection
        title="Exhibition "
        highlightedText="Booth"
        backgroundImage="/assets/imgs/background/bg1.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Exhibition Booth Design"
        highlightedWords={["That Attracts and Connects"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
           we believe your exhibition booth should do more than just look good, it should speak for your brand. Every event is an opportunity to make people stop, notice, and remember who you are. That’s exactly what we help you do.

          </>,
          "Whether you’re a new brand stepping into the spotlight or an established business preparing for your next big event, we create exhibition booth designs that make your presence unforgettable. From concept and structure to lighting and visuals, every detail is designed to draw attention and tell your brand’s story with confidence and style."
        ]}
        listItems={[
          "Custom Booth Design & Fabrication",
          "3D Booth Visualization & Layout Planning",
          "Brand-Themed Booth Concepts",
          "Digital Displays, Signage & Lighting Setup",
          "Flooring, Print Collateral & Accessories",
          "Installation, Management & On-Site Support",
        ]}
        imageSrc="/assets/imgs/VFXandCGIADs/9.png"
        imageAlt="Intro booth"
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

export default BoothDesignPage;
