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
import Blogs from "./Pages/Blog-details";
import Portfolio from "./Pages/portfolio";
import PortfolioDetails from "./Pages/project-details";
import Support from "./Pages/Support";
import AboutUs from "./Pages/AboutUs";
import Services from "./Pages/services";

import StockPage from "./Pages/Stock";
import MyDownloads from "./Pages/MyDownloads";
import Favorites from "./Pages/Favorites";
import Admin from "./Pages/Admin";

// Services Route
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

import Success from "./Pages/Success";

import CategoryTemplate from "./Pages/Types/CategoryTemplate";
import PageTeam from "./Pages/Page-team";
import Error from "./Pages/Error";
// CategoryTemplate.js

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/Login" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/Admin" element={<Admin />} />
    <Route path="/Reset" element={<PasswordReset />} />
    <Route path="/reset" element={<PasswordReset />} />
    <Route path="/Logout" element={<Logout />} />
    <Route path="/Profile/:id" element={<Profile />} />
    <Route path="/" element={<Home />} />
    <Route path="/Cart" element={<Cart />} />
    <Route path="/View/:id" element={<View />} />
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
    <Route path="/blog-details/:id" element={<Blogs />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/project-details/:id" element={<PortfolioDetails />} />
    <Route path="/Support" element={<Support />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/page-team" element={<PageTeam />} />
    <Route path="/stock" element={<StockPage />} />
    <Route path="/services" element={<Services />} />
    <Route path="/success" element={<Success />} />

    {/* Static individual service pages */}
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

    {/* Demo Page */}
    <Route path="/services/brandingpage" element={<BrandingPage />} />
    <Route path="/services/demo" element={<Demo />} />

    {/* Optional: 404 fallback */}
    <Route path="/:Category" element={<CategoryTemplate />} />
    <Route path="*" element={<Error />} />
  </Routes>
);

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <FilterProvider>
          <Navbar2 />

          <AppRoutes />
        </FilterProvider>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
