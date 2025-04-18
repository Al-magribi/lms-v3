import * as Io from "react-icons/io";
import Meta from "../meta/Meta";
import {
  AdminMenus,
  CenterMenus,
  StudentMenus,
  TeacherMenus,
  TahfizMenus,
} from "../menu/Menus";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { setLogout } from "../../controller/slice/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../../controller/api/auth/ApiAuth";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isSignin } = useSelector((state) => state.auth);
  const [logout, { isSuccess, isLoading, error, reset }] = useLogoutMutation();

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
      navigate("/");
    }

    if (error) {
      reset();
    }
  }, [isSuccess, error]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 992) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToLink = (link) => {
    navigate(link);
    setIsMenuOpen(false);
  };

  const dynamicHeight = windowWidth >= 820 ? "88vh" : "98vh";
  const level = user?.level;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user || !levels.includes(user?.level) || !isSignin) {
        navigate("/");
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, isSignin, levels]);

  const isActiveMenu = (menuLink) => {
    return location.pathname === menuLink;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-vh-100 d-flex bg-light flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
        <div className="container-fluid px-4">
          <a
            className="navbar-brand fw-bold d-flex align-items-center"
            href={
              level === "center"
                ? center
                : level === "admin"
                ? admin
                : level === "teacher"
                ? teacher
                : level === "student"
                ? student
                : level === "parent"
                ? parent
                : tahfiz
            }
          >
            <span className="d-none d-md-inline">
              <i className="bi bi-person-circle me-2"></i>
              {user?.name}
            </span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <i className={`bi bi-${isMenuOpen ? "x-lg" : "list"}`}></i>
          </button>
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
            id="navbarNav"
          >
            <div className="navbar-nav ms-auto">
              <div className="d-flex flex-wrap gap-2">
                {(level === "center"
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
                  : StudentMenus
                ).map((menu, i) => (
                  <button
                    key={i}
                    className={`btn d-flex align-items-center gap-2 ${
                      isActiveMenu(menu.link)
                        ? "btn-light"
                        : "btn-outline-light"
                    }`}
                    onClick={() => goToLink(menu.link)}
                  >
                    {menu.icon}
                    <span className="d-none d-md-inline">{menu.label}</span>
                  </button>
                ))}
                <button
                  className="btn btn-outline-light d-flex align-items-center gap-2"
                  disabled={isLoading}
                  onClick={logoutHandler}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="flex-grow-1 transition-all"
        style={{
          marginTop: "50px",
          padding: "20px",
          minHeight: dynamicHeight,
          transition: "all 0.3s ease",
        }}
      >
        <div className="container-fluid">
          <Meta title={title} desc={desc} />
          <div className="content-wrapper">
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-house-door-fill me-2 text-primary"></i>
              <h4 className="mb-0">{title}</h4>
            </div>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-2">
        <div className="container-fluid text-center">
          <div className="d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-c-circle"></i>
            <small>LMS {new Date().getFullYear()} | NIBS </small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
