"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";
import Marq2 from "../../Components/marq2";

const VideoProductionPage = () => {
  // const sectionOne = {
  //   title: "From Lens to Legacy Visuals That Resonate",
  //   paragraphs: [
  //     "Our photography & video production services go far beyond the lens. We don’t just point and shoot — we tell your brand’s story frame by frame. Whether it’s bold product photography, cinematic brand videos, or crisp lifestyle visuals, we create content that stops the scroll, sparks curiosity, and drives action. Every image we capture is built to speak your message — loud, clear, and beautifully.",

  //     "From creative planning to final edit, we deliver full-scale visual production tailored for digital impact. Think scroll-stopping social media clips, polished promo videos, striking product shots, and branded storytelling — all crafted with pro-level lighting, styling, direction, and editing. If your brand needs to be seen and felt, we’re here to bring that vision to life — one unforgettable visual at a time.",
  //   ],
  //   image: "/assets/imgs/PhotographyVideo/08.png",
  // };

  const sectionTwo = {
    title:
      "Framing Brands with Purpose — Photography & Video Production That Converts",
    paragraphs: [
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , it’s more than just visuals — it’s about crafting high-impact photo
        and video content that tells your story, connects with your audience,
        and fuels business growth. Our photography & video production services
        are built to elevate your brand through clear, compelling, and
        conversion-driven visuals.
      </>,
      "Whether it’s fashion campaigns, product photography, behind-the-scenes content, or cinematic brand videos, we align each frame with your vision and marketing goals. From creative direction to post-production, we deliver polished, platform-ready content that not only looks stunning but also drives real engagement and results.",
    ],
    image: "/assets/imgs/PhotographyVideo/008.png",
  };
  const faqs = [
    {
      question:
        "What types of photography and video production services do you offer?",
      answer:
        "We offer a wide range of visual content services, including product photography, fashion shoots, lifestyle photography, corporate headshots, behind-the-scenes content, promotional videos, brand films, and more — all tailored to your brand’s needs.",
    },
    {
      question: "Do you help with concept and creative direction?",
      answer:
        "Absolutely! From brainstorming visual ideas to storyboarding and art direction, we guide you through the entire creative process to ensure your content aligns with your brand identity and goals.",
    },
    {
      question: "Will the content be optimized for social media and websites?",
      answer:
        "Yes. All our photo and video content is formatted and optimized for platforms like Instagram, Facebook, TikTok, YouTube, and your website — ensuring high-quality visuals across every channel.",
    },
    {
      question: "How long does it take to complete a project?",
      answer:
        "Timelines depend on the scope of your project. We’ll give you a clear timeline during the planning stage and always aim for fast, high-quality delivery.",
    },
    {
      question: "Do you provide editing and post-production as well?",
      answer:
        "Yes, we handle the full production cycle — from shooting to editing, color grading, sound design, and final delivery.",
    },

    {
      question: "How do I get started?",
      answer:
        "Just reach out through our website or contact form! We’ll schedule a discovery call to understand your vision and start planning your custom visual content journey.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="Photography & Video Production"
        backgroundImage="/assets/imgs/background/bg.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Bringing Strategy and"
        highlightedWords={["Creativity Into Every Frame"]}
        customClass="intro-webdev-section" // 👈 Custom class added here
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            photography & video production is where storytelling meets strategy
            — capturing emotion, building connection, and elevating your brand.
            From stunning product shoots to cinematic brand videos, we create
            visuals that your audience won’t forget.
          </>,
          "Whether you're launching something new, introducing your team, or shaping your brand, our creative team turns your ideas into powerful visuals. We craft every shot with purpose — to catch attention, spark interest, and drive results. We don’t just make videos; we create visual stories that connect and deliver.",
        ]}
        listItems={[
          "Brand & Product Photography",
          "Promotional & Commercial Videos",
          "Corporate Photography & Headshots",
          "Event Photography & Videography",
          "Lifestyle & Fashion Shoots",
          "Short-Form Content for Social Media",
          "Reels, TikToks & YouTube Videos",
          "Scriptwriting & Storyboarding",
          "Professional Editing & Post-Production",
        ]}
        imageSrc="/assets/imgs/PhotographyVideo/8.png"
        imageAlt="Intro branding"
      />
      {/* <div className="video-page-section">
        <BrandingContentSection
          sectionOne={sectionOne}
          sectionTwo={sectionTwo}
        />
      </div> */}
      <section className="container section-padding">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-md-6 text-left">
              <h2 className="sub-title-new main-color mb-20">
                From Lens to Legacy Visuals That Resonate
              </h2>

              <div className="text">
                <p className="mb-15 align-text">
                  Our photography & video production services go far beyond the
                  lens. We don’t just point and shoot — we tell your brand’s
                  story frame by frame. Whether it’s bold product photography,
                  cinematic brand videos, or crisp lifestyle visuals, we create
                  content that stops the scroll, sparks curiosity, and drives
                  action. Every image we capture is built to speak your message
                  — loud, clear, and beautifully.
                </p>
                <p className="mb-15 align-text">
                  From creative planning to final edit, we deliver full-scale
                  visual production tailored for digital impact. Think
                  scroll-stopping social media clips, polished promo videos,
                  striking product shots, and branded storytelling — all crafted
                  with pro-level lighting, styling, direction, and editing. If
                  your brand needs to be seen and felt, we’re here to bring that
                  vision to life — one unforgettable visual at a time.
                </p>
              </div>
            </div>
            <div className="col-lg-6 video-page-section">
              <img
                src="/assets/imgs/PhotographyVideo/08.png"
                alt="services images"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6 video-page-section-two">
              <img
                src="/assets/imgs/PhotographyVideo/008.png"
                alt="services images" className="videoImage-section-two"
              />
            </div>
            <div className="col-lg-6 valign">
              <div>
                <div className="sec-head mb-50 text-left">
                  <h2 className="sub-title-new main-color mb-15">
                    Framing Brands with Purpose — Photography & Video Production
                    That Converts
                  </h2>
                  <p className="mb-15 align-text">
                    At{" "}
                    <span className="text-bold underline main-color">
                      Sham Marianas
                    </span>
                    , it’s more than just visuals — it’s about crafting
                    high-impact photo and video content that tells your story,
                    connects with your audience, and fuels business growth. Our
                    photography & video production services are built to elevate
                    your brand through clear, compelling, and conversion-driven
                    visuals.
                  </p>

                  <p className="mb-15 align-text">
                    Whether it’s fashion campaigns, product photography,
                    behind-the-scenes content, or cinematic brand videos, we
                    align each frame with your vision and marketing goals. From
                    creative direction to post-production, we deliver polished,
                    platform-ready content that not only looks stunning but also
                    drives real engagement and results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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

export default VideoProductionPage;
