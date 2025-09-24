import * as Io from "react-icons/io";
import Meta from "../meta/Meta";
import {
  AdminMenus,
  CenterMenus,
  StudentMenus,
  TeacherMenus,
  TahfizMenus,
  ParentMenus,
} from "../menu/Menus";
import { useNavigate, useLocation } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { setLogout } from "../../controller/slice/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../../controller/api/auth/ApiAuth";
import * as Pi from "react-icons/pi";
import { useGetAppQuery } from "../../controller/api/center/ApiApp";

const center = "/center-dashboard";
const admin = "/admin-dashboard";
const teacher = "/guru-dashboard";
const student = "/siswa-dashboard";
const parent = "/orangtua-dashboard";
const tahfiz = "/tahfiz-dashboard";

const Layout = ({ children, title, desc, levels }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 992);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isSignin } = useSelector((state) => state.auth);

  const [logout, { isSuccess, isLoading, error, reset }] = useLogoutMutation();
  const { data: appData } = useGetAppQuery();

  const truncateName = (name) => {
    if (!name) return "";
    return windowWidth < 768 && name.length > 16
      ? `${name.substring(0, 16)}...`
      : name;
  };

  const logoutHandler = () => {
    toast.promise(
      logout()
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      dispatch(setLogout());
      window.location.href = "/signin";
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (newWidth >= 992) {
        setIsSidebarOpen(true);
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToLink = (link) => {
    navigate(link);
    if (windowWidth < 992) {
      setIsMobileMenuOpen(false);
    }
  };

  const dynamicHeight = windowWidth >= 820 ? "88vh" : "98vh";
  const level = user?.level;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user || !isSignin || !levels.includes(user?.level)) {
        if (user === null || (user && Object.keys(user).length === 0)) {
          window.location.href = "/signin";
        } else {
          window.location.href = "/signin";
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, isSignin, levels]);

  const isActiveMenu = (menuLink) => {
    return location.pathname === menuLink;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const goToDatabase = () => {
    navigate("/database");
  };

  const goToGraduation = () => {
    navigate("/admin-lulusan");
  };

  const goToHomeroom = () => {
    navigate(
      `/guru-wali-kelas/${user?.class.replace(/\s+/g, "-")}/${user?.class_id}`
    );
  };

  const goToStudent = () => {
    navigate("/admin-siswa");
  };

  const goToScores = () => {
    navigate("/guru-penilaian");
  };

  const currentMenus =
    level === "center"
      ? CenterMenus
      : level === "admin"
      ? AdminMenus
      : level === "teacher"
      ? TeacherMenus
      : level === "student"
      ? StudentMenus
      : level === "parent"
      ? ParentMenus
      : level === "tahfiz"
      ? TahfizMenus
      : StudentMenus;

  return (
    <div className="d-flex bg-light" style={{ minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 991px) {
          .desktop-sidebar {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            transform: translateX(-100%) !important;
          }
          
          .mobile-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`bg-primary text-white d-flex flex-column flex-shrink-0 desktop-sidebar h-100 ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          width: isSidebarOpen ? "250px" : "80px",
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1050,
          transition: "width 0.3s ease",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          display: windowWidth < 992 ? "none" : "flex",
          visibility: windowWidth < 992 ? "hidden" : "visible",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-bottom border-light border-opacity-25">
          {!isSidebarOpen && <i className="bi bi-person-circle fs-4 ms-3"></i>}

          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center flex-grow-1">
              {isSidebarOpen && (
                <div className="flex-grow-1">
                  <h6 className="mb-0 fw-bold text-truncate">
                    {truncateName(user?.name)}
                  </h6>
                  <small className="text-light opacity-75">{user?.level}</small>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <button
                className="btn btn-sm btn-outline-light"
                onClick={toggleSidebar}
                style={{ minWidth: "32px", height: "32px" }}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav
          className="flex-grow-1 p-3 overflow-auto"
          style={{
            msOverflowStyle: "none", // IE dan Edge lama
            scrollbarWidth: "none", // Firefox
          }}
        >
          <ul className="nav nav-pills flex-column gap-1">
            {currentMenus.map((menu, i) => (
              <li key={i} className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 ${
                    isActiveMenu(menu.link)
                      ? "active bg-light text-primary"
                      : "text-white"
                  }`}
                  onClick={() => goToLink(menu.link)}
                  style={{
                    borderRadius: "8px",
                    padding: "12px 16px",
                    border: "none",
                    transition: "all 0.2s ease",
                    minHeight: "44px",
                  }}
                >
                  <span style={{ minWidth: "20px", textAlign: "center" }}>
                    {menu.icon}
                  </span>
                  {isSidebarOpen && (
                    <span className="flex-grow-1">{menu.label}</span>
                  )}
                </button>
              </li>
            ))}

            {user?.homeroom && (
              <li className="nav-item">
                <button
                  className="nav-link w-100 text-start d-flex align-items-center gap-3 text-white"
                  onClick={goToHomeroom}
                  style={{
                    borderRadius: "8px",
                    padding: "12px 16px",
                    border: "none",
                    transition: "all 0.2s ease",
                    minHeight: "44px",
                  }}
                >
                  <i
                    className="bi bi-database fs-5"
                    style={{ minWidth: "20px", textAlign: "center" }}
                  ></i>
                  {isSidebarOpen && (
                    <span className="fw-medium flex-grow-1">Database</span>
                  )}
                </button>
              </li>
            )}

            <li className="nav-item">
              <button
                className="btn btn-danger w-100 d-flex align-items-center gap-3"
                disabled={isLoading}
                onClick={logoutHandler}
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  border: "none",
                  transition: "all 0.2s ease",
                  minHeight: "44px",
                }}
              >
                <i
                  className="bi bi-box-arrow-right fs-5"
                  style={{ minWidth: "20px", textAlign: "center" }}
                ></i>

                {isSidebarOpen && (
                  <span className="flex-grow-1 text-start">Logout</span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`flex-grow-1 d-flex flex-column ${
          windowWidth < 992 ? "mobile-content" : ""
        }`}
        style={{
          marginLeft:
            windowWidth >= 992 ? (isSidebarOpen ? "250px" : "80px") : "0px",
          width: windowWidth < 992 ? "100%" : "auto",
          transition: "margin-left 0.3s ease, width 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* Top Header */}
        <header
          className="bg-white border-bottom px-4 py-3"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1030,
            paddingLeft: windowWidth < 768 ? "1rem" : "1.5rem",
            paddingRight: windowWidth < 768 ? "1rem" : "1.5rem",
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center  gap-3">
              <button
                className="btn btn-outline-primary d-lg-none"
                onClick={toggleMobileMenu}
                style={{ width: 40 }}
              >
                <i className="bi bi-list"></i>
              </button>
              {!isSidebarOpen && windowWidth >= 992 && (
                <button
                  className="btn btn-outline-primary d-none d-lg-block"
                  onClick={toggleSidebar}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              )}

              <h5
                className="mb-0  text-dark"
                style={{
                  fontSize: windowWidth < 768 ? "1rem" : "1.25rem",
                }}
              >
                {title}
              </h5>
            </div>

            {/* Action Buttons */}
            <div
              className="d-flex gap-2"
              style={{
                display: windowWidth < 768 ? "none" : "flex",
              }}
            >
              {title === "Management Kelas" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#addclass"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span className="ms-2 d-none d-md-inline">Kelas</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#uploadstudents"
                  >
                    <i className="bi bi-file-earmark-arrow-up-fill"></i>
                    <span className="ms-2 d-none d-md-inline">
                      Upload Siswa
                    </span>
                  </button>
                </>
              )}

              {title === "Management Siswa" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={goToDatabase}
                  >
                    <i className="bi bi-database"></i>
                    <span className="ms-2 d-none d-md-inline">Database</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={goToGraduation}
                  >
                    <i className="bi bi-mortarboard-fill"></i>
                    <span className="ms-2 d-none d-md-inline">Lulusan</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#addstudent"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span className="ms-2 d-none d-md-inline">Siswa</span>
                  </button>
                </>
              )}

              {title === "Mata Pelajaran" && (
                <button
                  className="btn btn-sm btn-outline-success"
                  data-bs-toggle="modal"
                  data-bs-target="#addsubject"
                >
                  <i className="bi bi-plus-lg"></i>
                  <span className="ms-2 d-none d-md-inline">
                    Mata Pelajaran
                  </span>
                </button>
              )}

              {title === "Database" && (
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={goToStudent}
                >
                  <Pi.PiStudentFill />
                  <span className="ms-2 d-none d-md-inline">Siswa</span>
                </button>
              )}

              {title === "Lulusan" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={goToStudent}
                  >
                    <Pi.PiStudentFill />
                    <span className="ms-2 d-none d-md-inline">Siswa</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#addgraduation"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span className="ms-2 d-none d-md-inline">Lulusan</span>
                  </button>
                </>
              )}

              {title === "Guru" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#addteacher"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span className="ms-2 d-none d-md-inline">Guru</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#uploadteacher"
                  >
                    <i className="bi bi-file-earmark-arrow-up-fill"></i>
                    <span className="ms-2 d-none d-md-inline">Upload</span>
                  </button>
                </>
              )}

              {title === "Daftar Bank Soal" && (
                <button
                  className="btn btn-sm btn-outline-success"
                  data-bs-toggle="modal"
                  data-bs-target="#addbank"
                >
                  <i className="bi bi-plus-lg"></i>
                  <span className="ms-2 d-none d-md-inline">Bank Soal</span>
                </button>
              )}

              {title === "Daftar Ujian" && (
                <button
                  className="btn btn-sm btn-outline-success"
                  data-bs-toggle="modal"
                  data-bs-target="#addexam"
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  <span className="d-none d-md-inline">Tambah Ujian</span>
                </button>
              )}

              {title === "Penilaian" && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToScores}
                >
                  <i className="bi bi-arrow-left-right me-2"></i>
                  <span className="d-none d-md-inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-grow-1 p-4"
          style={{
            padding: windowWidth < 768 ? "0.5rem" : "1.5rem",
          }}
        >
          <Meta title={title} desc={desc} />
          <div className="content-wrapper">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-3 px-4">
          <div className="text-center">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-c-circle text-primary"></i>
              <small className="text-muted">
                ALMADEV {new Date().getFullYear()} | {appData?.app_name}
              </small>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`position-fixed top-0 start-0 h-100 bg-primary text-white d-lg-none ${
          isMobileMenuOpen ? "show" : ""
        }`}
        style={{
          width: "280px",
          zIndex: 1050,
          transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-3 border-bottom border-light border-opacity-25">
          <div className="d-flex align-items-center justify-content-between">
            <div className="flex-grow-1">
              <h6 className="mb-0 fw-bold text-truncate">
                {truncateName(user?.name)}
              </h6>
              <small className="text-light opacity-75">{user?.level}</small>
            </div>

            <button
              className="btn btn-sm btn-outline-light ms-2"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Navigation */}
        <nav className="flex-grow-1 p-3">
          <ul className="nav nav-pills flex-column gap-2">
            {currentMenus.map((menu, i) => (
              <li key={i} className="nav-item">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-3 ${
                    isActiveMenu(menu.link)
                      ? "active bg-light text-primary"
                      : "text-white"
                  }`}
                  onClick={() => goToLink(menu.link)}
                  style={{
                    borderRadius: "8px",
                    padding: "12px 16px",
                    border: "none",
                    transition: "all 0.2s ease",
                    minHeight: "48px",
                  }}
                >
                  <span
                    className="fs-5"
                    style={{ minWidth: "20px", textAlign: "center" }}
                  >
                    {menu.icon}
                  </span>
                  <span className="fw-medium flex-grow-1">{menu.label}</span>
                </button>
              </li>
            ))}

            {user?.homeroom && (
              <li className="nav-item">
                <button
                  className="nav-link w-100 text-start d-flex align-items-center gap-3 text-white"
                  onClick={goToHomeroom}
                  style={{
                    borderRadius: "8px",
                    padding: "12px 16px",
                    border: "none",
                    transition: "all 0.2s ease",
                    minHeight: "48px",
                  }}
                >
                  <i
                    className="bi bi-database fs-5"
                    style={{ minWidth: "20px", textAlign: "center" }}
                  ></i>
                  <span className="fw-medium flex-grow-1">Database</span>
                </button>
              </li>
            )}

            <li className="nav-item">
              <button
                className="btn btn-danger w-100 d-flex align-items-center gap-3"
                disabled={isLoading}
                onClick={logoutHandler}
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  border: "none",
                  transition: "all 0.2s ease",
                  minHeight: "44px",
                }}
              >
                <i
                  className="bi bi-box-arrow-right fs-5"
                  style={{ minWidth: "20px", textAlign: "center" }}
                ></i>

                <span className="flex-grow-1 text-start">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
