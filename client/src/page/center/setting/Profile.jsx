import React from "react";

const Profile = () => {
  return (
    <form className="d-flex flex-column gap-3 p-2">
      <p className="m-0 h6">Profile</p>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Username
        </span>
        <input
          type="text"
          className="form-control"
          aria-label="Nama"
          aria-describedby="basic-addon1"
        />
      </div>

      <div className="input-group">
        <span
          style={{ width: 150 }}
          className="input-group-text"
          id="basic-addon1"
        >
          Email
        </span>
        <input
          type="email"
          className="form-control"
          aria-label="Email"
          aria-describedby="basic-addon1"
        />
      </div>

      <div className="text-end">
        <button className="btn btn-sm btn-success">Simpan</button>
      </div>
    </form>
  );
};

export default Profile;
