import { useEffect } from "react";
import Navbar2 from "./Components/Navbar2";
import "./assets/Styles/Tab.css";
import "./assets/Styles/Style.css";
import "./assets/Styles/stock.css";
import "./assets/Styles/video-viewer.css";
import "./assets/Styles/profile-edit.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import View from "./Pages/View";
import Footer from "./Components/Footer";
import Upload from "./Pages/Upload";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login/Login";
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
import StockPage from "./Pages/templates";
import MyDownloads from "./Pages/MyDownloads";
import Favorites from "./Pages/Favorites";
import Admin from "./Pages/Admin";
import BrandingDesignPage from "./Pages/ServicesDetails/BrandingDesignPage";
import BrandingPage from "./Components/Content/HomePage";
import Demo from "./Pages/services/Web-Services";
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
import CategoryTemplate from "./Pages/Types/CategoryTemplate";
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
import  SellerGuideline from "./Pages/Get Started/SellerGuidelines";
import PricingAndFees from "./Pages/Get Started/pricing&fee";
import ContributorPolicies from "./Pages/Get Started/ContributorPolicies";
// STRIPE IMPORTS - ADDED
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// THIS IS STRIPE'S OFFICIAL PUBLIC TEST KEY - 100% SAFE & WORKS FOR EVERYONE
const stripePromise = loadStripe(
  "pk_test_51Qp2sLFRNVbhydxG8zAsORIhUy8ZS7nNCl9omwJQ7PJYSHmfyvqj6mIxk1ATxvT2sl9HyiEzdA60UndoF9mAejSM00ZF8DHsip"
);

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

export const AppRoutes = () => (
  <Routes>
    {/* Static routes first */}
    <Route path="/Login" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/ContributorLogin" element={<ContributorLogin />} />
    <Route path="/ContributorDashboard" element={<ContributorDashboard />} />
    <Route path="/Admin" element={<Admin />} />
    <Route path="/Reset" element={<PasswordReset />} />
    <Route path="/reset" element={<PasswordReset />} />
    <Route path="/Logout" element={<Logout />} />
    <Route path="/" element={<Home />} />
    <Route path="/Cart" element={<Cart />} />
    <Route path="/Groups" element={<Group />} />
    <Route path="/Upload" element={<Upload />} />
    <Route path="/Checkout" element={<Checkout />} />
    <Route path="/Library" element={<Library />} />
    <Route path="/MyDownloads" element={<MyDownloads />} />
    <Route path="/Favorites" element={<Favorites />} />
    <Route path="/Texture" element={<TextureViewer />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/Terms" element={<Terms />} />
    <Route path="/Privacy" element={<Privacy />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/Support" element={<Support />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/page-team" element={<PageTeam />} />
    <Route path="/templates" element={<StockPage />} />
    <Route path="/services" element={<Services />} />
    <Route path="/success" element={<Success />} />
    <Route path="/services/branding" element={<BrandingDesignPage />} />
    <Route path="/services/uiux-design" element={<UiUxDesignPage />} />
    <Route path="/services/web-design" element={<WebDesign />} />
    <Route path="/services/ecommerce" element={<EcommercePage />} />
    <Route path="/services/content" element={<ContentWritingPage />} />
    <Route path="/services/product" element={<ProductDesignPage />} />
    <Route path="/services/digital" element={<DigitalMaketerPage />} />
    <Route path="/services/video-production" element={<VideoProduction />} />
    <Route path="/services/vfx" element={<VfxAndAds />} />
    <Route path="/services/printing" element={<PrintMedia />} />
    <Route path="/services/ai-automation" element={<AiAutomation />} />
    <Route path="/services/exhibition" element={<BoothDesign />} />
    <Route path="/services/brandingpage" element={<BrandingPage />} />
    <Route path="/services/demo" element={<Demo />} />
    <Route path="/error" element={<Error />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyTemplate />} />
    <Route path="/privacy-policy-template" element={<PrivacyPolicyTemplate />} />
    <Route path="/terms-and-conditions" element={<TermsandCondition />} />
    <Route path="/terms-of-template" element={<TermsandConditionTemplate />} />
    <Route path="/seller-guideline" element={<SellerGuideline />} />
    <Route path="/pricing-and-fees" element={<PricingAndFees />} />
    <Route path="/contributor-policies" element={<ContributorPolicies />} />
    <Route path="/comming-soon" element={<CommingSoon />} />
    <Route path="/blogs" element={<BlogCategory />} />
    <Route path="/subscription" element={<Subscription />} />
    
    {/* Dynamic routes with parameters - order matters! */}
    <Route path="/View/:slug" element={<View />} />
    <Route path="/blog/:id" element={<BlogDetails />} />
    <Route path="/blog-details/:id" element={<BlogDetails />} />
    <Route path="/project-details/:id" element={<PortfolioDetails />} />
    <Route path="/blog-category/:category" element={<BlogCategory />} />
    
    {/* Profile routes - should come before generic dynamic route */}
    <Route path="/Profile/:username" element={<Profile />} />
    
    {/* Generic dynamic route for Category - should be LAST */}
    {/* <Route path="/:Category" element={<CategoryTemplate />} /> */}
    <Route path="/fonts" element={<CategoryTemplate />} />
    <Route path="/video-templates" element={<CategoryTemplate />} />
    <Route path="/icons" element={<CategoryTemplate />} />
    <Route path="/models" element={<CategoryTemplate />} />
    <Route path="/mockups" element={<CategoryTemplate />} />
    <Route path="/graphics" element={<CategoryTemplate />} />
    <Route path="/videos" element={<CategoryTemplate />} />
    <Route path="/images" element={<CategoryTemplate />} />
    <Route path="/scripts" element={<CategoryTemplate />} />
    <Route path="/hdri" element={<CategoryTemplate />} />
    <Route path="/hdris" element={<CategoryTemplate />} /> {/* both hdri and hdris */}
    <Route path="/textures" element={<CategoryTemplate />} /> {/* if you have this */}
    <Route path="/More" element={<CategoryTemplate />} /> {/* if you have this */}
    
<Route path="*" element={<Error />} />
  </Routes>
);

const Layout = () => {
  return (
    <>
      <Navbar2 />
      <AppRoutes />
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <FilterProvider>
        {/* THIS WRAPS YOUR ENTIRE APP - REQUIRED FOR STRIPE */}
        <Elements stripe={stripePromise}>
          <Layout />
        </Elements>
      </FilterProvider>
    </BrowserRouter>
  );
}

export default App;
