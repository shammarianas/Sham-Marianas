import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar2 from "./Components/Navbar2";
import "./assets/Styles/Tab.css";
import "./assets/Styles/Style.css";
import "./assets/Styles/stock.css";
import "./assets/Styles/video-viewer.css";
import "./assets/Styles/profile-edit.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import View from "./Pages/View";
import Footer from "./Components/Footer";
import Upload from "./Pages/Upload";
// import Cart from "./Pages/Cart";
import Login from "./Pages/Login/Login";
import AutoLoginTeam from "./Pages/Login/AutoLoginTeam";

import Checkout from "./Pages/Checkout";
import { FilterProvider } from "./Context/FilterContext";
import Profile from "./Pages/Profile";
import ProfileByUsername from "./Context/ProfileByUsername";
import Logout from "./Pages/Logout";
import Library from "./Pages/Library";
import TextureViewer from "./Components/TextureViewer";
import PasswordReset from "./Pages/Login/PasswordReset";
import Group from "./Pages/Group";
import Analytics from "./Pages/Analytics";
import Terms from "./Pages/Terms";
import Privacy from "./Pages/Privacy";
import Contact from "./Pages/Contact";
import Blog from "./Pages/Blog";
import BlogDetails from "./Pages/Blog-details";
import Portfolio from "./Pages/portfolio";
import PortfolioDetails from "./Pages/project-details";
import Support from "./Pages/Support";
import AboutUs from "./Pages/AboutUs";
import Services from "./Pages/services";
import MyDownloads from "./Pages/MyDownloads";
import Favorites from "./Pages/Favorites";
import Admin from "./Pages/Admin";
import BrandingDesignPage from "./Pages/ServicesDetails/BrandingDesignPage";
import UiUxDesignPage from "./Pages/ServicesDetails/UIUXDesignPage";
import WebDesign from "./Pages/ServicesDetails/WebDevelopment";
import EcommercePage from "./Pages/ServicesDetails/E-CommercePage";
import ContentWritingPage from "./Pages/ServicesDetails/ContentWritingPage";
import ProductDesignPage from "./Pages/ServicesDetails/ProductDesignPage";
import DigitalMaketerPage from "./Pages/ServicesDetails/Digital-Marketer";
import VfxAndAds from "./Pages/ServicesDetails/VfxAndAds";
import VideoProduction from "./Pages/ServicesDetails/Video-Production";
import PrintMedia from "./Pages/ServicesDetails/PrintMedia";
import AiAutomation from "./Pages/ServicesDetails/AiAutomation";
import BoothDesign from "./Pages/ServicesDetails/BoothDesign";
import Success from "./Pages/Success";
import PageTeam from "./Pages/Page-team";
import Error from "./Pages/Error";
import PrivacyPolicy from "./Pages/Get Started/PrivacyPolice";
import TermsandCondition from "./Pages/Get Started/Terms&Condition";
import CommingSoon from "./Pages/CommingSoon";
import BlogCategory from "./Pages/Blog-Category";
import Subscription from "./Pages/Subscription";
import ContributorLogin from "./Pages/Login/ContributorLogin";
import ContributorDashboard from "./Components/UI/dashboard/Contributor/ContributorDashboard";
import PrivacyPolicyTemplate from "./Pages/Get Started/privacyTemplate";
import TermsandConditionTemplate from "./Pages/Get Started/termsOfTemplate";
import SellerGuideline from "./Pages/Get Started/SellerGuidelines";
import PricingAndFees from "./Pages/Get Started/pricing&fee";
import ContributorPolicies from "./Pages/Get Started/ContributorPolicies";
import ChatWidget from "./Components/ChatWidget";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const NoIndexRoute = ({ children }) => (
  <>
    {children}
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Helmet>
  </>
);

const noIndex = (element) => <NoIndexRoute>{element}</NoIndexRoute>;

