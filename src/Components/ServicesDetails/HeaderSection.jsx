"use client";
import React, { useEffect } from "react";
import loadBackgroudImages from "../../common/loadBackgroudImages";

const HeaderSection = ({
  title = "",
  highlightedText = "",
  backgroundImage = "/assets/imgs/background/bg4.jpg",
  overlayDark = "8",
}) => {
  useEffect(() => {
    loadBackgroudImages();
  }, []);

  return (
    <header
      className="page-header bg-img section-padding valign"
      data-background={backgroundImage}
      data-overlay-dark={overlayDark}
    >
      <div className="container pt-80">
        <div className="row">
          <div className="col-12">
            <div className="text-center">
              <h1 className="text-u ls1 fz-80">
                {title} <span className="fw-200">{highlightedText}</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
