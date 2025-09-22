import React from "react";

const ContentSection = ({ sectionOne, sectionTwo }) => {
  return (
    <>
      <section className="container section-padding">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-md-6 text-left">
              <h2 className="sub-title-new main-color mb-20">
                {sectionOne.title}
              </h2>
              <div className="text">
                {sectionOne.paragraphs.map((para, idx) => (
                  <p key={idx} className="mb-15 align-text">
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="services-images">
                <img src={sectionOne.image} alt="services images" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6">
              <div className="services-images">
                <img src={sectionTwo.image} alt="services images" />
              </div>
            </div>
            <div className="col-lg-6 valign">
              <div>
                <div className="sec-head mb-50 text-left">
                  <h2 className="sub-title-new main-color mb-15">
                    {sectionTwo.title}
                  </h2>
                  {sectionTwo.paragraphs.map((para, idx) => (
                    <p key={idx} className="mb-15 align-text">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContentSection;
