import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Subjects = ({ subjects, user }) => {
  const navigate = useNavigate();

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/guru-penilaian?subject=${formattedName}&id=${id}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="row g-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {subjects.map((subject) => (
        <motion.div
          key={subject.id}
          className="col-xl-3 col-lg-4 col-md-6"
          variants={item}
        >
          <div
            className="card h-100 shadow-sm border-0 hover-card rounded-3 overflow-hidden"
            onClick={() => goToLink(subject.name, subject.id)}
            style={{ cursor: "pointer", transition: "all 0.3s ease" }}
          >
            <div className="position-relative">
              <img
                src={
                  subject.cover
                    ? `${window.location.origin}${subject.cover}`
                    : `/logo.png`
                }
                alt={subject.name}
                className="card-img-top"
                style={{
                  height: "250px",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="card-body p-4">
              <h5 className="card-title mb-3 fw-bold text-primary">
                {subject.name}
              </h5>
              <div className="d-flex align-items-center text-muted mb-3">
                <i className="bi bi-mortarboard-fill me-2"></i>
                <span className="small">{user?.name}</span>
              </div>
              <button
                className="btn btn-primary w-100 rounded-pill py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  goToLink(subject.name, subject.id);
                }}
              >
                <i className="bi bi-arrow-right-circle-fill me-2"></i>
                Kelola Penilaian
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Subjects;
