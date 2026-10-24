import { useEffect, useState } from "react";
import ListedItemCard from "./UI/ListedItemCard";
import { db } from "../../firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useFilters } from "../Context/FilterContext";
import "react-router-dom";
import useSearchStore from "../store/searchStore";
import { useUser } from "../Context/UserProvider";
import { rankAssetsByRelevance } from "../utils/assetSearch";
// Import the Zustand store

const ItemsListing = (props) => {
  const { userProfile } = useUser(); // Get user profile
  const [items, setItems] = useState([]);
  const filters = useFilters().filters;
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearchStore(); // Get the search term from Zustand store

  let asset_type = props.category === "3dmodels" ? "models" : (props.category || "models");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let itemsQuery;

        const baseQuery = [
          where("type", "==", asset_type),
          where("status", "==", "approved"),
        ];

        if (props.userId) {
          baseQuery.push(where("ownerId", "==", props.userId)); // optional if you want user-specific items
        }

        if (props?.limit) {
          itemsQuery = query(
            collection(db, "Assets"),
            ...baseQuery,
            limit(props.limit)
          );
        } else {
          itemsQuery = query(collection(db, "Assets"), ...baseQuery);
        }

        const snapshot = await getDocs(itemsQuery);
        const itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(itemsData);
        setLoading(false);
        if (itemsData.length === 0) setLoading("no_item");
      } catch (err) {
        console.error("Error fetching items:", err);
        setLoading(false);
      }
    };

    fetchItems();
  }, [props.userId, props.limit, asset_type]);

  // Filter items based on search term and filters
  const filteredItems = items.filter((item) => {
    const price = Number(item.price) || 0;
    const discount = Number(item.discount ?? 0) || 0;
    const afterDiscountPrice = Math.max(0, price - (price * discount) / 100);

    const valueMatches = (itemValue, selectedValues) => {
      if (!selectedValues?.length) return true;
      const values = Array.isArray(itemValue) ? itemValue : [itemValue];
      return selectedValues.some((selectedValue) =>
        values.some(
          (value) =>
            String(value ?? "").trim().toLowerCase() ===
            String(selectedValue).trim().toLowerCase()
        )
      );
    };

    // Apply every filter field exposed by the sidebar. Previously only
    // categories/interests were checked, so image filters such as orientation,
    // AI-generated and license type had no effect.
    const fieldFilters = [
      ["categories", "category"],
      ["interests", "interest"],
      ["orientation", "orientation"],
      ["licenseType", "licenseType"],
      ["resolution", "resolution"],
      ["frameRate", "frameRate"],
      ["properties", "properties"],
      ["applicationsSupported", "applicationsSupported"],
      ["surfaceMaterial", "surfaceMaterial"],
      ["style", "style"],
      ["environmentType", "environmentType"],
      ["lightingCondition", "lightingCondition"],
      ["scriptType", "scriptType"],
      ["programmingLanguage", "programmingLanguage"],
      ["framework", "framework"],
      ["integrationReady", "integrationReady"],
      ["colorSpace", "colorSpace"],
      ["objectType", "objectType"],
      ["fileFormat", "fileFormat"],
    ];

    const standardFiltersPassed = fieldFilters.every(([filterKey, itemKey]) =>
      valueMatches(item[itemKey], filters?.[filterKey])
    );

    const aiFilters = filters?.aiGenerated || [];
    const isAiGenerated = [item.aiGenerated, item.isAiGenerated].some((value) => {
      if (typeof value === "boolean") return value;
      const normalized = String(value ?? "").trim().toLowerCase();
      return [
        "true",
        "yes",
        "1",
        "ai",
        "ai-generated",
        "only ai-generated",
      ].includes(normalized);
    });
    const aiFilterPassed =
      !aiFilters.length ||
      aiFilters.every((filter) =>
        filter === "Only AI-Generated" ? isAiGenerated : !isAiGenerated
      );

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

    return standardFiltersPassed && aiFilterPassed && priceFilterPassed && discountFilterPassed;
  });
  const searchFilteredItems = searchTerm
    ? rankAssetsByRelevance(filteredItems, searchTerm)
    : filteredItems;

  return (
    <div className="item_listing">
      {loading === true ? <div className="loading">Loading...</div> : null}
      {/* {loading === "no_item" && (
        <div className="no_items">
          <span>It's so empty here. How about you fill it up💦</span>
          <Link to="/upload">
            <button>Upload</button>
          </Link>
        </div>
      )} */}

      {searchFilteredItems.map((item) => (
        <ListedItemCard
          key={item.id}
          id={item.id}
          data={item}
          userProfile={userProfile}
        />
      ))}
    </div>
  );
};

export default ItemsListing;
