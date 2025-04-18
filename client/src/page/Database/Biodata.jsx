import React from "react";

const Biodata = () => {
  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <select className="form-select" aria-label="Pilih Tahun Pelajaran">
              <option value="" hidden>
                Pilih Tahun Pelajaran
              </option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nama Lengkap"
            />
          </div>

          <div className="mb-3">
            <input type="text" className="form-control" placeholder="NISN" />
          </div>

          <div className="mb-3">
            <input type="text" className="form-control" placeholder="NIS" />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tempat Lahir"
            />
          </div>

          <div className="mb-3">
            <input type="date" className="form-control" />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Urutan Kelahiran"
            />
          </div>

          <div className="mb-3">
            <input type="text" className="form-control" placeholder="TB" />
          </div>

          <div className="mb-3">
            <input type="text" className="form-control" placeholder="BB" />
          </div>

          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Lingkar Kepala"
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <select className="form-select" aria-label="Pilih Provinsi">
              <option value="" hidden>
                Pilih Provinsi
              </option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jawa Tengah">Jawa Tengah</option>
              <option value="Jawa Timur">Jawa Timur</option>
            </select>
          </div>

          <div className="mb-3">
            <select className="form-select" aria-label="Pilih Kota / Kabupaten">
              <option value="" hidden>
                Pilih Kota / Kabupaten
              </option>
              <option value="Bandung">Bandung</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Surabaya">Surabaya</option>
            </select>
          </div>

          <div className="mb-3">
            <select className="form-select" aria-label="Pilih Kecamatan">
              <option value="" hidden>
                Pilih Kecamatan
              </option>
              <option value="Bandung Barat">Bandung Barat</option>
              <option value="Bandung Timur">Bandung Timur</option>
              <option value="Bandung Utara">Bandung Utara</option>
            </select>
          </div>

          <div className="mb-3">
            <select className="form-select" aria-label="Pilih Desa">
              <option value="" hidden>
                Pilih Desa
              </option>
              <option value="Bandung Barat">Bandung Barat</option>
              <option value="Bandung Timur">Bandung Timur</option>
              <option value="Bandung Utara">Bandung Utara</option>
            </select>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Kode Pos"
            />
          </div>

          <div className="mb-3">
            <textarea
              className="form-control"
              rows="4"
              placeholder="Alamat"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Biodata;
