"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const AiAutomationPage = () => {
  const sectionOne = {
    title: "Crafting Intelligent Systems That Work Around the Clock",
    paragraphs: [
      <>
        True automation is more than replacing manual work. It is about designing smart systems that adapt, learn, and improve over time. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>, we build automation solutions that save hours, reduce errors, and keep your business running 24/7 without missing a beat.
      </>,
      "Every algorithm and process is tailored for maximum efficiency and seamless integration with your existing systems. We ensure every solution is user-friendly, scalable, and capable of handling real-world challenges. Whether it is an AI that instantly responds to customers, an automated system that manages your sales pipeline, or a process that analyzes thousands of data points in seconds, we make it happen.",
      "We merge innovation with intelligence to create automation solutions that do not just perform but excel.",
    ],
    image: "/assets/imgs/AiAutomation/AI1.png",
  };

  const sectionTwo = {
    title: "Automation That Transforms Workflows Into Growth Engines",
    paragraphs: [
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we believe automation should be both powerful and practical. Our goal is to give you tools that boost productivity, cut costs, and increase accuracy while freeing your team to focus on what truly matters, which is growth.
      </>,
      "From the first consultation to final deployment, we focus on business impact, user experience, and measurable ROI. Every automation solution is built with your industry needs in mind, ensuring that it is not only a fit for today but also a foundation for future growth.",
       <>
        With <span className="text-bold underline main-color">Sham Marianas</span>{" "}
       AI Automation Services, your workflows will not just run. They will take your company to the next level quite quickly.
      </>,
    ],
    image: "/assets/imgs/AiAutomation/AI2.png",
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
        title="AI "
        highlightedText="Automation"
        backgroundImage="/assets/imgs/background/bg1.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Creating the Unreal, "
        highlightedWords={["Shaping Ideas Into AI Powered Solutions That Work for You"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we do more than just automate tasks. We build AI-powered systems that think, adapt, and deliver results. Whether it is streamlining your business operations or creating intelligent workflows, we transform your processes into smart, efficient, and scalable solutions that work flawlessly.

          </>,
          "From concept to execution, our automation solutions are crafted with precision, performance, and people in mind. We blend advanced artificial intelligence with practical business logic to create systems that save time and elevate your customer experience.",
       "With us, your business does not just work. It works smarter."
        ]}
        listItems={[
          "Business Process Automation (BPA)",
          "Workflow Automation Solutions",
          "AI Chatbots and Virtual Assistants",
          "Data Processing and Predictive Analytics",
          "Marketing Automation Systems",
          "CRM and Sales Pipeline Automation",
          "Finance & Invoice Processing Automation",
          "Industry-Specific Automation Solutions",
        ]}
        imageSrc="/assets/imgs/AiAutomation/AI.png"
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

export default AiAutomationPage;
