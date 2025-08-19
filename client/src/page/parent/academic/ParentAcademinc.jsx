import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import {
  useGetParentAvailableMonthsQuery,
  useGetParentMonthlyReportQuery,
} from "../../../controller/api/lms/ApiScore";
import MonthlyReportView from "./components/MonthlyReportView";
import MonthSelector from "./components/MonthSelector";
import "./ParentAcademic.css";

const ParentAcademic = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const { data: availableMonths, isLoading: loadingMonths } =
    useGetParentAvailableMonthsQuery();

  const {
    data: monthlyReport,
    isLoading: loadingReport,
    error,
  } = useGetParentMonthlyReportQuery(
    { month: selectedMonth, semester: selectedSemester },
    { skip: !selectedMonth || !selectedSemester }
  );

  const handleMonthSelect = (month, semester) => {
    setSelectedMonth(month);
    setSelectedSemester(semester);
  };

  return (
    <Layout levels={["parent"]} title={"Laporan Akademik"}>
      <div className="container-fluid">
        {/* Header Info */}
        <div className="alert alert-primary d-flex align-items-center mb-4">
          <i className="bi bi-info-circle fs-5 me-2"></i>
          <div>
            <strong>Informasi Laporan:</strong>
            <br />
            <small>
              Pembaruan laporan dapat dilihat tanggal 10 disetiap bulan
            </small>
          </div>
        </div>

        {/* Month Selector */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-event me-2"></i>
                  Pilih Periode Laporan
                </h5>
              </div>
              <div className="card-body">
                <MonthSelector
                  availableMonths={availableMonths}
                  loading={loadingMonths}
                  onMonthSelect={handleMonthSelect}
                  selectedMonth={selectedMonth}
                  selectedSemester={selectedSemester}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Report Display */}
        {selectedMonth && selectedSemester && (
          <div className="row">
            <div className="col-12">
              <MonthlyReportView
                report={monthlyReport}
                loading={loadingReport}
                error={error}
                selectedMonth={selectedMonth}
                selectedSemester={selectedSemester}
              />
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedMonth && !selectedSemester && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-file-earmark-text display-1 text-muted mb-3"></i>
                  <h4 className="text-muted">Pilih Periode Laporan</h4>
                  <p className="text-muted">
                    Silakan pilih bulan dan semester untuk melihat laporan
                    akademik anak Anda
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentAcademic;
