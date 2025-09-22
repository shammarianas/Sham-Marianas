import React from "react";
import { Link } from "react-router-dom";
import AddToBookmark from "./AddToBookmark";

const ListedItemCard = ({ id, data, rating }) => {
  return (
    <div className="">
      <div className="item_card" key={id}>
        <div
          className="card_image"
          style={{
            aspectRatio: data.type === "textures" ? "1 / 1" : undefined,
          }}
        >
          {data.discount > 0 ? (
            <div className="discount_card">
              <span>
                <strong>-{data.discount}%</strong>
              </span>
            </div>
          ) : null}
          <Link className="card_image" to={`/View/${id}`}>
            <img src={data.thumbnail} alt="placeholder" />
          </Link>
        </div>

        <div className="card_content">
          <span className="title">
            {data.title} <br />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span className="publisher">by Servant {data.publisher}</span>
              <span
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "40px",
                  justifyContent: "space-between",
                }}
              >
                <Link to={`/View/${id}`}>
                  <i className="fa-solid fa-download"></i>
                </Link>
                {/* <i className="fa-solid fa-bookmark"></i> */}
                <AddToBookmark assetId={id} />
              </span>
            </div>
          </span>

          <div className="details">
            <span className="price">
              <strong>
                {(() => {
                  const price = Number(data.price) || 0;
                  const discount = Number(data.discount ?? 0) || 0;
                  const finalPrice = Math.max(0, price - (price * discount) / 100);
                  return finalPrice === 0 ? "Free" : `$${finalPrice.toFixed(2)}`;
                })()}
              </strong>
            </span>
            {/* <span className="rating">
              <div className="icons">
                {Array.from({ length: rating }, (_, i) => (
                  <i key={`filled_${i}`} className="icon fas fa-star"></i> // Added unique key here
                ))}
                {Array.from({ length: 5 - rating }, (_, i) => (
                  <i key={`unfilled_${i}`} className="icon far fa-star"></i> // And here
                ))}
              </div>
              <span className="rating_count">125</span>
            </span> */}
          </div>
          {/* <button className="add_to_cart_btn">
          <i className="icon fas fa-shopping-cart"></i> Add to cart
        </button> */}
        </div>
      </div>
    </div>
  );
};

export default ListedItemCard;
