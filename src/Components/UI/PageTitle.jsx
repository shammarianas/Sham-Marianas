import "react";

const PageTitle = (props) => {
  return (
    <div className="page_title">
      <div className="title">
        <h1>{props.title}</h1>
      </div>
    </div>
  );
};

export default PageTitle;
