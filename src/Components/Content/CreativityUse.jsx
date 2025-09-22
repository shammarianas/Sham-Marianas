import React from "react";
import ReusableSection from "./ReusableSection";

const Creativity = () => {
  const sectionOne = {
    title: "The Importance of Effective Branding Design",
    paragraphs: [
      "Effective branding design is key to building trust and recognition. It gives your business a unique identity...",
      "More than just looks, great branding creates emotional connections...",
    ],
    image: "/assets/imgs/Asset_img.png",
  };

  const sectionTwo = {
    title: "The Role of Branding Design in a Fast-Paced Digital World?",
    paragraphs: [
      "In today's fast-paced digital world, branding design is essential...",
      "Good branding isn’t just about aesthetics; it’s about consistency...",
      "In short, effective branding design is key to staying ahead...",
    ],
    image: "/assets/imgs/Asset_img.png",
  };

  const faqs = [
    {
      question: "How do you determine the right design elements for my brand?",
      answer:
        "We begin with a deep understanding of your business, audience, and goals...",
    },
    {
      question: "Can branding design help increase customer loyalty?",
      answer:
        "Absolutely! Strong branding creates a connection with your audience...",
    },
    {
      question: "How long does the branding design process take?",
      answer:
        "The timeline for branding design varies depending on the complexity of the project...",
    },
    {
      question: "Why is branding design important for my business?",
      answer:
        "Effective branding design builds trust, recognition, and emotional connections...",
    },
    {
      question: "How do I get started with your branding design services?",
      answer:
        "To get started, simply contact us through our website or reach out to our team...",
    },
  ];

  return (
    <ReusableSection
      sectionOne={sectionOne}
      sectionTwo={sectionTwo}
      faqs={faqs}
      faqImage="/assets/imgs/FAQ.png"
    />
  );
};

export default Creativity;
