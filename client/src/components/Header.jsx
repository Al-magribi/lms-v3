import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand" to="/homepage">
            <div className="logo">
              <h1>NIBS</h1>
              <span>Nuraida Islamic Boarding School</span>
            </div>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className="bi bi-list"></i>
          </button>

          {/* Navigation Menu */}
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          >
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Beranda
                </Link>
              </li>
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Tentang Kami
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/tentang/sejarah">
                      Sejarah
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/tentang/visi-misi">
                      Visi & Misi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/tentang/kurikulum">
                      Kurikulum
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Kegiatan
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/kegiatan/akademik">
                      Akademik
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/kegiatan/diniyah">
                      Diniyah
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/kegiatan/ekstrakurikuler"
                    >
                      Ekstrakurikuler
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/berita">
                  Berita
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link btn btn-primary text-white ms-2"
                  to="/daftar"
                >
                  Daftar Sekarang
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
