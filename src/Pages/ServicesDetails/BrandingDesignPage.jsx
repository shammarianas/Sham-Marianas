"use client";
import "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";
import SchemaMarkup from "../../Components/SchemaMarkup";

const BrandingDesignPage = () => {
  const sectionOne = {
    title: "The Importance of Effective Branding Design",
    paragraphs: [
      <>
        Effective branding design is key to building trust and recognition. It
        gives your business a{" "}
        <a href="/case-study" style={{ color: "#8fe3e6" }}>
          unique identity
        </a>{" "}
        that helps you stand out
        and stay memorable in a competitive market. From your logo to your
        website, consistent visuals create a professional and polished image.
      </>,
      "More than just looks, great branding creates emotional connections. It makes your business feel relatable and reliable, encouraging customer loyalty and repeat visits. A well-designed brand doesn't just attract attention, it builds lasting relationships.",
    ],
    image: "/assets/imgs/Branding/01.png",
    imageAlt: "Brand identity design elements and visual branding system",
  };

  const sectionTwo = {
    title: "The Role of Branding Design in a Fast-Paced Digital World?",
    paragraphs: [
      <>
        In today&apos;s fast-paced digital world, branding design is essential
        for businesses to stand out and build connections with their audience.
        At{" "}
        <a
          href="/"
          className="text-bold underline"
          style={{ color: "#8fe3e6" }}
        >
          Sham Marianas F.Z.C
        </a>
        , we create unique branding designs that help define your identity,
        communicate your message clearly, and leave a lasting impression.
      </>,
      <>
        Good branding isn&apos;t just about aesthetics; it&apos;s about
        consistency and trust. A cohesive design across all platforms builds
        loyalty and keeps your brand relevant. At{" "}
        <span className="text-bold underline">Sham Marianas F.Z.C</span>,
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
    imageAlt: "Visual identity design for a modern digital brand",
  };
  const faqs = [
    {
      question: "What is included in a brand identity design package?",
      answer:
        "A brand identity design package typically includes a logo, colour palette, typography, visual style, and brand guidelines. Depending on your needs, it can also include brand strategy, stationery, social media assets, and website visual direction.",
    },
    {
      question: "How much does brand identity design cost in Dubai?",
      answer:
        "Brand identity design in Dubai can cost from a few thousand dirhams to a larger project investment, depending on the scope and deliverables. The final price depends on research, strategy, logo development, brand guidelines, and the number of applications required.",
    },
    {
      question: "How long does a branding project take?",
      answer:
        "A branding project usually takes 4–6 weeks from discovery to final delivery. Larger projects with extensive research, multiple concepts, or detailed brand guidelines may require additional time.",
    },
    {
      question: "What is the difference between a logo and a brand identity?",
      answer:
        "A logo is one visual mark, while a brand identity is the complete visual system that represents a business. Brand identity includes the logo, colours, typography, imagery, messaging style, and guidelines for consistent use.",
    },
    {
      question: "Do you provide brand guidelines for social media and websites?",
      socialMediaLink: true,
      answer:
        "Yes, we provide brand guidelines that show how to use your identity consistently across social media and websites. Guidelines can cover logo usage, colour codes, typography, layouts, imagery, and digital content examples.",
    },
    {
      question: "Do you work with startups and UAE businesses?",
      answer:
        "Yes, we work with startups, growing companies, and established UAE businesses. Our branding process is tailored to your market, audience, business goals, and stage of growth.",
    },
  ];

  return (
    <>
      <SchemaMarkup
        type="service"
        data={{ ...SEO_CONFIG.branding, faqs }}
      />
      <SEO {...SEO_CONFIG.branding} />
      <HeaderSection
        title="Brand Identity Design"
        highlightedText=""
        backgroundImage="/assets/imgs/background/bg4.webp"
        overlayDark="8"
      />
      <IntroSection
        title="Building Brands"
        highlightedWords={["That Speak"]}
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas F.Z.C
            </span>, we craft branding and designs that go beyond just visuals we
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
        imageAlt="Brand identity design and logo development services"
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
        imageAlt="Brand identity design frequently asked questions"
      />
      ;
      <Marq2 />
    </>
  );
};

export default BrandingDesignPage;
