// import { useEffect, useState } from "react";
// import ListedItemCard from "./UI/ListedItemCard";
// import { db } from "../../firebase";
// import { collection, getDocs, query, where, limit } from "firebase/firestore";
// import { useFilters } from "../Context/FilterContext";
// import { Link } from "react-router-dom";

// const ItemsListing = (props) => {
//   const [items, setItems] = useState([]);
//   const filters = useFilters().filters;
//   const [loading, setLoading] = useState(true);
//   console.log(items);

//   let asset_type = props.category ? props.category : "models";

//   useEffect(() => {
//     const fetchItems = async () => {
//       let itemsQuery;

//       if (props.userId) {
//         console.log("props.userId", props.userId);
//         // Create a query to fetch items for a specific user
//         if (props?.limit) {
//           itemsQuery = query(
//             collection(db, "Assets"),
//             where("type", "==", asset_type),
//             limit(props?.limit)
//           );
//         } else {
//           itemsQuery = query(
//             collection(db, "Assets"),
//             where("type", "==", asset_type)
//           );
//         }
//       } else {
//         // Create a query to fetch all items
//         if (props?.limit) {
//           itemsQuery = query(
//             collection(db, "Assets"),
//             where("type", "==", asset_type),
//             limit(props?.limit)
//           );
//         } else {
//           itemsQuery = query(
//             collection(db, "Assets"),
//             where("type", "==", asset_type)
//           );
//         }
        
//       }

//       const snapshot = await getDocs(itemsQuery);
//       const itemsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setItems(itemsData);
//       itemsData && setLoading(false);
//       itemsData.length === 0 && setLoading("no_item");
//     };

//     fetchItems();
//   }, []);

//   const filteredItems = items.filter((item) => {
//     const afterDiscountPrice = item.price - (item.price * item.discount) / 100;
//     let categoryFilterPassed = true;
//     let priceFilterPassed = true;
//     let discountFilterPassed = true;

//     if (filters && filters.categories && filters.categories.length !== 0) {
//       categoryFilterPassed = filters.categories.includes(item.category);
//     }

//     if (filters && filters.price) {
//       priceFilterPassed = afterDiscountPrice <= filters.price;
//     }
//     if (filters && filters.discounts && filters.discounts.length > 0) {
//       discountFilterPassed = item.discount >= filters.discounts[0];
//     } else {
//       discountFilterPassed = true; // No discount filter applied, list all products
//     }

//     return categoryFilterPassed && priceFilterPassed && discountFilterPassed;
//   });
//   return (
//     <div className="item_listing">
//       {loading == true ? <div className="loading">Loading...</div> : null}
//       {loading === "no_item" && (
//         <div className="no_items">
//           <span>It's so empty here. How about you fill it up💦</span>
//           <Link to="/upload">
//             <button>Upload</button>
//           </Link>
//         </div>
//       )}

//       {filteredItems.map((item) => (
//         <ListedItemCard key={item.id} id={item.id} data={item} />
//         // <ListedItemCard key={item.id} id={item.id} data={item} rating="5" />
//       ))}
//     </div>
//   );
// };

// export default ItemsListing;

import { useEffect, useState } from "react";
import ListedItemCard from "./UI/ListedItemCard";
import { db } from "../../firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useFilters } from "../Context/FilterContext";
import { Link } from "react-router-dom";
import useSearchStore from "../store/searchStore"; // Import the Zustand store

const ItemsListing = (props) => {
  const [items, setItems] = useState([]);
  const filters = useFilters().filters;
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearchStore(); // Get the search term from Zustand store

  let asset_type = props.category ? props.category : "models";

  useEffect(() => {
    const fetchItems = async () => {
      let itemsQuery;

      if (props.userId) {
        // Create a query to fetch items for a specific user
        if (props?.limit) {
          itemsQuery = query(
            collection(db, "Assets"),
            where("type", "==", asset_type),
            limit(props?.limit)
          );
        } else {
          itemsQuery = query(
            collection(db, "Assets"),
            where("type", "==", asset_type)
          );
        }
      } else {
        // Create a query to fetch all items
        if (props?.limit) {
          itemsQuery = query(
            collection(db, "Assets"),
            where("type", "==", asset_type),
            limit(props?.limit)
          );
        } else {
          itemsQuery = query(
            collection(db, "Assets"),
            where("type", "==", asset_type)
          );
        }
      }

      const snapshot = await getDocs(itemsQuery);
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
      itemsData && setLoading(false);
      itemsData.length === 0 && setLoading("no_item");
    };

    fetchItems();
  }, [props.userId, props.limit, asset_type]);

  // Filter items based on search term and filters
  const filteredItems = items.filter((item) => {
    const price = Number(item.price) || 0;
    const discount = Number(item.discount ?? 0) || 0;
    const afterDiscountPrice = Math.max(0, price - (price * discount) / 100);

    // Apply search term filter
    const searchTermFilterPassed = searchTerm
      ? item.title.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Apply category filter
    let categoryFilterPassed = true;
    if (filters && filters.categories && filters.categories.length !== 0) {
      categoryFilterPassed = filters.categories.includes(item.category);
    }

    // Apply price filter
    let priceFilterPassed = true;
    if (filters && filters.price) {
      priceFilterPassed = afterDiscountPrice <= filters.price;
    }

    // Apply discount filter
    let discountFilterPassed = true;
    if (filters && filters.discounts && filters.discounts.length > 0) {
      discountFilterPassed = item.discount >= filters.discounts[0];
    }

    return (
      searchTermFilterPassed &&
      categoryFilterPassed &&
      priceFilterPassed &&
      discountFilterPassed
    );
  });

  return (
    <div className="item_listing">
      {loading === true ? <div className="loading">Loading...</div> : null}
      {loading === "no_item" && (
        <div className="no_items">
          <span>It's so empty here. How about you fill it up💦</span>
          <Link to="/upload">
            <button>Upload</button>
          </Link>
        </div>
      )}

      {filteredItems.map((item) => (
        <ListedItemCard key={item.id} id={item.id} data={item} />
      ))}
    </div>
  );
};

export default ItemsListing;
