import React from "react";

const AboutUs = () => {
  return (
    <section id="tentang-kami" className="py-5 my-5 bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-12">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="mb-4">Nuraida Islamic Boarding School</h2>

                <p className="card-text">
                  Sejak berdiri pada tahun 2014, Nuraida Islamic Boarding School
                  (NIBS) telah menjadi rumah bagi pendidikan Islam yang
                  berpegang teguh pada Al-Qur'an dan As-Sunnah yang shahih,
                  sesuai pemahaman Salafus Shalih. Berlokasi di Desa Pakauman,
                  Cimahpar, Bogor Utara – Kota Bogor, kami mengintegrasikan
                  nilai-nilai Islam ke dalam setiap aspek kegiatan belajar di
                  sekolah maupun di asrama, mencetak generasi muslim yang
                  berilmu dan berakhlak mulia.
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-12">
            <div className="ratio ratio-16x9">
              <iframe
                src="https://www.youtube.com/embed/uZ8YOH85viU"
                title="Video Profil NIBS"
                allowFullScreen
                className="rounded"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
