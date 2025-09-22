import useAddToFavorites from "../../hooks/useAddToFavorites";

const FavoriteButton = ({ assetId }) => {
  
  const { isFavorited, toggleFavorite, isSaving, error } =
    useAddToFavorites(assetId);

  return (
    <div>
      <button
        className={`add_to_wishlist_btn ${isFavorited ? "favorited" : ""}`}
        onClick={ (e) => {
          e.stopPropagation();
          toggleFavorite()
      }
      }
        disabled={isSaving}
      >
        <i
          className={`icon fas fa-heart ${isSaving ? "fa-spin" : ""} ${
            isFavorited ? "filled" : ""
          }`}
        ></i>
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FavoriteButton;