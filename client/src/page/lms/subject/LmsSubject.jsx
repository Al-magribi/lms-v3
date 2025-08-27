import { useParams } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import Chapters from "../chapter/Chapters";
import Form from "./Form";
import { useState } from "react";
import "./LmsSubject.css";

const LmsSubject = () => {
  const params = useParams();
  const { name, id } = params;

  const formatted = name.replace(/-/g, " ");

  const [detail, setDetail] = useState({});

  return (
    <Layout title={formatted} levels={["admin", "teacher"]}>
      <div className="lms-subject-container">
        <div className="row g-4">
          <div className=" col-12">
            <div className="sticky-top" style={{ top: "20px" }}>
              <Form detail={detail} setDetail={setDetail} />
            </div>
          </div>
          <div className=" col-12">
            <div className="chapters-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-primary mb-0">
                  <i className="bi bi-collection me-2"></i>
                  Daftar Bab
                </h4>
              </div>
              <Chapters setDetail={setDetail} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LmsSubject;
