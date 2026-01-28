import Lines from '../common/Lines';
import ProgressScroll from '../common/ProgressScroll';
import Blogs from '../Components/blog-classic/Blogs';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useGSAP } from '@gsap/react';
import { useEffect, useRef } from 'react';
gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function BlogClassic() {
  const main = useRef();

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = () => {
          resolve(true);
        };

        script.onerror = () => {
          reject(new Error(`Failed to load ${src}`));
        };

        document.body.appendChild(script);
      });
    };

    // Load ScrollSmoother.min.js first
    loadScript('/assets/js/gsap.min.js')
      .then(() => {
        loadScript('/assets/js/ScrollSmoother.min.js');
      })
      .then(() => {
        // Once ScrollSmoother.min.js is loaded, load smoother-script.js
        return loadScript('/assets/js/smoother-script.js');
      })
      .catch((error) => {
        console.error(error.message);
      });

  }, []);

  return (
    <>
      
      <body>
        {/* <Cursor /> */}
        <ProgressScroll />
        <Lines />
        {/* <Navbar /> */}
        <div id="smooth-wrapper" ref={main}>
          <div id="smooth-content">
            <main className="main-bg">
              {/* <Header /> */}
              <Blogs />
            </main>
            {/* <Footer /> */}
          </div>
        </div>
      </body>
    </>
  );
}
