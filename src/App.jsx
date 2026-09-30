import { lazy, Suspense, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar2 from "./Components/Navbar2";
import "./assets/Styles/Tab.css";
import "./assets/Styles/Style.css";
import "./assets/Styles/stock.css";
import "./assets/Styles/video-viewer.css";
import "./assets/Styles/profile-edit.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Footer from "./Components/Footer";
import { FilterProvider } from "./Context/FilterContext";
import ChatWidget from "./Components/ChatWidget";

const View = lazy(() => import("./Pages/View"));
const Upload = lazy(() => import("./Pages/Upload"));
const Login = lazy(() => import("./Pages/Login/Login"));
const AutoLoginTeam = lazy(() => import("./Pages/Login/AutoLoginTeam"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const Profile = lazy(() => import("./Pages/Profile"));
const Logout = lazy(() => import("./Pages/Logout"));
const Library = lazy(() => import("./Pages/Library"));
const TextureViewer = lazy(() => import("./Components/TextureViewer"));
const PasswordReset = lazy(() => import("./Pages/Login/PasswordReset"));
const Group = lazy(() => import("./Pages/Group"));
const Analytics = lazy(() => import("./Pages/Analytics"));
const Terms = lazy(() => import("./Pages/Terms"));
const Privacy = lazy(() => import("./Pages/Privacy"));
const Contact = lazy(() => import("./Pages/Contact"));
const Blog = lazy(() => import("./Pages/Blog"));
const BlogDetails = lazy(() => import("./Pages/Blog-details"));
const Portfolio = lazy(() => import("./Pages/portfolio"));
const PortfolioDetails = lazy(() => import("./Pages/project-details"));
const Support = lazy(() => import("./Pages/Support"));
const AboutUs = lazy(() => import("./Pages/AboutUs"));
const Services = lazy(() => import("./Pages/services"));
const MyDownloads = lazy(() => import("./Pages/MyDownloads"));
const Favorites = lazy(() => import("./Pages/Favorites"));
const Admin = lazy(() => import("./Pages/Admin"));
const BrandingDesignPage = lazy(() => import("./Pages/ServicesDetails/BrandingDesignPage"));
const UiUxDesignPage = lazy(() => import("./Pages/ServicesDetails/UIUXDesignPage"));
const WebDesign = lazy(() => import("./Pages/ServicesDetails/WebDevelopment"));
const EcommercePage = lazy(() => import("./Pages/ServicesDetails/E-CommercePage"));
const ContentWritingPage = lazy(() => import("./Pages/ServicesDetails/ContentWritingPage"));
const ProductDesignPage = lazy(() => import("./Pages/ServicesDetails/ProductDesignPage"));
const DigitalMaketerPage = lazy(() => import("./Pages/ServicesDetails/Digital-Marketer"));
const VfxAndAds = lazy(() => import("./Pages/ServicesDetails/VfxAndAds"));
const VideoProduction = lazy(() => import("./Pages/ServicesDetails/Video-Production"));
const PrintMedia = lazy(() => import("./Pages/ServicesDetails/PrintMedia"));
const AiAutomation = lazy(() => import("./Pages/ServicesDetails/AiAutomation"));
const BoothDesign = lazy(() => import("./Pages/ServicesDetails/BoothDesign"));
const Success = lazy(() => import("./Pages/Success"));
const PageTeam = lazy(() => import("./Pages/Page-team"));
const Error = lazy(() => import("./Pages/Error"));
const PrivacyPolicy = lazy(() => import("./Pages/Get Started/PrivacyPolice"));
const TermsandCondition = lazy(() => import("./Pages/Get Started/Terms&Condition"));
const CommingSoon = lazy(() => import("./Pages/CommingSoon"));
const BlogCategory = lazy(() => import("./Pages/Blog-Category"));
const Subscription = lazy(() => import("./Pages/Subscription"));
const ContributorLogin = lazy(() => import("./Pages/Login/ContributorLogin"));
const ContributorDashboard = lazy(() => import("./Components/UI/dashboard/Contributor/ContributorDashboard"));
const PrivacyPolicyTemplate = lazy(() => import("./Pages/Get Started/privacyTemplate"));
const TermsandConditionTemplate = lazy(() => import("./Pages/Get Started/termsOfTemplate"));
const SellerGuideline = lazy(() => import("./Pages/Get Started/SellerGuidelines"));
const PricingAndFees = lazy(() => import("./Pages/Get Started/pricing&fee"));
const ContributorPolicies = lazy(() => import("./Pages/Get Started/ContributorPolicies"));
const StockPage = lazy(() => import("./Pages/templates"));
const CategoryTemplate = lazy(() => import("./Pages/Types/CategoryTemplate"));

const RouteFallback = () => (
  <div
    role="status"
    aria-live="polite"
    style={{
      minHeight: "40vh",
      display: "grid",
      placeItems: "center",
      color: "#fff",
      background: "#0a0a0a",
    }}
  >
    Loading...
  </div>
);

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
  <Suspense fallback={<RouteFallback />}>
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
    <Route path="/templates" element={<StockPage />} />
    <Route path="/category/:category" element={<CategoryTemplate />} />
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
    <Route path="/blogs" element={<Navigate to="/blog" replace />} />
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
  </Suspense>
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
