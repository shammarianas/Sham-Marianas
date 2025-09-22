import useAddToFavorites from "../../hooks/useAddToFavorites";

const AddToBookmark = ({ assetId }) => {
  
  const { isFavorited, toggleFavorite, isSaving, error } =
    useAddToFavorites(assetId);

  return (
    <div>
      {/* <button
        className={`add_to_wishlist_btn ${isFavorited ? "favorited" : ""}`}
        onClick={toggleFavorite}
        disabled={isSaving}
      > */}
        <i
        onClick={ (e) => {
            e.stopPropagation();
            toggleFavorite()
        }
        }
        disabled={isSaving}
          className={`icon ${isFavorited ? "fa-solid" : "fa-regular" } fa-bookmark color-white ${isSaving ? "fa-spin" : ""} 
            add_to_wishlist_btn 
            `}
        ></i>
      {/* </button> */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddToBookmark;