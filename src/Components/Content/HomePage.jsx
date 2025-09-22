"use client";
import React from "react";
import HeaderSection from "../ServicesDetails/HeaderSection";
import IntroSection from "../ServicesDetails/IntroSection";
import BrandingContentSection from "../ServicesDetails/ContentSection";
import FAQAccordion from "../ServicesDetails/FAQAccordion";

const BrandingPage = () => {
  const sectionOne = {
    title: "The Power of UI/UX Design",
    paragraphs: [
      "A user-friendly interface and intuitive design captivate users, boosting user engagement and driving higher conversion rates. A seamless UI/UX experience not only enhances user satisfaction but also builds brand trust and loyalty, ensuring repeat visits and long-term engagement with your brand.",
    ],
    image: "/assets/imgs/Asset_img.png",
  };

  const sectionTwo = {
    title: "Why Do You Need UI/UX Services in Today’s Digital World?",
    paragraphs: [
      <>
        To make an impact on a wider audience, it’s essential to cater to
        different user preferences. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        our tailored UI/UX solutions are designed to provide personalized
        experiences that meet diverse needs.
      </>,
      <>
        In the fast-paced digital landscape, staying up-to-date is key. What’s
        trendy today may be outdated tomorrow. Regularly updating your UI/UX
        design ensures your platform remains fresh, relevant, and engaging.
      </>,
      <>
        An intuitive, easy-to-navigate interface encourages users to explore
        more. The longer they engage with your platform, the higher the chances
        of conversion .
      </>,
      <>
        Discover how{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        can transform your digital presence with innovative mobile UI/UX design
        solutions. Stay a head of the competition and lead the market with
        expert design services.
      </>,
    ],
    image: "/assets/imgs/Asset_img.png",
  };
  const faqs = [
    {
      question: "Why is UI/UX design important?",
      answer:
        "Good UI/UX design helps improve user engagement, boosts conversion rates, and builds brand loyalty. It makes your platform more intuitive, ensuring users have a positive experience.",
    },
    {
      question: "How Does UI Design Differ from UX Design?",
      answer:
        "UI design focuses on the visual aspects of a product—like colors, buttons, and layout—making it look appealing and easy to interact with.UX design, on the other hand, focuses on the overall experience, ensuring the product is user-friendly, intuitive, and enjoyable to use.",
    },
    {
      question: "How Can Good UI/UX Design Enhance My Product?",
      answer:
        "Good UI/UX design enhances your product by improving user engagement and creating an intuitive, visually appealing interface. A seamless user experience increases user retention, boosts conversion rates, and ensures your product remains competitive and user-friendly.",
    },
    {
      question: "What makes your UI/UX design services different?",
      answer:
        "At Sham Marianas, we focus on personalized, user-centered designs. We combine creativity with functionality to deliver seamless, engaging experiences that enhance your brand's digital presence.",
    },
    {
      question: "Do You Include User Testing in Your Design Workflow?",
      answer:
        "Yes, user testing is integral to our design work flow. We conduct usability testing to ensure our UI/UX designs are intuitive, user-friendly, and meet audience needs. This helps improve user engagement, boost conversion rates, and enhance user retention.",
    },
    {
      question: "What UI/UX design tools and technologies do you use?",
      answer:
        "At Sham Marianas, we use top UI/UX design tools like Adobe XD, Sketch, and Figma for wireframing, prototyping, and creating intuitive designs. We also utilize InVision and UsabilityHub for user testing to ensure a seamless user experience, improve user engagement, and boost conversion rates.",
    },
    {
      question: "How Long Does It Take to Complete a UI/UX Design?",
      answer:
        "The time to complete a UI/UX design project varies but typically takes 4 to 8 weeks. This includes stages like user research, wireframing, prototyping, and user testing. We focus on enhancing user engagement, boosting conversion rates, and improving user retention",
    },
  ];

  return (
    <>
      <HeaderSection
        title="UI/UX"
        highlightedText="Design"
        backgroundImage="/assets/imgs/background/bg4.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Empowering Experiences Through"
        highlightedWords={["Smart", "Design"]}
        paragraphs={[
          <>
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            delivers smart, user-focused UI/UX design that combines beauty and
            usability. We craft intuitive digital experiences that elevate your
            brand. From startups to enterprises, we turn ideas into powerful,
            engaging interfaces.
          </>,
          "Whether you're a startup or an established business, our branding design services ensure that your logo, color scheme, typography, and messaging all align to leave a strong and lasting impression.",
        ]}
        listItems={[
          "Dynamic Design Elements",
          "Layout Design",
          "Usability Check",
          "Drafting",
          "Audience Research and Insights",
          "Mobile UI/UX Creation",
          "Designing Looks",
        ]}
        imageSrc="/assets/imgs/intro/2.jpg"
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
    </>
  );
};

export default BrandingPage;
