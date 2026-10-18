"use client";
import "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

function Clients() {
  const swiperOptions = {
    slidesPerView: 5,
    loop: true,
    spaceBetween: 40,
    speed: 6000,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      reverseDirection: true,
      pauseOnMouseEnter: false,
    },
    allowTouchMove: false,
    breakpoints: {
      0: {
        slidesPerView: 2,
      },
      640: {
        slidesPerView: 3,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 5,
      },
    },
  };
  return (
    <section
      className="clients-carso section-padding pt-0"
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          width: "100%",
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
          maxWidth: "1280px",
          marginRight: "auto",
          marginLeft: "auto",
        }}
      >
        <div className="row justify-content-center">
          <div className="col-lg-10 col-md-11">
            <div className="sec-head text-center mb-80 clients-heading">
              <h3>
                We&lsquo;re proud to work with{" "}
                <span className="opacity-7">a diverse range of companies.</span>
              </h3>
            </div>
          </div>
        </div>
        <div
          className="swiper5"
          data-carousel="swiper"
          data-items="5"
          data-loop="true"
          data-space="40"
        >
          <Swiper
            {...swiperOptions}
            id="content-carousel-container-unq-clients"
            className="swiper-container clients-loop-swiper"
            modules={[Autoplay]}
            data-swiper="container"
          >
            <SwiperSlide>
              <div className="item">
                <div className="img icon-img-200">
                  <img  loading="lazy"  src="/assets/imgs/brands/02.png" alt="" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="img icon-img-200">
                  <img  loading="lazy"  src="/assets/imgs/brands/03.png" alt="" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="img icon-img-200">
                  <img  loading="lazy"  src="/assets/imgs/brands/04.png" alt="" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="img icon-img-200">
                  <img  loading="lazy"  src="/assets/imgs/brands/05.png" alt="" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="img icon-img-200">
                  <img  loading="lazy"  src="/assets/imgs/brands/06.png" alt="" />
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="item">
                <div className="img icon-img-200">
                  <img  loading="lazy"  src="/assets/imgs/brands/07.png" alt="" />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
        <div className="sec-bottom mt-100">
          <div className="main-bg d-flex align-items-center">
            <h6 className=" fw-400" style={{ fontSize: "12px" }}>
              More than <span className="fw-600"> 300+ companies</span> {" "}
              trusted us worldwide
            </h6>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Clients;
