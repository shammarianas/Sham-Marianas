import 'react';

function Works() {
  return (
    <div className="img-column">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="img md-mb30">
              <img  loading="lazy"  src="/assets/imgs/works/3/2.jpg" alt="" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="img">
              <img  loading="lazy"  src="/assets/imgs/works/3/3.jpg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Works;
