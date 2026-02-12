"use client";
import React, { useEffect, useMemo } from "react";

import loadBackgroudImages from "../../../src/common/loadBackgroudImages";

function FirstPage() {
  useEffect(() => {
    loadBackgroudImages();
  }, []);

  return (
   <header className="main-header valign" style={{ position: 'relative', overflow: 'hidden' }}>
  {/* 1. Actual Image Tag (For Performance) */}
  <img 
    src="/assets/imgs/background/bg5.webp" 
    alt="Background"
    fetchPriority="high" 
    loading="eager"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: -1,
      // Overlay effect (data-overlay-dark="7" ka alternative)
      filter: 'brightness(0.3)' 
    }}
  />

  <div className="container ontop" data-aos="fade-up" data-aos-duration="3000">
    <div className="row">
      <div className="col-lg-11">
        <div className="caption">
          <h1 className="new">Top Advertising Agency :</h1>
          <h1>
            Elevate Your <span className="main-color">Brand</span> Today
          </h1>
        </div>
      </div>
    </div>

    <div className="row mt-80">
      <div className="col-lg-6 order-md-2">
        <div className="icon-img">
          {/* LCP area mein loading="lazy" hata dein */}
          <img src="/assets/imgs/icon-img/arrow-down-big.png" alt="" />
        </div>
      </div>
      <div className="col-lg-6 d-flex justify-content-end order-md-1">
        <div className="info">
          <h2 className="mb-10">6k +</h2>
          <h6>
            Projects completed <br />
            <span className="main-color">successfully</span>
          </h6>
        </div>
      </div>
    </div>
  </div>
</header>
  );
}

export default FirstPage;
