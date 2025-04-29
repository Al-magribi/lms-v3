import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dayu Prajna",
      role: "Universitas Pancasila - Farmasi",
      text: "Assalamualaikum warahmatullahi wabarakatuh ibu. Dayu mau ngasii testimoni mondok di nuraida. Untuk sistem kbm jujur sangat baik. Para pengajar juga memberikan yang sangat maksimal. Ada bimibingan untuk ke Perguruan Tinggi. Sekian. Jazakillah khair❤️❤️",
    },
    {
      name: "Zara Diva",
      role: "Alumni Angkatan 1",
      text: "Bangga rasanya bisa sekolah di NIBS bahkan bisa lulus dan menyelesaikan pembelajaran disini. Perihal pendidikan, ustadzah dan ustadz disini bukan hanya memberikan ilmu namun juga merangkul santriwatinya agar tetap semangat dalam menggapai sesuatu. Dari sekolah ini juga saya belajar banyak nilai- nilai kehidupan yang sangat bermanfaat. Sampai hari inipun masih bisa saya rasakan manfaatnya 🥲 kangen,pengen balik lagi, soalnya sekolahnya makin bagus🙃",
    },
    {
      name: "Alma Sabrina",
      role: "LIPIA JAKARTA",
      text: "Nuraida adalah ma'had khusus akhwat yang benar-benar menjaga kami, santriwati nya, dan selalu berusaha memenuhi segala kebutuhan dan keinginan kami. Salah satunya adalah adanya program kelas khusus persiapan masuk kampus di kelas 12, seluruh guru baik ustadz maupun ustadzah memberikan segala bentuk usaha dan bimbingan terbaik mereka untuk kami selama masa itu. Alhamdulillah atas izin Allah banyak dari kami yang berhasil lolos seleksi masuk ke kampus-kampus impian kami.",
    },
    {
      name: "Afifah Al Muhdor",
      role: "Alumni",
      text: "Banyak pelajaran yg bisa di ambil dari sekolah di nuraida bukan hanya pelajaran akademik sekolah melainkam banyak pelajaran2 yg tidak bisa didapqtkan d sekolah pada umumnya seperti pelajaran kepemimpinan yg sangat dominan di asrama pelajaran adab sehari2 yg sering terlupakan oleh masyarakat jaman sekarang terlebih lagi kemampuan mengatur waktu mandiri sehari2 karena terbiasa hidup d asrama yg penuh kegiatan dan pastinya pengetahuan agama yg baik yg bersumber dari al quran dan asunnah karena itu saya sangat senang dan bangga menjadi alumni dari Nuraida islamic boarding school 😇",
    },
    {
      name: "Lulu Wal marjan",
      role: "UNJ Pendidikan Anak Usia Dini",
      text: "Nuraida Islamic Boarding School merupakan sekolah yang sangat memperhatikan kesehatan fisik, psikis, serta rohani muridnya. Sebagian besar guru di Nuraida sangat mudah berbaur & mengikat emosi dengan para siswa sehingga kami merasa nyaman untuk bercerita tentang banyak hal dengan para guru. Para guru juga sangat 'welcome' terhadap pertanyaan-pertanyaan kami walaupun di luar pelajaran bahkan hingga saya sudah lulus pun para guru tetap bersedia untuk menjawab pertanyaan-pertanyaan saya dengan senang hati. Dan yang membuat SMA Nuraida berbeda dengan SMA lainnya adalah adanya mata pelajaran 'Ibu Pendidik' yang sangat membantu kami untuk mengenali peran dasar Wanita dalam rumah tangga. 😬😬",
    },
  ];

  return (
    <section className="bg-white py-5">
      <div className="container position-relative">
        <h2 className="text-center mb-5">Testimoni</h2>
        <div
          id="testimonialCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card border shadow">
                      <div className="card-body p-4">
                        <div className="text-center mb-4">
                          <i className="fas fa-quote-left fa-2x text-primary"></i>
                        </div>
                        <p className="card-text text-center mb-4">
                          {testimonial.text}
                        </p>
                        <div className="text-center">
                          <h5 className="card-title mb-1">
                            {testimonial.name}
                          </h5>
                          <p className="text-muted mb-0">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#testimonialCarousel"
            data-bs-slide="prev"
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              top: "50%",
              transform: "translateY(-50%)",
              left: "-50px",
            }}
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#testimonialCarousel"
            data-bs-slide="next"
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              top: "50%",
              transform: "translateY(-50%)",
              right: "-50px",
            }}
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
