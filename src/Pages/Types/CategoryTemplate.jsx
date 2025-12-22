import { useLocation } from "react-router-dom";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import Cursor from "../../common/cusor";
import { SEO_CONFIG } from "../../utils/seoConfig";
import SEO from "../../common/SEO";

const CategoryTemplate = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Define your category mapping with custom labels
  const categoryMapping = {
    "/category/videos": "Videos",
    "/category/models": "3D Models", 
    "/category/video-templates": "Video Templates",
    "/category/images": "Images",
    "/category/graphics": "Graphic Templates",
    "/category/mockups": "Mockups",
    "/category/fonts": "Fonts",
    "/category/more": "More",
    "/category/icons": "Icons",
    "/category/textures": "Textures",
    "/category/scripts": "Scripts",
    "/category/hdris": "HDRIs",
    "/category/hot": "Hot"
  };

  // Direct mapping - use the pathname to get the label
  let categoryTitle = categoryMapping[pathname];
  let category = "";

  // If not found in direct mapping, extract from URL
  if (!categoryTitle) {
    const pathParts = pathname.split('/');
    const categoryIndex = pathParts.indexOf('category');
    
    if (categoryIndex !== -1 && pathParts.length > categoryIndex + 1) {
      category = pathParts[categoryIndex + 1];
      // Fallback to capitalized version if not in mapping
      categoryTitle = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
    }
  } else {
    // If found in mapping, extract category from pathname for ItemsListing
    const pathParts = pathname.split('/');
    const categoryIndex = pathParts.indexOf('category');
    if (categoryIndex !== -1 && pathParts.length > categoryIndex + 1) {
      category = pathParts[categoryIndex + 1];
    }
  }

  console.log("Pathname:", pathname); // Debug
  console.log("Extracted category:", category); // Debug
  console.log("Category Title:", categoryTitle); // Debug

  if (!category || !categoryTitle) {
    return (
      <div className="page_content">
        <div className="container text-center py-5">
          <h1>Category Not Found</h1>
          <p>Please check the URL or go back to homepage.</p>
        </div>
      </div>
    );
  }

 

  const categorySEO = SEO_CONFIG.getCategorySEO(categoryTitle, category);

  return (
    <>
      <Cursor />
    <SEO {...categorySEO} />

      <div className="page_content">
        <PageTitle title={categoryTitle} />
        <div className="listing_section">
          <ListingSidebar />
          {category === "hot" ? (
            <ItemsListing />
          ) : (
            <ItemsListing category={category.toLowerCase()} />
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryTemplate;