import React from "react";

const Parent = () => {
  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          {/* Father's Information */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="NIK Ayah"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nama Ayah"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tempat Lahir Ayah"
            />
          </div>

          <div className="mb-3">
            <input type="date" className="form-control" />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Pekerjaan Ayah"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tlp Ayah"
            />
          </div>
        </div>

        <div className="col-md-6">
          {/* Mother's Information */}
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="NIK Ibu" />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nama Ibu"
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tempat Lahir Ibu"
            />
          </div>

          <div className="mb-3">
            <input type="date" className="form-control" />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Pekerjaan Ibu"
            />
          </div>

          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Tlp Ibu" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parent;
