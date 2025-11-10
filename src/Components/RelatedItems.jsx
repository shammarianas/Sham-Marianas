import { useEffect, useState } from "react";
import ListedItemCard from "./UI/ListedItemCard";
import { db } from "../../firebase";
import PageTitle from "./UI/PageTitle";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

const RelatedItems = (props) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!props.tags || props.tags.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Take first 3 tags for related items search
        const searchTags = props.tags.slice(0, 3);
        
        // Create a query to find items with matching tags
        const itemsQuery = query(
          collection(db, "Assets"),
          where("tags", "array-contains-any", searchTags),
          limit(props.limit || 8)
        );

        const snapshot = await getDocs(itemsQuery);
        let itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter out the current item if provided
        if (props.currentItemId) {
          itemsData = itemsData.filter(item => item.id !== props.currentItemId);
        }

        setRelatedItems(itemsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching related items:", error);
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [props.tags, props.currentItemId, props.assetType, props.limit]);

  if (loading) {
    return (
      <div className="page_content">
        <PageTitle title="Related Assets" />
        <div className="loading">Loading related items...</div>
      </div>
    );
  }

  // Agar koi related items nahi hai
  if (relatedItems.length === 0) {
    return (
      <div className="page_content">
        <PageTitle title="Related Assets" />
        <div className="no_items">
          <span>No related assets found based on tags</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page_content">
      <PageTitle title="Related Assets" />
      <div className="item_listing p-3">
        {relatedItems.map((item) => (
          <ListedItemCard key={item.id} id={item.id} data={item} />
        ))}
      </div>
    </div>
  );
};

export default RelatedItems;