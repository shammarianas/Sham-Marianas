import React from "react";

const IntroSection = ({
  title = "",
  highlightedWords = [],
  paragraphs = [],
  listItems = [],
  imageSrc = "",
  imageAlt = "",
  customClass = "", // ✅ Accepting custom class
}) => {
  return (
    <section className={`intro section-padding ${customClass}`}>
      <div className="container">
        <div className="row lg-marg">
          <div className="col-lg-8">
            <div className="row lg-marg">
              <div className="col-md-6">
                <div>
                  <h3 className="mb-30">
                    {title}{" "}
                    {highlightedWords.map((word, index) => (
                      <span key={index} className="fw-300">
                        {word}
                        {index !== highlightedWords.length - 1 && " "}
                      </span>
                    ))}
                  </h3>
                </div>
              </div>
              <div className="col-md-6 text-left">
                <div className="text-left align-text">
                  {paragraphs.map((para, index) => (
                    <p key={index} className="mb-15 text-left align-text">
                      {para}
                    </p>
                  ))}

                  {listItems.length > 0 && (
                    <div className="mt-30">
                      <ul className="rest dot-list">
                        {listItems.map((item, index) => (
                          <li key={index} className="mb-10">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="numbers mt-80 md-mb50">
                <div className="row lg-marg">
                  <div className="col-md-6">
                    <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20 sm-mb30"></div>
                  </div>
                  <div className="col-md-6">
                    <div className="item bord-thin-top pt-30 d-flex align-items-end mt-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="img-full fit-img">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="custom-intro-img" // ✅ This class is scoped by customClass
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
