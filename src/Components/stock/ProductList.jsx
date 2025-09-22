import React from "react";
import PageTitle from "../UI/PageTitle";
import ItemsListing from "../ItemsListing";

function ProductList() {
  return (
    <section className="services-inline2 section-padding sub-bg bord-bottom-grd bord-top-grd">
      <div className="container ontop">
        <div className="sec-head mb-80">
          <div className="d-flex align-items-center">
            <div>
              <span className="sub-title main-color mb-5">Our Stocks</span>
              <h3 className="fw-600 fz-50 text-u d-rotate wow">
                <span className="rotate-text">
                  Trending <span className="fw-200">Stock.</span>
                </span>
              </h3>
            </div>
            <div className="ml-auto vi-more">
              <a href="#Hot" className="butn butn-sm butn-bord radius-30">
                <span>View All</span>
              </a>
              <span className="icon ti-arrow-top-right"></span>
            </div>
          </div>
        </div>

        {/* <div className="page_content">
          <PageTitle title="/Hot" />
          <div className="listing_section">
            <ItemsListing />
          </div>
      </div> */}
        <div className="page_content">
          <PageTitle title="Models" />
          <div className="listing_section">
            <ItemsListing category="models" />
          </div>
        </div>
        <div className="page_content">
          <PageTitle title="Images" />
          <div className="listing_section">
            <ItemsListing category="images" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductList;
