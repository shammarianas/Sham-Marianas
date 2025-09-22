// CategoryTemplate.js
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

const CategoryTemplate = () => {
  const { Category } = useParams();


  return (
    <>
      <Helmet>
        <title>{Category.charAt(0).toUpperCase() + Category.slice(1)} | Shammarianas</title>
        <meta name="description" content={`Browse through a wide range of ${Category} on Shammarianas.`} />

        <meta property="og:title" content={`${Category.charAt(0).toUpperCase() + Category.slice(1)} | Shammarianas`} />
        <meta property="og:description" content={`Browse through a wide range of ${Category} on Shammarianas.`} />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content={`${Category.charAt(0).toUpperCase() + Category.slice(1)} | Shammarianas`} />
        <meta name="twitter:description" content={`Browse through a wide range of ${Category} on Shammarianas.`} />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="page_content">
        <PageTitle title={Category.charAt(0).toUpperCase() + Category.slice(1)} />
        <div className="listing_section">
          <ListingSidebar />
          {Category === "hot" ? <ItemsListing /> : <ItemsListing category={Category.toLowerCase()} />}
          {/* <ItemsListing category={ Category ? Category.toLowerCase() : null} /> */}
        </div>
      </div>
    </>
  );
};

export default CategoryTemplate;
