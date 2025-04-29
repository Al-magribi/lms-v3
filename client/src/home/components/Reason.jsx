import React from "react";
import { motion } from "framer-motion";
import {
  FaQuran,
  FaLaptop,
  FaBook,
  FaUserGraduate,
  FaMosque,
  FaChalkboardTeacher,
  FaTrophy,
} from "react-icons/fa";

const reasons = [
  {
    id: 1,
    title: "Pendidikan Berbasis Iman dan Akhlak",
    description:
      "Di NIBS, pendidikan tidak hanya fokus pada akademik, tapi juga membentuk karakter Islami yang kuat. Setiap siswa dibimbing untuk menjadikan Al-Qur'an dan Sunnah sebagai pedoman hidup.",
    icon: <FaQuran className="fs-2" />,
  },
  {
    id: 2,
    title: "Integrasi Teknologi dalam Pembelajaran",
    description:
      "Melalui platform CBT (Computer-Based Test) dan LMS (Learning Management System) yang modern, siswa belajar dengan metode digital yang efektif dan interaktif, mempersiapkan mereka untuk era teknologi.",
    icon: <FaLaptop className="fs-2" />,
  },
  {
    id: 3,
    title: "Fokus pada Tahfiz Al-Qur'an",
    description:
      "Program Tahfiz di NIBS dirancang untuk membantu siswa menghafal Al-Qur'an dengan metode yang menyenangkan dan terstruktur, memperkuat pondasi spiritual sejak dini.",
    icon: <FaBook className="fs-2" />,
  },
  {
    id: 4,
    title: "Pembinaan Karakter dan Kepemimpinan",
    description:
      "NIBS tidak hanya mendidik siswa untuk menjadi pintar, tapi juga membangun kepribadian yang mandiri, disiplin, bertanggung jawab, dan siap memimpin di masa depan.",
    icon: <FaUserGraduate className="fs-2" />,
  },
  {
    id: 5,
    title: "Lingkungan Belajar Islami dan Inspiratif",
    description:
      "Dengan suasana yang nyaman, aman, dan Islami, siswa berkembang di lingkungan yang mendorong kecintaan terhadap ilmu dan kebaikan.",
    icon: <FaMosque className="fs-2" />,
  },
  {
    id: 6,
    title: "Guru Profesional dan Berpengalaman",
    description:
      "Dibimbing oleh tenaga pengajar yang kompeten di bidangnya serta berkomitmen tinggi terhadap pendidikan berbasis nilai.",
    icon: <FaChalkboardTeacher className="fs-2" />,
  },
  {
    id: 7,
    title: "Komitmen terhadap Prestasi Akademik dan Non-Akademik",
    description:
      "NIBS mendorong siswa untuk berprestasi, baik di bidang akademik, keagamaan, maupun ekstrakurikuler, dengan berbagai kegiatan dan lomba.",
    icon: <FaTrophy className="fs-2" />,
  },
];

const Reason = () => {
  return (
    <section className="py-5 bg-light">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5"
        >
          <h2 className="display-5 fw-bold mb-3">Mengapa Memilih NIBS?</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
            Temukan keunggulan pendidikan di NIBS yang membentuk generasi unggul
            berakhlak mulia
          </p>
        </motion.div>

        <div className="row g-4">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="col-md-6 col-lg-4"
            >
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3 text-primary">
                      {reason.icon}
                    </div>
                    <h3 className="card-title h5 mb-0 fw-bold">
                      {reason.title}
                    </h3>
                  </div>
                  <p className="card-text text-muted small mb-0">
                    {reason.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reason;

/* Add these custom CSS classes to your global CSS file:
.hover-shadow {
  transition: box-shadow 0.3s ease-in-out;
}

.hover-shadow:hover {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
*/
