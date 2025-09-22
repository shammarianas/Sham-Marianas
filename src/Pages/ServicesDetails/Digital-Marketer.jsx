"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const DigitalMaketerPage = () => {
  const sectionOne = {
    title: "Digital Presence That Drives Real Growth",
    paragraphs: [
      <>
        In today’s fast-paced digital world, your social media & digital
        marketing presence is key to making a lasting first impression. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we craft strategies that go beyond likes and shares. We focus on
        creating authentic connections, building trust, and driving real action
        with every piece of content and campaign we execute. From captivating
        posts to data-driven ads, we ensure your brand stands out, engages
        meaningfully, and converts followers into loyal customers.
      </>,
      "Our approach emphasizes storytelling, community building, and strategic growth. We align every effort with your brand’s goals, focusing on measurable results that drive sustainable success. Ready to transform your social media & digital marketing into a powerful tool for business growth? Let’s create something unforgettable.",
    ],
    image: "/assets/imgs/SocialMediaDigital/07.png",
  };

  const sectionTwo = {
    title: "Transforming Digital Engagement Into Real Business Growth",
    paragraphs: [
      "Let's face it, nobody scrolls aimlessly nowadays. They scroll to discover, to connect, and to buy. And we’re here to make sure your brand is part of that journey.",
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we combine innovative storytelling with data-driven tactics to craft
        social media & digital marketing strategies that don’t just capture
        attention but convert it into real business results. Whether we’re
        setting your brand’s tone, launching viral campaigns, or guiding
        customers through tailored marketing funnels, we ensure your content
        isn’t just seen — it’s remembered, trusted, and acted upon.
      </>,
      "From product launches to re-engaging past customers, we build digital experiences that deliver not just quick wins but sustained, long-term growth.",
    ],
    image: "/assets/imgs/SocialMediaDigital/007.png",
  };
  const faqs = [
    {
      question: "What makes digital marketing different from social media?",
      answer:
        "Social media marketing (SMM) focuses on promoting brands through social media platforms, while digital marketing is a broader strategy that includes various online channels like SEO, email marketing, and PPC. Using social media to connect with and interact with a larger audience.",
    },
    {
      question:
        "Why do I need professional social media and digital marketing?",
      answer:
        "Because your audience is online — and so is your competition. A solid strategy helps you cut through the noise, build real connections, and drive results.",
    },
    {
      question: "Which platforms do you work with?",
      answer:
        "We manage campaigns and content across Instagram, Facebook, LinkedIn, YouTube, TikTok, and more — wherever your audience is.",
    },
    {
      question: "Will you create the content too?",
      answer:
        "Yes! We handle the entire process — from planning to designing, writing, and publishing—so your brand stays consistent and professional.",
    },
    {
      question: "Can you run paid ads for me?",
      answer:
        "Absolutely. We create and manage high-performing ad campaigns focused on conversions, not just impressions.",
    },
    {
      question: "How do I measure success?",
      answer:
        "We provide detailed analytics and monthly performance reports so you can track growth, engagement, and ROI.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply reach out through our website —we’ll schedule a discovery call and map out your digital success journey.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="Social Media & Digital Marketing"
        backgroundImage="/assets/imgs/background/b2.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Posting Isn’t Enough —"
        highlightedWords={["We Cultivate Digital Impact"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we elevate social media management into an art — creating digital
            experiences that grab attention, spark conversations, and drive real
            business growth.
          </>,
          "Whether you’re a new brand looking to build your presence or an established name aiming to scale, our social media and digital marketing solutions are tailored for results. From strategic content creation to ROI-driven ad campaigns, we help you connect, engage, and convert — all while staying true to your brand’s voice. With us, your digital success isn’t just possible — it’s inevitable.",
        ]}
        listItems={[
          "Social Media Management",
          "Targeted Ad Campaigns",
          "Content Strategy & Planning",
          "Visual Content Creation",
          "Performance Tracking & Analytics",
          "Influencer & Community Marketing",
          "Email Marketing & Automation",
          "SEO-Integrated Content for Blogs & Social",
        ]}
        imageSrc="/assets/imgs/SocialMediaDigital/7.png"
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

export default DigitalMaketerPage;
