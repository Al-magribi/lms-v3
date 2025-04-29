import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5">
      <div className="container">
        <div className="row">
          {/* Contact Information */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Kontak Kami</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2"></i>
                SMP: 0896-7489-9341
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2"></i>
                SMA: 0857-1418-1610
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2"></i>
                Humas: 0813-1114-1632
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope-fill me-2"></i>
                info@nibs.sch.id
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Menu Utama</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-light text-decoration-none">
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a href="/sambutan" className="text-light text-decoration-none">
                  Sambutan - Sambutan
                </a>
              </li>
              <li className="mb-2">
                <a href="/artikel" className="text-light text-decoration-none">
                  Artikel & Berita
                </a>
              </li>
              <li className="mb-2">
                <a href="/karir" className="text-light text-decoration-none">
                  Karir
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/pendaftaran"
                  className="text-light text-decoration-none"
                >
                  Pendaftaran Siswa Baru
                </a>
              </li>
            </ul>
          </div>

          {/* Location */}
          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Lokasi</h5>
            <p className="mb-2">
              Jl. Guru Mukhtar II No.1 RT/RW.03/15 Cimahpar, Bogor Utara Kota
              Bogor, Jawa Barat 16155
            </p>
            <h5 className="mb-3 mt-4">Media Sosial</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-youtube fs-5"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="row mt-4">
          <div className="col-12">
            <hr className="border-light" />
            <p className="text-center mb-0">
              ©2024 Nuraida Islamic Boarding School. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
