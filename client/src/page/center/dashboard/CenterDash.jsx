import React from "react";
import Layout from "../../../components/layout/Layout";
import { useGetCenterDashboardQuery } from "../../../controller/api/dashboard/ApiDashboard";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import StudentDemographics from "./components/StudentDemographics";
import GeographicalDistribution from "../../../components/geographical/GeographicalDistribution";
import EntryYearDistribution from "./components/EntryYearDistribution";
import FamilyInformation from "./components/FamilyInformation";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const CenterDash = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useGetCenterDashboardQuery();
  const { user } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <Layout title={"Admin Dashboard"}>
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ height: "50vh" }}>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={"Admin Dashboard"}>
        <div className='alert alert-danger' role='alert'>
          <h4 className='alert-heading'>Error!</h4>
          <p>Failed to load dashboard data. Please try again later.</p>
          <hr />
          <p className='mb-0'>Error details: {error.message}</p>
        </div>
      </Layout>
    );
  }

  const {
    basicStats,
    studentsPerGrade,
    teacherComposition,
    examStats,
    learningStats,
    recentActivities,
    homebaseStats,
    activityLogs,
    studentDemographics,
    geographicalDistribution,
    familyStats,
    entryStats,
  } = dashboardData || {};

  return (
    <Layout title={"Admin Dashboard"} levels={["center"]}>
      <div className='container-fluid'>
        {/* Overview Cards */}
        <div className='row mb-4'>
          <div className='col-md-3'>
            <div className='card bg-primary text-white'>
              <div className='card-body'>
                <h5 className='card-title'>Total Students</h5>
                <h2 className='card-text'>{basicStats?.total_students || 0}</h2>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card bg-success text-white'>
              <div className='card-body'>
                <h5 className='card-title'>Total Teachers</h5>
                <h2 className='card-text'>{basicStats?.total_teachers || 0}</h2>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card bg-info text-white'>
              <div className='card-body'>
                <h5 className='card-title'>Total Classes</h5>
                <h2 className='card-text'>{basicStats?.total_classes || 0}</h2>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card bg-warning text-white'>
              <div className='card-body'>
                <h5 className='card-title'>Total Homebase</h5>
                <h2 className='card-text'>{basicStats?.total_homebase || 0}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Student Demographics */}
        <StudentDemographics studentDemographics={studentDemographics} />

        {/* Geographical Distribution and Entry Year */}
        <div className='row mb-3'>
          <GeographicalDistribution data={geographicalDistribution} />
          <EntryYearDistribution
            entryStats={entryStats}
            studentDemographics={studentDemographics}
          />
        </div>

        {/* Family Information */}
        <FamilyInformation
          familyStats={familyStats}
          studentDemographics={studentDemographics}
        />

        {/* Homebase Statistics */}
        <div className='row mb-4'>
          <div className='col-md-12'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Statistik Homebase</h5>
              </div>
              <div className='card-body'>
                <div className='table-responsive'>
                  <table className='table table-striped'>
                    <thead>
                      <tr>
                        <th>Homebase</th>
                        <th>Students</th>
                        <th>Teachers</th>
                        <th>Classes</th>
                        <th>Subjects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {homebaseStats?.map((homebase) => (
                        <tr key={homebase.homebase_name}>
                          <td>{homebase.homebase_name}</td>
                          <td>{homebase.total_students}</td>
                          <td>{homebase.total_teachers}</td>
                          <td>{homebase.total_classes}</td>
                          <td>{homebase.total_subjects}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Distribution by Grade */}
        <div className='row mb-4'>
          <div className='col-md-6'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Students by Grade</h5>
              </div>
              <div className='card-body'>
                <div className='table-responsive'>
                  <table className='table table-striped'>
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th>Total Students</th>
                        <th>Male</th>
                        <th>Female</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsPerGrade?.map((grade) => (
                        <tr key={grade.grade_name}>
                          <td>{grade.grade_name}</td>
                          <td>{grade.total_students}</td>
                          <td>{grade.male_count}</td>
                          <td>{grade.female_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Teacher Composition</h5>
              </div>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-md-6'>
                    <h6>Gender Distribution</h6>
                    <p>Male: {teacherComposition?.male_count || 0}</p>
                    <p>Female: {teacherComposition?.female_count || 0}</p>
                  </div>
                  <div className='col-md-6'>
                    <h6>Homeroom Teachers</h6>
                    <p>Total: {teacherComposition?.homeroom_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Materials and Exams */}
        <div className='row mb-4'>
          <div className='col-md-6'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Learning Materials</h5>
              </div>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-md-4'>
                    <h6>Chapters</h6>
                    <p>{learningStats?.total_chapters || 0}</p>
                  </div>
                  <div className='col-md-4'>
                    <h6>Contents</h6>
                    <p>{learningStats?.total_contents || 0}</p>
                  </div>
                  <div className='col-md-4'>
                    <h6>Files</h6>
                    <p>{learningStats?.total_files || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col-md-6'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Exam Statistics</h5>
              </div>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-md-4'>
                    <h6>Total Exams</h6>
                    <p>{examStats?.total_exams || 0}</p>
                  </div>
                  <div className='col-md-4'>
                    <h6>Active Exams</h6>
                    <p>{examStats?.active_exams || 0}</p>
                  </div>
                  <div className='col-md-4'>
                    <h6>Teachers</h6>
                    <p>{examStats?.teacher_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className='row'>
          <div className='col-md-12'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>Recent Activities</h5>
              </div>
              <div className='card-body'>
                <div className='table-responsive'>
                  <table className='table table-striped'>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Teacher</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities?.map((activity) => (
                        <tr key={activity.id}>
                          <td>{activity.type}</td>
                          <td>{activity.title}</td>
                          <td>{activity.teacher_name}</td>
                          <td>
                            {new Date(activity.createdat).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CenterDash;
