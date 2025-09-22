"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const VfxAndAdsPage = () => {
  const sectionOne = {
    title: "From Concept to Impact Ads That Hit Different",
    paragraphs: [
      <>
        Every VFX and CGI project we create starts with purpose and ends with
        performance. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we don’t just make things look amazing — we make them work. Each frame
        is part of a bigger plan to grab attention, spark engagement, and drive
        results.
      </>,
      "From the very first idea to the final pixel, we handle everything — concept creation, scriptwriting, storyboarding, animation, editing, and platform-specific optimization. It’s a full-circle creative process designed to deliver both visual impact and marketing value.",
      "Launching a new product? Running a bold campaign? Want your brand to shine in a sea of sameness? Our VFX and CGI-powered ads give you an undeniable edge — blending future-forward visuals with storytelling that stops the scroll and moves your audience to act.",
    ],
    image: "/assets/imgs/VFXandCGIADs/09.png",
  };

  const sectionTwo = {
    title: "From Bold Ideas to Breathtaking Visuals",
    paragraphs: [
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we bring ambitious ideas to life through cinematic visuals that
        captivate, connect, and convert. Whether it's a surreal animation, a
        stylized brand story, or a hyper-real visual experience, every project
        is crafted with sharp strategy, artistic finesse, and storytelling that
        resonates.
      </>,
      "We transform animation into art — immersive visual journeys that make people stop, feel, and act. Every frame is designed to speak louder than words and leave a lasting mark.",
    ],
    image: "/assets/imgs/VFXandCGIADs/009.png",
  };
  const faqs = [
    {
      question: "What’s the difference between VFX and CGI?",
      answer:
        "CGI (computer-generated imagery) creates visuals from scratch, like 3D models and animations. VFX (visual effects) adds those visuals into real footage — combining both to build stunning, lifelike results.",
    },
    {
      question: "Do you help with concept and storyboarding?",
      answer:
        "Yes! We guide you from idea to execution — helping shape concepts, write scripts, storyboard scenes, and plan each effect with your brand in mind.",
    },
    {
      question: "Can you create short CGI ads for social media?",
      answer:
        "Absolutely. We design optimized short-form VFX/CGI ads tailored for platforms like Instagram, TikTok, YouTube, and Facebook.",
    },
    {
      question: "Are your CGI ads mobile-friendly and web-optimized?",
      answer:
        "Yes. Every project is rendered in the ideal format and resolution for web, mobile, and social media — ensuring smooth playback and high quality across all devices.",
    },
    {
      question: "How do I get started?",
      answer:
        "Just reach out through our website or contact form. We’ll set up a discovery call to understand your vision and start creating visuals that push your brand forward.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="VFX & CGI"
        highlightedText="Ads"
        backgroundImage="/assets/imgs/background/bg1.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Creating the Unreal — "
        highlightedWords={["VFX & CGI Ads That Captivate and Convert"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we turn imagination into impact, crafting cinematic visuals that
            not only dazzle the eye but also drive real results. Our VFX (visual
            effects) and CGI (computer-generated imagery) services merge
            storytelling with next-level design to create ads that demand
            attention and inspire action.
          </>,
          "From surreal animations to lifelike 3D worlds, we breathe digital life into your ideas — building visual experiences that break boundaries, stir emotions, and amplify your brand message. Whether it’s a high-energy product ad or a futuristic brand film, we bring creativity and precision to every frame.",
        ]}
        listItems={[
          "3D Product Animations & Commercials",
          "CGI Brand Videos",
          "Motion Graphics & Visual Effects",
          "Virtual Environments & Set Extensions",
          "Animated Explainer Ads",
          "Logo Animations & Visual Intros",
          "Cinematic CGI for TVCs & Digital Ads",
          "Post-Production FX & Compositing",
          "Custom CGI for Social Media Campaigns",
        ]}
        imageSrc="/assets/imgs/VFXandCGIADs/9.png"
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

export default VfxAndAdsPage;
