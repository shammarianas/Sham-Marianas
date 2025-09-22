"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const ProductDesignPage = () => {
  const sectionOne = {
    title: "Crafting Products That Speak to the Senses",
    paragraphs: [
      <>
        True product design lives in the details— At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we transform bold ideas into beautifully crafted physical products that
        look stunning, feel right, and work effortlessly.
      </>,
      "Every curve and edge is thoughtfully designed for maximum comfort and functionality. We ensure each product is user-friendly, durable, and easy to use, with materials that elevate the experience and designs that make every interaction feel intuitive. Whether it’s the seamless flow of a touch screen, the responsive feel of a button, or the long-lasting quality of your product, we craft solutions that work in harmony with the user’s needs.",
      "We blend aesthetics with function to create products that don’t just stand out — they become essentials.",
    ],

    image: "/assets/imgs/ProductDesign/006.png",
  };

  const sectionTwo = {
    title: "Designs That Transform Ideas into Iconic Products",
    paragraphs: [
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we believe great products start with bold ideas and end with
        unforgettable designs. Whether it’s an innovative gadget or a practical
        everyday item, we specialize in creating products that look stunning,
        feel intuitive, and work seamlessly.
      </>,
      <>
        From the initial concept to the final prototype, our design process
        focuses on user-centered solutions, ergonomics, and market-ready
        innovation. We balance form with function to ensure that your product
        isn’t just visually appealing but also practical and durable. Every
        detail, from materials to user interaction, is crafted to enhance the
        experience and create lasting impressions.
      </>,

      <>
        With{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        your product won’t just fit in—it will stand out, engage users, and make
        a lasting impact in the market.
      </>,
    ],
    image: "/assets/imgs/ProductDesign/06.png",
  };
  const faqs = [
    {
      question: "What types of products do you design?",
      answer:
        "We specialize in a wide range of industrial product designs, from high-tech gadgets to everyday tools. Whether you need a consumer product or a more specialized tool, we create designs that are as functional as they are stunning.",
    },
    {
      question: "How do you ensure my product design is user-friendly?",
      answer:
        "At Sham Marianas, we place the user at the heart of every design. Through user-centered design principles, we craft products that are not only intuitive to use but also comfortable and functional. We carefully consider every detail, from ergonomic shapes to seamless interactions, ensuring your product is a joy for customers to use.",
    },
    {
      question: "What makes Sham Marianas design process unique?",
      answer:
        "We blend creativity with precision. From concept development to prototyping, we focus on market-ready innovation and aesthetics that align with your brand's vision. Our design approach ensures your product is not just beautiful but also practical, durable, and designed for real-world success.",
    },
    {
      question: "Can you work with my existing product ideas or sketches?",
      answer:
        "Absolutely! We can take your sketches or ideas and turn them into tangible, high-quality products. Our team refines your concept through detailed 3D modeling, prototyping, and user testing, ensuring the final design is both innovative and practical.",
    },

    {
      question: "How do I get started?",
      answer:
        "Reach out to us through our website. We’ll schedule a discovery session to understand your product goals and start designing something your users will love.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="Product Design"
        backgroundImage="/assets/imgs/background/bg3.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Shaping Ideas Into Products"
        highlightedWords={["That Speak for Themselves"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we do more than product design — we bring bold ideas to life.
            Whether it’s a sleek gadget or a smart everyday solution, we turn
            your vision into a tangible product that looks incredible, feels
            right, and works flawlessly.
          </>,
          "From concept to creation, our designs are crafted with purpose, precision, and people in mind. We balance beauty with functionality to create market-ready products that stand out on the shelf and in your customer’s hands.",
          "With us, your product doesn’t just exist — it makes an impact."
        ]}
        listItems={[
          "Industrial Product Design",
          "Concept Development & Sketching",
          "3D Product Modeling & Rendering",
          "Product Prototyping",
          "Material & Finish Selection",
          "Design for Manufacturing (DFM)",
          "User-Centered Design",
          "Ergonomic Design"
        ]}
        imageSrc="/assets/imgs/ProductDesign/6.png"
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

export default ProductDesignPage;
