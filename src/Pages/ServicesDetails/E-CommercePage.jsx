"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const EcommercePage = () => {
  const sectionOne = {
    title: "Effective E-Commerce Design is Crucial for Success",
    paragraphs: [
      "In today’s fast-paced digital world, your e-commerce website is your most powerful sales tool, available 24/7 and reaching customers across the globe. A well-designed online store does more than just display products — it builds trust, drives conversions, and ensures your customers keep coming back for more.",
      <>
        Speed, clarity, and simplicity are everything in e-commerce. From fast
        loading times to clear product listings and a seamless checkout process,
        every second counts. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we focus on mobile-friendly designs, SEO optimization, and user-friendly
        navigation to ensure your store performs at its peak. With features like
        secure payment gateways, easy inventory management, and customized
        product pages, we create an experience that’s not just smooth but
        memorable — helping you convert visitors into loyal customers.
      </>,
    ],
    image: "/assets/imgs/E-Commerce/004.png",
  };

  const sectionTwo = {
    title: "E-Commerce That Delivers Results and Drives Growth",
    paragraphs: [
      "In today’s world, simply having a website isn’t enough — customers expect a seamless e-commerce experience that’s fast, secure, and easy to navigate. Our tailored e-commerce solutions are designed to meet these high expectations, giving your business the tools it needs to grow and succeed online.",
      "We combine sleek design with robust functionality and cutting-edge SEO strategies to create an e-commerce store that not only looks impressive but also works tirelessly to convert visitors into loyal customers. Whether you’re selling a handful of products or scaling a large inventory, we ensure your e-commerce website is built to grow with your business, delivering results and keeping customers engaged for the long run.",
    ],
    image: "/assets/imgs/E-Commerce/04.png",
  };
  const faqs = [
    {
      question: "Why is a custom e-commerce website important?",
      answer:
        "A unique e-commerce website improves user experience, increases conversions, and represents your brand. We ensure it’s mobile-friendly, SEO-optimized, and performance-driven.",
    },
    {
      question: "What makes Sham Marianas different?",
      answer:
        "We focus on creating e-commerce experiences that are user-friendly, SEO-optimized, and conversion-driven, ensuring your success.",
    },
    {
      question: "Is my e-commerce site secure?",
      answer:
        "We implement secure payment gateways and SSL encryption, ensuring your customers’ data is always safe.",
    },
    {
      question: "Will my e-commerce website be mobile-friendly?",
      answer:
        "Yes! Every e-commerce store we create is mobile-responsive, meaning it looks and functions beautifully on smartphones, tablets, and desktops. This guarantees that your clients will have a seamless purchasing experience regardless of how they browse.",
    },
    {
      question: "Can I manage my store on my own?",
      answer:
        "Yes! We provide an easy-to-use admin panel that allows you to manage products, orders, and inventory without any technical knowledge.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply contact us through our website, and we’ll schedule a consultation to kickstart your project.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="E-Commerce Solutions"
        backgroundImage="/assets/imgs/background/bg4.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="We Don’t Just Build Stores"
        highlightedWords={["We Create Online Success"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we go beyond designing e-commerce websites — we create immersive
            digital storefronts that wow your customers and turn casual clicks
            into loyal buyers.
          </>,
          "Whether you're launching your first e-commerce venture or looking to expand, our custom-built solutions are designed for growth. Fully optimized for mobile, SEO, and performance, your store will be a smooth, effortless experience that attracts visitors, keeps them engaged, and encourages repeat purchases. With us, your e-commerce success is just a click away.",
        ]}
        listItems={[
          "Custom E-Commerce Website Design",
          "Secure Payment Gateway Integration",
          "Product Management Systems",
          "Shopping Cart & Checkout Optimization",
          "Mobile-Responsive Store Design",
          "User-Friendly Admin Panel",
          "Search Engine Optimization (SEO)",
          "Third-Party App & Plugin Integrations",
          "Performance Tracking & Analytics",
        ]}
        imageSrc="/assets/imgs/E-Commerce/4.png"
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

export default EcommercePage;
