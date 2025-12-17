// CategoryTemplate.js
import { useLocation } from "react-router-dom";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet-async";
import Cursor from "../../common/cusor";
const CategoryTemplate = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Extract category from URL path
  const category = pathname.split('/').pop(); // e.g., "/fonts" -> "fonts"
  
  console.log("Pathname:", pathname); // Debug
  console.log("Extracted category:", category); // Debug

  if (!category) {
    return (
      <div className="page_content">
        <div className="container text-center py-5">
          <h1>Category Not Found</h1>
          <p>Please check the URL or go back to homepage.</p>
        </div>
      </div>
    );
  }

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const categoryTitle = capitalizeFirstLetter(category);

  return (
    <>
     <Cursor />
      <Helmet>
        <title>{categoryTitle} | Shammarianas</title>
        <meta 
          name="description" 
          content={`Browse through a wide range of ${categoryTitle} on Shammarianas.`} 
        />
        {/* ... rest of Helmet tags */}
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