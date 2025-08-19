import { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useSelector } from "react-redux";
import { useGetParentDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";
import LoadingScreen from "../../../components/loader/LoadingScreen";
import {
  FaGraduationCap,
  FaQuran,
  FaBell,
  FaUserGraduate,
  FaUser,
  FaUsers,
  FaHome,
  FaCalendarAlt,
  FaIdCard,
} from "react-icons/fa";
import { useGetStudentDataQuery } from "../../../controller/api/database/ApiDatabase";
import Biodata from "./Biodata";
import Parent from "./Parent";
import Family from "./Family";
import "./dashboard.css";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ParentDash = () => {
  const [activeTab, setActiveTab] = useState("biodata");

  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, error, refetch } = useGetStudentDataQuery(
    user?.student_id,
    {
      skip: !user?.student_id,
    }
  );

  const studentData = data?.data;

  const handleTab = (tab) => {
    setActiveTab(tab);
  };

  const handleRefetch = () => {
    refetch();
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <Layout title="Dashboard" levels={["parent"]}>
      <div className="container-fluid parent-dashboard">
        {/* Header Section with Student Info */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-gradient-primary">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="bg-white rounded-circle p-3 me-3 shadow-sm">
                          <FaUser className="text-primary fs-4" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-white fw-bold">
                            {user?.student}
                          </h4>
                          <p className="mb-0 text-white-50">
                            <FaIdCard className="me-2" />
                            NIS: {user?.nis || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="d-flex flex-column gap-2">
                      <span className="badge bg-white bg-opacity-25 text-white border-0 px-3 py-2">
                        <FaCalendarAlt className="me-2" />
                        {user?.periode_name || "Current Period"}
                      </span>
                      <span className="badge bg-white bg-opacity-25 text-white border-0 px-3 py-2">
                        <FaGraduationCap className="me-2" />
                        {user?.grade} {user?.class}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold text-dark">
                  <FaUsers className="me-2 text-primary" />
                  Student Information Management
                </h5>
              </div>
              <div className="card-body p-0">
                {/* Enhanced Navigation Tabs */}
                <div className="px-4 pt-3">
                  <ul
                    className="nav nav-pills nav-fill bg-light rounded-3 p-2"
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link rounded-2 px-4 py-2 fw-medium ${
                          activeTab === "biodata"
                            ? "active bg-primary text-white"
                            : "text-dark"
                        }`}
                        onClick={() => handleTab("biodata")}
                        type="button"
                        role="tab"
                      >
                        <FaUser className="me-2" />
                        Biodata
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link rounded-2 px-4 py-2 fw-medium ${
                          activeTab === "parent"
                            ? "active bg-primary text-white"
                            : "text-dark"
                        }`}
                        onClick={() => handleTab("parent")}
                        type="button"
                        role="tab"
                      >
                        <FaUsers className="me-2" />
                        Orang Tua
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link rounded-2 px-4 py-2 fw-medium ${
                          activeTab === "family"
                            ? "active bg-primary text-white"
                            : "text-dark"
                        }`}
                        onClick={() => handleTab("family")}
                        type="button"
                        role="tab"
                      >
                        <FaHome className="me-2" />
                        Keluarga
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Tab Content */}
                <div className="tab-content p-4">
                  <div
                    className={`tab-pane fade ${
                      activeTab === "biodata" ? "show active" : ""
                    }`}
                  >
                    <Biodata
                      studentData={studentData && studentData}
                      userid={user?.student_id}
                      onRefetch={handleRefetch}
                    />
                  </div>
                  <div
                    className={`tab-pane fade ${
                      activeTab === "parent" ? "show active" : ""
                    }`}
                  >
                    <Parent
                      studentData={studentData && studentData}
                      userid={user?.student_id}
                      onRefetch={handleRefetch}
                    />
                  </div>
                  <div
                    className={`tab-pane fade ${
                      activeTab === "family" ? "show active" : ""
                    }`}
                  >
                    <Family
                      families={studentData?.family}
                      userid={user?.student_id}
                      onRefetch={handleRefetch}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDash;
