import { useLocation } from "react-router-dom";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet-async";
import Cursor from "../../common/cusor";

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

  // Function to get meta description based on category
  const getMetaDescription = () => {
    const descriptions = {
      "Videos": "Browse and download premium stock videos for your projects",
      "3D Models": "Explore high-quality 3D models for animation, gaming, and design",
      "Video Templates": "Professional video templates for After Effects, Premiere Pro",
      "Images": "Download stunning stock photos and images",
      "Graphic Templates": "Creative graphic templates for Photoshop, Illustrator",
      "Mockups": "Realistic product mockups for branding and presentation",
      "Fonts": "Beautiful typography and font collections",
      "Icons": "Icon sets for UI/UX design and applications",
      "Textures": "High-resolution textures for 3D modeling and design",
      "Scripts": "Useful scripts and plugins for creative software",
      "HDRIs": "HDRI environments for realistic 3D rendering",
      "More": "Additional creative assets and resources",
      "Hot": "Trending and popular assets on Shammarianas"
    };
    
    return descriptions[categoryTitle] || `Browse through a wide range of ${categoryTitle} on Shammarianas.`;
  };

  const metaDescription = getMetaDescription();

  return (
    <>
      <Cursor />
      <Helmet>
        <title>{categoryTitle} | Shammarianas</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${categoryTitle} | Shammarianas`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={`${categoryTitle} | Shammarianas`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

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