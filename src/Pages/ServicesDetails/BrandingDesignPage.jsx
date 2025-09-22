"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const BrandingDesignPage = () => {
  const sectionOne = {
    title: "The Importance of Effective Branding Design",
    paragraphs: [
      "Effective branding design is key to building trust and recognition. It gives your business a unique identity that helps you stand out and stay memorable in a competitive market. From your logo to your website, consistent visuals create a professional and polished image.",
      "More than just looks, great branding creates emotional connections. It makes your business feel relatable and reliable, encouraging customer loyalty and repeat visits. A well-designed brand doesn't just attract attention — it builds lasting relationships.",
    ],
    image: "/assets/imgs/Branding/01.png",
  };

  const sectionTwo = {
    title: "The Role of Branding Design in a Fast-Paced Digital World?",
    paragraphs: [
      <>
        In today&apos;s fast-paced digital world, branding design is essential
        for businesses to stand out and build connections with their audience.
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we create unique branding designs that help define your identity,
        communicate your message clearly, and leave a lasting impression.
      </>,
      <>
        Good branding isn&apos;t just about aesthetics; it&apos;s about
        consistency and trust. A cohesive design across all platforms builds
        loyalty and keeps your brand relevant. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we ensure your brand evolves with the digital trends, keeping it fresh
        and engaging.{" "}
      </>,
      <>
        In short, effective branding design is key to staying ahead in the
        competitive digital landscape, building relationships with customers,
        and driving success.
      </>,
    ],
    image: "/assets/imgs/Branding/001.png",
  };
  const faqs = [
    {
      question: "How do you determine the right design elements for my brand?",
      answer:
        " We begin with a deep understanding of your business, audience, and goals. Our team conducts research to create a design that aligns with your brand values, ensuring your logo, color scheme, and messaging reflect your identity clearly.",
    },
    {
      question: "Can branding design help increase customer loyalty?",
      answer:
        "Absolutely! Strong branding creates a connection with your audience, making your business more relatable and trustworthy. This emotional connection leads to customer loyalty, repeat visits, and long-term engagement with your brand.",
    },
    {
      question: "How long does the branding design process take?",
      answer:
        "The timeline for branding design varies depending on the complexity of the project. On average, it takes 4-6 weeks to complete the entire process, from initial concepts to final designs.",
    },
    {
      question: "Why is branding design important for my business?",
      answer:
        "Effective branding design builds trust, recognition, and emotional connections with your customers. It sets you apart from competitors, creates a memorable identity, and fosters customer loyalty, which drives long-term success.",
    },
    {
      question: "How do I get started with your branding design services?",
      answer:
        " To get started, simply contact us through our website or reach out to our team at Sham Marianas . We'll schedule a consultation to understand your needs and begin the process of crafting your unique brand identity.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="Branding"
        highlightedText="Design"
        backgroundImage="/assets/imgs/background/bg4.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Building Brands"
        highlightedWords={["That", " ", "Speak"]}
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            , we craft branding and designs that go beyond just visuals we
            create identities. Your brand is your story, and we help you tell it
            with clarity, creativity, and consistency.
          </>,
          "Whether you're a startup or an established business, our branding design services ensure that your logo, color scheme, typography, and messaging all align to leave a strong and lasting impression.",
        ]}
        listItems={[
          "Logo Creation",
          "Brand Identity Design",
          "Visual Style Guides",
          "Typography and Color Palette",
          "Social Media Branding",
          "Brand Strategy & Messaging",
        ]}
        imageSrc="/assets/imgs/Branding/1.png"
        imageAlt="Intro branding"
      />
      <div className="branding-page-section">
        <BrandingContentSection
          sectionOne={sectionOne}
          sectionTwo={sectionTwo}
        />
      </div>
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

export default BrandingDesignPage;
