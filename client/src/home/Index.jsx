import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  useSigninMutation,
  useLoadUserMutation,
} from "../controller/api/auth/ApiAuth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLogin } from "../controller/slice/AuthSlice";
import "./Index.css";

const Index = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [role, setRole] = useState("none");
  const [isSignup, setSignup] = useState(false);
  const [accountValue, setAccountValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signin, { isLoading, data }] = useSigninMutation();
  const [loadUser, { isLoading: isLoadingUser }] = useLoadUserMutation();
  const { user, isSignin } = useSelector((state) => state.auth);

  const handlePasswordToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRoleChange = (value) => {
    setRole(value);
    setAccountValue(""); // Reset account value when role changes
  };

  const handleSignup = () => {
    setRole("");
    setSignup(true);
    setAccountValue("");
  };

  const back = () => {
    setRole("none");
    setSignup(false);
    setAccountValue("");
  };

  const routes = {
    center: "/center-dashboard",
    admin: "/admin-dashboard",
    student: "/siswa-dashboard",
    teacher: "/guru-dashboard",
    parent: "/wali-dashboard",
    tahfiz: "/tahfiz-dashboard",
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    const credentials = {
      password,
      ...(role === "student"
        ? { nis: accountValue }
        : role === "teacher"
        ? { username: accountValue }
        : role === "parent"
        ? { name: accountValue }
        : { email: accountValue }),
    };

    await toast.promise(signin(credentials).unwrap(), {
      loading: "Sedang masuk...",
      success: async (response) => {
        // First dispatch the initial user data from signin
        dispatch(setLogin(response.user));

        try {
          // Then load the complete user data
          const userData = await loadUser().unwrap();
          dispatch(setLogin(userData));

          // Redirect after loading complete user data
          window.location.href = routes[userData.level] || "/";
        } catch (error) {
          console.error("Error loading user data:", error);
          // Still redirect even if loadUser fails
          window.location.href = routes[response.user.level] || "/";
        }

        return response.message;
      },
      error: (error) => {
        return error.data?.message;
      },
    });
  };

  useEffect(() => {
    if (user.level && isSignin) {
      window.location.href = routes[user.level];
    }
  }, [user, isSignin]);

  return (
    <div>
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>

      <div
        className="d-flex align-items-center justify-content-center flex-column gap-3"
        style={{ height: "100vh" }}
      >
        <img
          src="/logo.png"
          alt="logo"
          style={{ height: 120, width: 120, marginBottom: "1rem" }}
        />

        {role === "none" && (
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <div
              className="card bg-info text-white transition-card"
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("admin")}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2">
                <i
                  className="bi bi-person-badge-fill transition-icon"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="card-title mb-0">Admin</h5>
              </div>
            </div>

            <div
              className="card bg-info text-white transition-card"
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("teacher")}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2">
                <i
                  className="bi bi-person-workspace transition-icon"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="card-title mb-0">Guru</h5>
              </div>
            </div>

            <div
              className="card bg-info text-white transition-card"
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("student")}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2">
                <i
                  className="bi bi-mortarboard-fill transition-icon"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="card-title mb-0">Siswa</h5>
              </div>
            </div>

            <div
              className="card bg-info text-white transition-card"
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => handleRoleChange("parent")}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2">
                <i
                  className="bi bi-people-fill transition-icon"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="card-title mb-0">Wali Murid</h5>
              </div>
            </div>

            <div
              className="card bg-info text-white transition-card"
              style={{
                width: "150px",
                height: "150px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              onClick={handleSignup}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2">
                <i
                  className="bi bi-person-plus-fill transition-icon"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h5 className="card-title mb-0">Pendaftaran</h5>
              </div>
            </div>
          </div>
        )}

        {role !== "none" && !isSignup && (
          <form
            style={{ width: 300 }}
            className="d-flex flex-column gap-3"
            onSubmit={loginHandler}
          >
            <div className="input-group">
              <span className="input-group-text">
                <i
                  className={`bi ${
                    role === "student"
                      ? "bi-person-badge"
                      : role === "teacher"
                      ? "bi-person-workspace"
                      : "bi-envelope"
                  }`}
                ></i>
              </span>
              <input
                type={role === "admin" || role === "parent" ? "email" : "text"}
                placeholder={
                  role === "student"
                    ? "NIS"
                    : role === "teacher"
                    ? "USERNAME"
                    : "EMAIL"
                }
                value={accountValue}
                onChange={(e) => setAccountValue(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="flexCheckDefault"
                checked={showPassword}
                onChange={handlePasswordToggle}
              />
              <label
                className="form-check-label text-white"
                htmlFor="flexCheckDefault"
              >
                Tampilkan Password
              </label>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-danger d-flex align-items-center gap-2"
                onClick={() => setRole("none")}
              >
                <i className="bi bi-arrow-left"></i>
                Kembali
              </button>
              <button
                type="submit"
                className="btn btn-success d-flex align-items-center gap-2"
                disabled={isLoading || isLoadingUser}
              >
                {isLoading || isLoadingUser ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    <span role="status">Loading...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    Masuk
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {isSignup && <SignUp setRole={back} />}
      </div>
    </div>
  );
};

export default Index;
