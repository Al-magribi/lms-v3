import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useGetTypesQuery } from "../../../controller/api/tahfiz/ApiMetric";
import TableData from "./TableData";
import Achievement from "./Achievement";

const TahfizReport = () => {
  const [typeId, setTypeId] = useState("");
  const [achievement, setAchievement] = useState(false);

  const { data: types, isLoading } = useGetTypesQuery({
    page: "",
    limit: "",
    search: "",
  });

  return (
    <Layout title={"Laporan Hafalan Siswa"} levels={["tahfiz"]}>
      <div className="container-fluid card mb-3">
        <div className="card-body text-end">
          {isLoading ? (
            <div className="d-flex justify-content-end">
              <div
                className="spinner-border spinner-border-sm text-secondary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="btn-group btn-group-lg d-flex flex-wrap justify-content-end gap-2">
              {types?.map((type) => (
                <button
                  key={type.id}
                  className={`btn ${
                    typeId === type.id
                      ? "btn-secondary"
                      : "btn-outline-secondary"
                  } transition-all hover:shadow-md`}
                  onClick={() => setTypeId(type.id)}
                  aria-pressed={typeId === type.id}
                  aria-label={`Lihat laporan ${type.name}`}
                >
                  {type.name}
                </button>
              ))}
              <button
                className="btn btn-danger d-flex align-items-center gap-2 hover:shadow-md"
                onClick={() => setTypeId("")}
                aria-label="Reset pilihan"
              >
                <i className="bi bi-recycle"></i>
                <span className="d-none d-sm-inline">Reset</span>
              </button>
              <button
                className="btn btn-success d-flex align-items-center gap-2 hover:shadow-md"
                onClick={() => setAchievement(!achievement)}
                aria-pressed={achievement}
                aria-label={`Tampilkan ${achievement ? "Laporan" : "Capaian"}`}
              >
                <i
                  className={`bi ${achievement ? "bi-file-text" : "bi-trophy"}`}
                ></i>
                <span className="d-none d-sm-inline">
                  {achievement ? "Laporan" : "Capaian"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {achievement ? <Achievement /> : <TableData type={typeId} />}
    </Layout>
  );
};

export default TahfizReport;
