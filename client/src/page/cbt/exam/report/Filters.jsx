import React, { useState } from "react";
import { useGetFilterQuery } from "../../../../controller/api/log/ApiLog";

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
  const [activeTab, setActiveTab] = useState("view");
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
    <div className="card my-2 shadow-sm">
      <div className="card-body p-3">
        {/* Main Tabs Navigation */}
        <ul className="nav nav-tabs nav-fill mb-3" id="mainTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "view" ? "active" : ""
              } rounded-top`}
              id="view-tab"
              data-bs-toggle="tab"
              data-bs-target="#view"
              type="button"
              role="tab"
              aria-controls="view"
              aria-selected={activeTab === "view"}
              onClick={() => setActiveTab("view")}
            >
              <i className="bi bi-eye me-1"></i>
              Tampilan
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "filter" ? "active" : ""
              } rounded-top`}
              id="filter-tab"
              data-bs-toggle="tab"
              data-bs-target="#filter"
              type="button"
              role="tab"
              aria-controls="filter"
              aria-selected={activeTab === "filter"}
              onClick={() => setActiveTab("filter")}
            >
              <i className="bi bi-funnel me-1"></i>
              Filter
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "actions" ? "active" : ""
              } rounded-top`}
              id="actions-tab"
              data-bs-toggle="tab"
              data-bs-target="#actions"
              type="button"
              role="tab"
              aria-controls="actions"
              aria-selected={activeTab === "actions"}
              onClick={() => setActiveTab("actions")}
            >
              <i className="bi bi-gear me-1"></i>
              Aksi
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content" id="mainTabsContent">
          {/* View Tab Content */}
          <div
            className={`tab-pane fade ${
              activeTab === "view" ? "show active" : ""
            }`}
            id="view"
            role="tabpanel"
            aria-labelledby="view-tab"
          >
            <div className="row g-3 align-items-center">
              {/* Token and Status */}
              <div className="col-md-4">
                <div className="d-flex gap-2 align-items-center">
                  <span className="badge bg-primary px-3 py-2 rounded-pill">
                    {token}
                  </span>
                  {lastUpdateTime && (
                    <span className="badge bg-danger px-3 py-2 rounded-pill">
                      <i className="bi bi-clock-history me-1"></i>
                      Terakhir diperbarui: {lastUpdateTime}
                    </span>
                  )}
                </div>
              </div>

              {/* View Type Tabs */}
              <div className="col-md-8">
                <ul
                  className="nav nav-pills nav-fill"
                  id="viewTypeTabs"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeView === "table" ? "active" : ""
                      } rounded-pill`}
                      id="table-view-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#table-view"
                      type="button"
                      role="tab"
                      aria-controls="table-view"
                      aria-selected={activeView === "table"}
                      onClick={() => setActiveView("table")}
                    >
                      <i className="bi bi-person-lines-fill me-1"></i>
                      Log
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeView === "chart" ? "active" : ""
                      } rounded-pill`}
                      id="chart-view-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#chart-view"
                      type="button"
                      role="tab"
                      aria-controls="chart-view"
                      aria-selected={activeView === "chart"}
                      onClick={() => setActiveView("chart")}
                    >
                      <i className="bi bi-bar-chart me-1"></i>
                      Grafik
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeView === "analysis" ? "active" : ""
                      } rounded-pill`}
                      id="analysis-view-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#analysis-view"
                      type="button"
                      role="tab"
                      aria-controls="analysis-view"
                      aria-selected={activeView === "analysis"}
                      onClick={() => setActiveView("analysis")}
                    >
                      <i className="bi bi-clipboard2-data-fill me-1"></i>
                      Analisis
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeView === "list" ? "active" : ""
                      } rounded-pill`}
                      id="list-view-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#list-view"
                      type="button"
                      role="tab"
                      aria-controls="list-view"
                      aria-selected={activeView === "list"}
                      onClick={() => setActiveView("list")}
                    >
                      <i className="bi bi-file-earmark-excel me-1"></i>
                      Nilai
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Filter Tab Content */}
          <div
            className={`tab-pane fade ${
              activeTab === "filter" ? "show active" : ""
            }`}
            id="filter"
            role="tabpanel"
            aria-labelledby="filter-tab"
          >
            <div className="row g-3 align-items-center">
              <div className="col-12">
                <h6 className="mb-3 text-primary border-bottom pb-2">
                  <i className="bi bi-funnel me-2"></i>
                  Filter Kelas
                </h6>
                <div className="d-flex gap-2 flex-wrap">
                  {classes?.map((item) => (
                    <button
                      key={item.id}
                      className={`btn btn-sm ${
                        classid === item.id
                          ? "btn-secondary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setClassid(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                  <button
                    className="btn btn-sm btn-dark"
                    onClick={() => setClassid("")}
                    title="Reset Filter"
                  >
                    <i className="bi bi-recycle me-1"></i>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Tab Content */}
          <div
            className={`tab-pane fade ${
              activeTab === "actions" ? "show active" : ""
            }`}
            id="actions"
            role="tabpanel"
            aria-labelledby="actions-tab"
          >
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
                <h6 className="mb-3 text-primary border-bottom pb-2">
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Refresh Data
                </h6>
                <button
                  className="btn btn-danger"
                  onClick={handleRefetch}
                  title="Refresh Data"
                >
                  <i className="bi bi-repeat me-1"></i>
                  Refresh Semua Data
                </button>
              </div>

              <div className="col-md-6">
                <h6 className="mb-3 text-primary border-bottom pb-2">
                  <i className="bi bi-download me-2"></i>
                  Export Data
                </h6>
                {(activeView === "table" ||
                  activeView === "list" ||
                  activeView === "analysis") && (
                  <button
                    className="btn btn-primary"
                    onClick={onExport}
                    title="Export to Excel"
                  >
                    <i className="bi bi-file-earmark-arrow-down me-1"></i>
                    Export ke Excel
                  </button>
                )}
                {!(
                  activeView === "table" ||
                  activeView === "list" ||
                  activeView === "analysis"
                ) && (
                  <div className="text-muted">
                    <small>
                      <i className="bi bi-info-circle me-1"></i>
                      Export tersedia untuk tampilan Log, Analisis, dan Nilai
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
