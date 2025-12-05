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
      if (!props.category) {
        setLoading(false);
        return;
      }

      try {
        const itemsQuery = query(
          collection(db, "Assets"),
          where("category", "==", props.category), // ← Only category filter
          limit(props.limit || 8)
        );

        const snapshot = await getDocs(itemsQuery);

        let itemsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // remove currently opened item
        if (props.currentItemId) {
          itemsData = itemsData.filter(
            (item) => item.id !== props.currentItemId
          );
        }

        setRelatedItems(itemsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching related items:", error);
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [props.category, props.currentItemId, props.limit]);

  if (loading) {
    return (
      <div className="page_content">
        <PageTitle title="Related Assets" />
        <div className="loading">Loading related items...</div>
      </div>
    );
  }

  if (relatedItems.length === 0) {
    return (
      <div className="page_content">
        <PageTitle title="Related Assets" />
        <div className="no_items">
          <span>No related assets found</span>
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
