import { useEffect, useState } from "react";
import "./Index.css";
import { useGetAppQuery } from "../../controller/api/center/ApiApp";
import Meta from "../meta/Meta";
import { useSignupMutation } from "../../controller/api/auth/ApiAuth";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  const { data: app } = useGetAppQuery();

  const [showPassword, setShowPassword] = useState(false);
  const [nis, setNis] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [signup, { isLoading, isSuccess, isError, error, data }] =
    useSignupMutation();

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = (e) => {
    e.preventDefault();

    const data = {
      nis: nis.trim(),
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    };

    signup(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
      setNis("");
      setName("");
      setEmail("");
      setPassword("");

      navigate("/signin");
    }
    if (isError) {
      toast.error(error.data.message);
    }
  }, [isSuccess, isError, error, data]);

  return (
    <div>
      <Meta title={"Pendaftaran Wali Murid"} />
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
          src={app?.logo ? app?.logo : "/logo.png"}
          alt="logo"
          style={{ height: 120, width: 120, marginBottom: "1rem" }}
          className="pointer"
          onClick={() => (window.location.href = "/")}
        />

        <form
          style={{ width: 300 }}
          className="d-flex flex-column gap-3"
          onSubmit={handleSignup}
        >
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-person-vcard"></i>
            </span>
            <input
              type="text"
              placeholder="NIS"
              className="form-control"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              placeholder="Nama"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-lock-fill"></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`form-control ${
                formErrors.password ? "is-invalid" : ""
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormErrors({ ...formErrors, password: "" });
              }}
              required
            />
            {formErrors.password && (
              <div className="invalid-feedback">{formErrors.password}</div>
            )}
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
              onClick={() => (window.location.href = "/signin")}
            >
              <i className="bi bi-arrow-left"></i>
              Kembali
            </button>

            <button
              type="submit"
              className="btn btn-success d-flex align-items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  ></span>
                  <span role="status">Loading...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-key"></i>
                  Daftar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
