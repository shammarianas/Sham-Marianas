"use client";
import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ✅ CHANGE 1: Remove unused imports
// ❌ Remove these lines:
// import { useGSAP } from "@gsap/react";
// import { useRef } from "react";

// ✅ CHANGE 2: Move gsap.registerPlugin outside component
gsap.registerPlugin(ScrollTrigger);

function LoadingScreen() {
  useEffect(() => {
    // ✅ CHANGE 3: Remove interval and run immediately
    // Remove the entire interval logic
    // const interval = setInterval(() => {
    //   if (typeof gsap !== "undefined") {
    //     clearInterval(interval);
    
    // Direct animation without delay
    const svg = document.getElementById("svg");
    const tl = gsap.timeline();
    const curve = "M0 502S175 272 500 272s500 230 500 230V0H0Z";
    const flat = "M0 2S175 1 500 1s500 1 500 1V0H0Z";

    // ✅ CHANGE 4: Reduce delay from 1.5 to 0.3
    tl.to(".loader-wrap-heading .load-text , .loader-wrap-heading .cont", {
      delay: 0.3, // Reduced from 1.5
      y: -100,
      opacity: 0,
      duration: 0.4, // Added duration
    });
    
    // ✅ CHANGE 5: Reduce animation durations
    tl.to(svg, {
      duration: 0.3, // Reduced from 0.5
      attr: { d: curve },
      ease: "power2.easeIn",
    }).to(svg, {
      duration: 0.3, // Reduced from 0.5
      attr: { d: flat },
      ease: "power2.easeOut",
    });
    
    // ✅ CHANGE 6: Faster exit animation
    tl.to(".loader-wrap", { 
      y: -1500,
      duration: 0.4, // Reduced
      ease: "power2.in",
      onComplete: () => {
        // Hide immediately
        const loader = document.querySelector(".loader-wrap");
        if (loader) {
          loader.style.display = "none";
        }
      }
    });
    
    // Remove these extra animations
    // tl.to(".loader-wrap", { zIndex: -1, display: "none" });
    // tl.from("header", { y: 0 }, "-=1.5");
    // tl.from("header .container", { y: 40, opacity: 1, delay: 0.3 }, "-=1.5");
    
    // }, 100);
    
    // ✅ CHANGE 7: Safety cleanup
    return () => {
      // Make sure loader is hidden on unmount
      const loader = document.querySelector(".loader-wrap");
      if (loader) {
        loader.style.display = "none";
      }
    };
  }, []);

  return (
    <div className="loader-wrap">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path id="svg" d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"></path>
      </svg>

      <div className="loader-wrap-heading">
        <div className="load-text">
          <span>L</span>
          <span>o</span>
          <span>a</span>
          <span>d</span>
          <span>i</span>
          <span>n</span>
          <span>g</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;