export const AppRoutes = () => (
  <Routes>
    {/* Static routes first */}
    <Route path="/Login" element={noIndex(<Login />)} />
    <Route path="/auto-login-team" element={noIndex(<AutoLoginTeam />)} />

    <Route path="/login" element={noIndex(<Login />)} />
    <Route path="/ContributorLogin" element={noIndex(<ContributorLogin />)} />
    <Route path="/ContributorDashboard" element={noIndex(<ContributorDashboard />)} />
    <Route path="/Admin" element={noIndex(<Admin />)} />
    <Route path="/Reset" element={noIndex(<PasswordReset />)} />
    <Route path="/reset" element={noIndex(<PasswordReset />)} />
    <Route path="/Logout" element={noIndex(<Logout />)} />
    <Route path="/" element={<Home />} />
    <Route path="/Groups" element={noIndex(<Group />)} />
    <Route path="/Upload" element={noIndex(<Upload />)} />
    <Route path="/Checkout" element={noIndex(<Checkout />)} />
    <Route path="/Library" element={noIndex(<Library />)} />
    <Route path="/MyDownloads" element={noIndex(<MyDownloads />)} />
    <Route path="/Favorites" element={noIndex(<Favorites />)} />
    <Route path="/Texture" element={noIndex(<TextureViewer />)} />
    <Route path="/analytics" element={noIndex(<Analytics />)} />
    <Route path="/Terms" element={noIndex(<Terms />)} />
    <Route path="/Privacy" element={noIndex(<Privacy />)} />
    <Route path="/contact-us" element={<Contact />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/Support" element={noIndex(<Support />)} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/page-team" element={<PageTeam />} />
    <Route path="/services" element={<Services />} />
    <Route path="/templates" element={<Navigate to="/services" replace />} />
    <Route path="/category/:category" element={<Navigate to="/services" replace />} />
    <Route path="/success" element={noIndex(<Success />)} />
    <Route path="/services/branding-design" element={<BrandingDesignPage />} />
    <Route path="/services/uiux-design" element={<UiUxDesignPage />} />
    <Route path="/services/web-development" element={<WebDesign />} />
    <Route path="/services/ecommerce-solutions" element={<EcommercePage />} />
    <Route path="/services/content-writing" element={<ContentWritingPage />} />
    <Route path="/services/product-design" element={<ProductDesignPage />} />
    <Route
      path="/services/social-media-digital-marketing"
      element={<DigitalMaketerPage />}
    />
    <Route path="/services/video-production" element={<VideoProduction />} />
    <Route path="/services/vfx-and-cgi-ads" element={<VfxAndAds />} />
    <Route path="/services/print-media-solutions" element={<PrintMedia />} />
    <Route path="/services/ai-automation" element={<AiAutomation />} />
    <Route path="/services/exhibition-booth-design" element={<BoothDesign />} />
    <Route
      path="/services/brandingpage"
      element={<Navigate to="/services/uiux-design" replace />}
    />
    <Route path="/error" element={<Error />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route
      path="/privacy-policy-template"
      element={<PrivacyPolicyTemplate />}
    />
    <Route path="/terms-and-conditions" element={<TermsandCondition />} />
    <Route
      path="/terms-condition-template"
      element={<TermsandConditionTemplate />}
    />
    <Route path="/seller-guideline" element={<SellerGuideline />} />
    <Route path="/prices-and-fees" element={<PricingAndFees />} />
    <Route path="/contributor-policies" element={<ContributorPolicies />} />
    <Route path="/coming-soon" element={noIndex(<CommingSoon />)} />
    <Route path="/blogs" element={<BlogCategory />} />
    <Route path="/subscription" element={noIndex(<Subscription />)} />
    {/* Dynamic routes with parameters - order matters! */}
    <Route path="/View/:slug" element={<View />} />
    <Route path="/blog/:id" element={<BlogDetails />} />
    <Route path="/blog-details/:id" element={<BlogDetails />} />
    <Route path="/project-details/:id" element={<PortfolioDetails />} />
    <Route path="/blog-category/:category" element={<BlogCategory />} />

    {/* Profile routes - should come before generic dynamic route */}
    <Route path="/profile/:username" element={<Profile />} />
    <Route path="/:username" element={<Profile />} />

    {/* if you have this */}
    <Route path="*" element={<Error />} />
  </Routes>
);

const Layout = () => {
  return (
    <>
      <Navbar2 />
      <AppRoutes />
      <Footer />
      <ChatWidget />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <FilterProvider>
        {/* THIS WRAPS YOUR ENTIRE APP - REQUIRED FOR STRIPE  */}
        {/* <Elements stripe={stripePromise}> */}
          <Layout />
        {/* </Elements> */}
      </FilterProvider>
    </BrowserRouter>
  );
}

export default App;
