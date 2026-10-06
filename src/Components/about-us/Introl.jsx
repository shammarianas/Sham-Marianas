import "react";
import { Link } from "react-router-dom";

function Intro() {
  return (
    <section className="page-intro section-padding pb-0">
      <div className="container">
        <div className="item pt-10 d-flex align-items-center">
          <div className="cont">
            <p className="mb-50 fw-300 align-text" style={{ fontSize: "24px" }}>
              Ehtasham ul Haq, A seasoned expert with 12 years of experience in
              advertising, started Sham Marianas F.Z.C in 2022. In order to convey
              depth and purpose, the term Sham Marianas F.Z.C{"   "}
              <span className="fw-300" style={{ fontSize: "24px" }}>
                was thoughtfully created by fusing significant words.{" "}
              </span>{" "}
              This platform was developed to provide expert, high-quality
              services with an emphasis on customer happiness, innovation, and
              dependability.
            </p>
            <p className="mb-30 fw-300 align-text" style={{ fontSize: "24px" }}>
              Sham Marianas F.Z.C provides professional solutions that are suited to
              both individual and commercial needs. His areas of expertise
              include digital marketing, web development, and logo design. It
              guarantees excellent outcomes that propel success with a talented
              staff and innovative tactics.
            </p>
            <p className="mb-30 fw-300 align-text" style={{ fontSize: "24px" }}>
              Sham Marianas F.Z.C wants to become a prominent marketing agency brand
              by offering high-quality, reasonably priced solutions and ranking
              highly in search results. For success, Sham Marianas F.Z.C is your go-to
              source for site design, SEO optimization, and professional digital
              solutions.
            </p>
            <Link to="/services" className="underline main-color mt-40">
              <span className="text">
                Our Services <i className="ti-arrow-top-right"></i>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
