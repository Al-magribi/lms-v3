import React, { useState } from "react";
import { useGetFilterQuery } from "../../../../controller/api/log/ApiLog";
import "./Filters.css";

const Filters = ({
  classid,
  setClassid,
  examid,
  name,
  token,
  onRefetch,
  activeView,
  setActiveView,
  onExport,
}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const { data: classes, refetch: refetchClasses } = useGetFilterQuery(
    { exam: examid },
    { skip: !examid }
  );

  const handleRefetch = () => {
    setLastUpdateTime(new Date().toLocaleString());
    // Refetch all data
    refetchClasses();
    onRefetch();
  };

  return (
    <div className="card my-2 shadow-sm hover-shadow transition-all">
      <div className="card-body p-3">
        <div className="row g-3 align-items-center">
          {/* Title and Token Section */}
          <div className="col-md-4">
            <div className="d-flex flex-column gap-2">
              <div className="d-flex gap-2 align-items-center">
                <span className="badge bg-primary px-3 py-2 rounded-pill">
                  {token}
                </span>
              </div>
              {lastUpdateTime && (
                <span className="badge bg-danger px-3 py-2 rounded-pill">
                  <i className="bi bi-clock-history me-1"></i>
                  Terakhir diperbarui: {lastUpdateTime}
                </span>
              )}
            </div>
          </div>

          {/* View Toggle Buttons */}
          <div className="col-md-4">
            <div className="d-flex justify-content-center gap-2">
              <button
                className={`btn ${
                  activeView === "table" ? "btn-success" : "btn-outline-success"
                } rounded-pill px-3 hover-scale`}
                onClick={() => setActiveView("table")}
                title="Tampilan Tabel"
              >
                <i className="bi bi-person-lines-fill"></i>
              </button>
              <button
                className={`btn ${
                  activeView === "chart" ? "btn-success" : "btn-outline-success"
                } rounded-pill px-3 hover-scale`}
                onClick={() => setActiveView("chart")}
                title="Tampilan Grafik"
              >
                <i className="bi bi-bar-chart"></i>
              </button>
              <button
                className={`btn ${
                  activeView === "list" ? "btn-success" : "btn-outline-success"
                } rounded-pill px-3 hover-scale`}
                onClick={() => setActiveView("list")}
                title="Tampilan List"
              >
                <i className="bi bi-file-earmark-excel"></i>
              </button>

              {(activeView === "table" || activeView === "list") && (
                <button
                  className="btn btn-primary rounded-pill px-3 hover-scale"
                  onClick={onExport}
                  title="Export to Excel"
                >
                  <i className="bi bi-file-earmark-arrow-down"></i>
                </button>
              )}
            </div>
          </div>

          {/* Class Filter Buttons */}
          <div className="col-md-4">
            <div className="d-flex justify-content-end gap-2 flex-wrap">
              {classes?.map((item) => (
                <button
                  key={item.id}
                  className={`btn ${
                    classid === item.id
                      ? "btn-secondary"
                      : "btn-outline-secondary"
                  } rounded-pill px-3 hover-scale`}
                  onClick={() => setClassid(item.id)}
                >
                  {item.name}
                </button>
              ))}
              <button
                className="btn btn-dark rounded-pill px-3 hover-scale"
                onClick={() => setClassid("")}
                title="Reset Filter"
              >
                <i className="bi bi-recycle"></i>
              </button>
              <button
                className="btn btn-danger rounded-pill px-3 hover-scale"
                onClick={handleRefetch}
                title="Refresh Data"
              >
                <i className="bi bi-repeat"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
