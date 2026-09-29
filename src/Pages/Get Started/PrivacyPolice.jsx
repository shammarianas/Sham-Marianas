import "react";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";


const PrivacyPolicy = () => {
  return (
   <>
   <SEO {...SEO_CONFIG.privacy} />

    <div className="section-padding">
      <div className="container mx-size">
        <h1 className="text-4xl fw-400 mb-6 text-center">Privacy Policy</h1>

        <h3 className="mt-5 fz-30 fw-300 mb-4">
          <strong>Beyond Policies We Practice Privacy</strong>
        </h3>

         <p className="fotter-police-p p-color ">
          At <span className="text-bold underline main-color">Sham Marianas F.Z.C</span>, your personal information is more than details it’s a reflection of you. We protect it like it's our own, with full transparency and next-level security.
        </p>
       <ul className="list-disc">

        <li className="fotter-police-p p-color ">
          <strong>No Secrets Here:</strong> We’ll always tell you why we’re collecting your info before or right when we do it. No shady stuff.
        </li>

        <li className="fotter-police-p p-color ">
          <strong>Purpose-Driven Only:</strong> Every bit of info we collect has a mission. If it doesn’t serve a purpose, we don’t need it.
        </li>

        <li className="fotter-police-p p-color ">
          <strong>Your Info Stays Yours:</strong> We never hand over your personal data to third parties unless the law taps us on the shoulder.
        </li>

        <li className="fotter-police-p p-color ">
          <strong>We Ask First:</strong> We only collect your data with your full consent, fair and square.
        </li>

        <li className="fotter-police-p p-color ">
          <strong>Old News Gets Deleted:</strong> If it’s outdated, irrelevant, or incorrect, it’s out. We don’t hold on to useless info.
        </li>

        <li className="fotter-police-p p-color mb-8">
          <strong>Fortress-Level Security:</strong> Your data is locked down tight with robust tech and strict access controls no breaches, no funny business.
        </li>
       </ul>
      </div>
    </div>
   </>
  );
};

export default PrivacyPolicy;
