import React from "react";
import "./Homepage.css";
import Header from "../components/Header";

const Homepage = () => {
  return (
    <>
      <Header />
      <div className="homepage">
        {/* Hero Section */}
        <div className="hero-section position-relative">
          <div className="container-fluid p-0">
            <div className="row g-0">
              <div className="col-12">
                <div className="hero-content text-center position-absolute top-50 start-50 translate-middle">
                  <h1 className="display-4 fw-bold">
                    Nuraida Islamic Boarding School
                  </h1>
                  <p className="lead">
                    Membina Generasi Rabbani Berprestasi Menuju Ridha Ilahi
                  </p>
                  <a href="#daftar" className="btn btn-primary btn-lg mt-3">
                    Daftar Sekarang
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="about-section py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h2 className="section-title">Tentang Kami</h2>
                <p className="lead text-muted">
                  Nuraida Islamic Boarding School adalah lembaga pendidikan yang
                  mengintegrasikan kurikulum nasional dengan pendidikan Islam
                  berbasis Al-Quran dan As-Sunnah.
                </p>
                <div className="mt-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-check-circle-fill text-primary me-2"></i>
                    <span>Kurikulum Terpadu Nasional & Diniyah</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-check-circle-fill text-primary me-2"></i>
                    <span>Program Tahfidz Al-Quran</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-primary me-2"></i>
                    <span>Pembinaan Akhlak & Kepribadian</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="row g-4">
                  <div className="col-6">
                    <div className="feature-card text-center p-4 rounded">
                      <i className="bi bi-mortarboard fs-1 text-primary mb-3"></i>
                      <h5>Akademik Unggul</h5>
                      <p className="small">Persiapan masuk PTN favorit</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="feature-card text-center p-4 rounded">
                      <i className="bi bi-heart fs-1 text-primary mb-3"></i>
                      <h5>Pembinaan Islami</h5>
                      <p className="small">Pembentukan karakter islami</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="news-section py-5 bg-light">
          <div className="container">
            <h2 className="section-title text-center mb-5">Berita Terkini</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <span className="badge bg-primary mb-2">PPDB</span>
                    <h5 className="card-title">
                      Penerimaan Siswa Baru 2025/2026
                    </h5>
                    <p className="card-text">
                      Program unggulan untuk putri dengan kurikulum terpadu
                      nasional dan diniyah.
                    </p>
                    <a href="#" className="btn btn-outline-primary">
                      Selengkapnya
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <span className="badge bg-primary mb-2">Prestasi</span>
                    <h5 className="card-title">Lolos SNBP 2025</h5>
                    <p className="card-text">
                      Kebanggaan kami, 85% siswa berhasil lolos ke PTN favorit.
                    </p>
                    <a href="#" className="btn btn-outline-primary">
                      Selengkapnya
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <span className="badge bg-primary mb-2">Kegiatan</span>
                    <h5 className="card-title">Program Tahfidz Al-Quran</h5>
                    <p className="card-text">
                      Program unggulan hafalan Al-Quran dengan metode yang
                      efektif.
                    </p>
                    <a href="#" className="btn btn-outline-primary">
                      Selengkapnya
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section className="facilities-section py-5">
          <div className="container">
            <h2 className="section-title text-center mb-5">
              Fasilitas Unggulan
            </h2>
            <div className="row g-4">
              <div className="col-6 col-md-3">
                <div className="facility-item text-center">
                  <i className="bi bi-laptop fs-1 text-primary mb-3"></i>
                  <h5>Lab Komputer</h5>
                  <p className="small">Fasilitas modern untuk pembelajaran</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="facility-item text-center">
                  <i className="bi bi-book fs-1 text-primary mb-3"></i>
                  <h5>Perpustakaan</h5>
                  <p className="small">Koleksi lengkap untuk referensi</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="facility-item text-center">
                  <i className="bi bi-heart-pulse fs-1 text-primary mb-3"></i>
                  <h5>Klinik Kesehatan</h5>
                  <p className="small">Layanan kesehatan 24 jam</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="facility-item text-center">
                  <i className="bi bi-house fs-1 text-primary mb-3"></i>
                  <h5>Asrama Modern</h5>
                  <p className="small">Tempat tinggal nyaman dan aman</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h2 className="section-title mb-4">Hubungi Kami</h2>
                <div className="contact-info">
                  <p>
                    <i className="bi bi-telephone me-2"></i> SMP: 0896-7489-9341
                  </p>
                  <p>
                    <i className="bi bi-telephone me-2"></i> SMA: 0857-1418-1610
                  </p>
                  <p>
                    <i className="bi bi-envelope me-2"></i> info@nibs.sch.id
                  </p>
                </div>
                <div className="social-media mt-4">
                  <h5 className="mb-3">Media Sosial</h5>
                  <a href="#" className="text-primary me-3">
                    <i className="bi bi-instagram fs-4"></i>
                  </a>
                  <a href="#" className="text-primary me-3">
                    <i className="bi bi-facebook fs-4"></i>
                  </a>
                  <a href="#" className="text-primary">
                    <i className="bi bi-youtube fs-4"></i>
                  </a>
                </div>
              </div>
              <div className="col-md-6">
                <h2 className="section-title mb-4">Lokasi Kami</h2>
                <p>
                  Jl. Guru Mukhtar II No.1 RT/RW.03/15 Cimahpar, Bogor Utara
                  Kota Bogor, Jawa Barat 16155
                </p>
                <div className="mt-4">
                  <a href="#" className="btn btn-primary">
                    Lihat di Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Homepage;
