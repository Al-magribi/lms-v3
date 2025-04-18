import React, { useState } from "react";

const Family = () => {
  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-4">
          {/* Input Form */}
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nama Keluarga"
                />
              </div>

              <div className="mb-3">
                <select className="form-select">
                  <option value="" hidden>
                    Pilih Jenis Kelamin
                  </option>
                  <option value="">Laki Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="mb-3">
                <input type="date" className="form-control" />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-sm btn-warning">Batal</button>
                <button className="btn btn-sm btn-success">Simpan</button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {/* Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Jenis Kelamin</th>
                      <th>Tanggal Lahir</th>
                      <th>Usia</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>{/* Table data will be populated here */}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Family;
