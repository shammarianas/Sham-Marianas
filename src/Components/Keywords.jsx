import "react";

const Keywords = ({ keywords = [] }) => {
  // If keywords is undefined/null → treat as empty array
  return (
    <div className="keywords">
      {keywords.map((keyword, index) => (
        <span key={index} className="keyword">
          {keyword}
        </span>
      ))}
    </div>
  );
};

export default Keywords;