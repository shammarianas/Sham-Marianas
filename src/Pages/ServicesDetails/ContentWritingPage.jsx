"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const ContentServicePage = () => {
  const sectionOne = {
    title: "Quality Content is the Heart of Online Success",
    paragraphs: [
      <>
        Good design gets attention, but great content keeps it. Your message
        must be concise, compelling, and packed with keywords in the fast-paced
        digital world of today. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we write content that not only ranks on search engines but also builds
        emotional connections with your readers.
      </>,
      "We use proven SEO strategies to ensure your content appears in front of the right audience — while keeping the tone natural, human, and easy to understand.",
      "Whether it’s a blog post or a product page, every word we write is focused on one goal: helping you grow.",
    ],
    image: "/assets/imgs/Content/05.png",
  };

  const sectionTwo = {
    title: "Content That Converts, Ranks, and Builds Trust",
    paragraphs: [
      "You don’t need generic content — you need writing that tells your story, matches your tone, and turns interest into action. Our experienced writers combine creativity with strategy to craft content that’s not just informative but persuasive.",
      "We research your audience, understand your industry, and align every piece of content with your brand goals. The result? Writing that is intriguing, self-assured, and clear keeps readers interested and maintains Google ranking.",
    ],
    image: "/assets/imgs/Content/005.png",
  };
  const faqs = [
    {
      question: "Why is professional content writing important?",
      answer:
        "It helps you communicate your message clearly, attract your target audience, and rank higher on search engines — all while building a strong brand identity.",
    },
    {
      question: "Do you write SEO-optimized content?",
      answer:
        "Absolutely. Every piece we write is optimized with relevant keywords, metadata, and formatting to improve your search engine visibility without sounding robotic.",
    },
    {
      question: "Can you match my brand’s tone and voice?",
      answer:
        "Yes! We take the time to understand your brand personality and write in a tone that reflects your identity — whether it’s casual, professional, playful, or formal.",
    },
    {
      question: "Do I need to provide topics or ideas?",
      answer:
        "Not at all. Based on your company's objectives and keyword analysis, we may assist in coming up with and recommending content ideas. Or we can write based on your brief — whatever works for you.",
    },
    {
      question: "How do I get started?",
      answer:
        "Just contact us through our website, and we’ll schedule a quick chat to understand your needs and start crafting content that connects and converts.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="Content Writing"
        backgroundImage="/assets/imgs/background/bg5.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Words That"
        highlightedWords={["Build", " ", "Brands"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we turn words into experiences, crafting powerful, engaging content
            that speaks your brand’s truth and connects with your audience. From
            attention-grabbing web copy to SEO-friendly blogs, we create content
            that builds trust, boosts traffic, and drives real results.
          </>,
          "Whether you're building a new website or refreshing your existing one, our content writing services are designed to bring clarity, creativity, and purpose to every page. We focus on user intent, search engine visibility, and brand consistency — turning passive readers into active customers.",
          "With us, your brand won’t just be heard — it will be remembered",
        ]}
        listItems={[
          "Website Copywriting",
          "Blog Writing & Management",
          "SEO Content Writing",
          "Product Descriptions",
          "Social Media Captions & Content",
          "Landing Page Content",
          "Email Marketing Copy",
          "Brand Messaging & Voice Development",
          "Content Strategy & Planning",
        ]}
        imageSrc="/assets/imgs/Content/5.png"
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

export default ContentServicePage;
