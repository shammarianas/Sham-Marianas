"use client";
import React from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Testimonials() {
  const swiperOptions = {
    modules: [Navigation],
    slidesPerView: "auto",

    spaceBetween: 30,
    loop: true,
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: "auto",
      },
    },

    navigation: {
      nextEl: ".testim-modern .swiper-button-next",
      prevEl: ".testim-modern .swiper-button-prev",
    },
  };
  return (
    <section className="testim-modern section-padding sub-bg bord-top-grd bord-bottom-grd">
      <div className="container">
        <div className="sec-head mb-80">
          <div className="d-flex align-items-center">
            <div>
              <span className="sub-title main-color mb-5">Testimonials</span>
              <h3 className="fw-600 fz-50 text-u d-rotate wow">
                <span className="rotate-text">
                  Trusted <span className="fw-200">by Clients</span>
                </span>
              </h3>
            </div>
            <div className="ml-auto">
              <div className="swiper-arrow-control">
                <div className="swiper-button-prev">
                  <span className="ti-arrow-left"></span>
                </div>
                <div className="swiper-button-next">
                  <span className="ti-arrow-right"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="testim-swiper3 out-right"
          data-carousel="swiper"
          data-loop="true"
          data-space="30"
        >
          <Swiper
            {...swiperOptions}
            id="content-carousel-container-unq-testim"
            className="swiper-container"
            data-swiper="container"
          >
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">Project Manager</h6>
                  <div className="text">
                    <p>
                      With Sham-Marianas expert strategies and innovative
                      solutions, we optimized our operations and unlocked new
                      growth opportunities, setting us on the path to success.
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                <div className="img fit-img-new ">
                        <img src="/assets/imgs/testim/t2.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Rami Al-Hassan</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        Project Manager
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">
                    Business Development Director
                  </h6>
                  <div className="text">
                    <p>
                      Working with Sham Marianas has been an absolute
                      game-changer! Their team’s creativity and strategic
                      brilliance completely transformed our brand identity
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                <div className="img fit-img-new">
                        <img src="/assets/imgs/testim/t3.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Faisal Nasser</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        Business Development Director
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">
                    Chief Marketing Officer (CMO)
                  </h6>
                  <div className="text">
                    <p>
                      We gave Sham-Marianas a challenging task—to simplify a
                      complex issue and engage key stakeholders. They delivered
                      an innovative, compelling solution that captured attention
                      and drove results.
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                <div className="img fit-img-new">
                        <img src="/assets/imgs/testim/t4.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Omar Farid</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        Chief Marketing Officer (CMO)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">IT Specialist (Spain)</h6>
                  <div className="text">
                    <p>
                      Sham-Marianas exceeded our expectations with their
                      exceptional services. From branding to website design,
                      they delivered creative, original, and impactful solutions
                      that perfectly conveyed our vision.
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                <div className="img fit-img-new">
                        <img src="/assets/imgs/testim/t5.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Carlos García</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        IT Specialist (Spain)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">
                    Senior Software Engineer (Russia)
                  </h6>
                  <div className="text">
                    <p>
                      We partnered with Sham-Marianas to elevate our brand and
                      market positioning. They delivered exceptional results—an
                      impressive brand identity, strategic campaigns, and
                      outstanding support at every step.
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                <div className="img fit-img-new ">
                        <img src="/assets/imgs/testim/t6.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Nikolai Ivanov</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        Senior Software Engineer (Russia)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">
                    Senior Data Analyst (Czech Republic)
                  </h6>
                  <div className="text">
                    <p>
                      I highly recommend Sham-Marianas for their strategic and
                      results-driven approach. They provided actionable
                      solutions that optimized our operations, enhanced
                      efficiency, and delivered outstanding results with
                      professionalism and precision.
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                   <div className="img fit-img-new ">
                        <img src="/assets/imgs/testim/t7.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Martin Novak</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        Senior Data Analyst (Czech Republic)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">
                    Executive Assistant (Germany)
                  </h6>
                  <div className="text">
                    <p>
                      Sham-Marianas impressed us with their unique and
                      innovative approach. Their solution received overwhelming
                      praise from our leadership team.
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                <div className="img fit-img-new">
                        <img src="/assets/imgs/testim/1.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Anja Schmidt</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        Executive Assistant (Germany)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="cont">
                  <h6 className="sub-title mb-15">
                    On-page SEO Specialist (Germany)
                  </h6>
                  <div className="text">
                    <p>
                      Sham-MarianSall delivered impactful and creative solutions
                      that strengthened our community outreach efforts.
                    </p>
                  </div>
                </div>
                <div className="info">
                  <div className="d-flex align-items-center">
                    <div>
                   <div className="img fit-img-new ">
                        <img src="/assets/imgs/testim/t1.jpg" alt="" />
                      </div>
                    </div>
                    <div className="ml-20">
                      <h6 className="fz-18">Julia Müller</h6>
                      <span className="p-color opacity-8 fz-15 mt-5">
                        On-page SEO Specialist (Germany)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
