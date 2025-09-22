"use client";
import React from "react";

function ProductDesign() {
  function openAccordion(event) {
    document.querySelectorAll(".accordion-info").forEach((element) => {
      element.classList.remove("active");
      element.style.maxHeight = 0;
      element.parentElement.classList.remove("active");
    });
    event.currentTarget.parentElement.classList.add("active");
    event.currentTarget.nextElementSibling.style.maxHeight = "300px";
    event.currentTarget.nextElementSibling.classList.add("active");
  }
  return (
    <>
      <section className="container section-padding">
        <div className="col-md-6">
          <h6 className="sub-title main-color mb-15">
            Crafting Products That Speak to the Senses
          </h6>

          <div className="text">
            <p className="mb-15">
              True product design lives in the details—at Sham Marianas, we
              transform bold ideas into beautifully crafted physical products
              that look stunning, feel right, and work effortlessly. Every curve
              and edge is thoughtfully designed for maximum comfort and
              functionality. We ensure each product is user-friendly, durable,
              and easy to use, with materials that elevate the experience and
              designs that make every interaction feel intuitive. Whether
              it&apos;s the seamless flow of a touch screen, the responsive feel
              of a button, or the long-lasting quality of your product, we craft
              solutions that work in harmony with the user&apos;s needs. We
              blend aesthetics with function to create products that don&apos;t
              just stand out — they become essentials.
            </p>
          </div>
        </div>
      </section>
      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6">
              <div className="img md-mb50">
                <img src="/assets/imgs/arw2.png" alt="" />
              </div>
            </div>
            <div className="col-lg-6 valign">
              <div>
                <div className="sec-head mb-50">
                  <h6 className="sub-title main-color mb-15">
                    Designs That Transform Ideas into Iconic Products
                  </h6>
                  <p>
                    At Sham Marianas, we believe great products start with bold
                    ideas and end with unforgettable designs. Whether it&apos;s
                    an innovative gadget or a practical everyday item, we
                    specialize in creating products that look stunning, feel
                    intuitive, and work seamlessly. From the initial concept to
                    the final prototype, our design process focuses on
                    user-centered solutions, ergonomics, and market-ready
                    innovation. We balance form with function to ensure that
                    your product isn&apos;t just visually appealing but also
                    practical and durable. Every detail, from materials to user
                    interaction, is crafted to enhance the experience and create
                    lasting impressions. With Sham Marianas, your product
                    won&apos;t just fit in—it will stand out, engage users, and
                    make a lasting impact in the market.
                  </p>
                </div>

                <h6 className="sub-title main-color mb-15">
                  Frequently Asked Questions
                </h6>
                <div className="accordion bord">
                  <div
                    className="item active wow fadeInUp"
                    data-wow-delay=".1s"
                  >
                    <div onClick={openAccordion} className="title">
                      <h6>What types of products do you design?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We specialize in a wide range of industrial product
                        designs, from high-tech gadgets to everyday tools.
                        Whether you need a consumer product or a more
                        specialized tool, we create designs that are as
                        functional as they are stunning.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        How do you ensure my product design is user-friendly?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        At Sham Marianas, we place the user at the heart of
                        every design. Through user-centered design principles,
                        we craft products that are not only intuitive to use but
                        also comfortable and functional. We carefully consider
                        every detail, from ergonomic shapes to seamless
                        interactions, ensuring your product is a joy for
                        customers to use.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>What makes Sham Marianas design process unique?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        At Sham Marianas, we place the user at the heart of
                        every design. Through user-centered design principles,
                        we craft products that are not only intuitive to use but
                        also comfortable and functional. We carefully consider
                        every detail, from ergonomic shapes to seamless
                        interactions, ensuring your product is a joy for
                        customers to use.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>What makes Sham Marianas design process unique?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        We blend creativity with precision. From concept
                        development to prototyping, we focus on market-ready
                        innovation and aesthetics that align with your brand's
                        vision. Our design approach ensures your product is not
                        just beautiful but also practical, durable, and designed
                        for real-world success.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>
                        Can you work with my existing product ideas or sketches?
                      </h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Absolutely! We can take your sketches or ideas and turn
                        them into tangible, high-quality products. Our team
                        refines your concept through detailed 3D modeling,
                        prototyping, and user testing, ensuring the final design
                        is both innovative and practical.
                      </p>
                    </div>
                  </div>
                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>How do I get started?</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Reach out to us through our website. We&apos;ll schedule a
                        discovery session to understand your product goals and
                        start designing something your users will love.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductDesign;
