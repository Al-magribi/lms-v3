import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { useUpdateParentProfileMutation } from "../../../controller/api/auth/ApiAuth";
import { updateUserProfile } from "../../../controller/slice/AuthSlice";
import Layout from "../../../components/layout/Layout";

const ParentProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [updateParentProfile] = useUpdateParentProfileMutation();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate password confirmation
      if (
        formData.newPassword &&
        formData.newPassword !== formData.confirmPassword
      ) {
        setMessage({ type: "error", text: "Konfirmasi password tidak cocok" });
        setIsLoading(false);
        return;
      }

      // Prepare request body
      const requestBody = {
        name: formData.name,
        email: formData.email,
      };

      // Add password fields if new password is provided
      if (formData.newPassword) {
        requestBody.oldPassword = formData.oldPassword;
        requestBody.newPassword = formData.newPassword;
      }

      const response = await updateParentProfile(requestBody).unwrap();

      setMessage({ type: "success", text: response.message });

      // Update user state in Redux store
      dispatch(
        updateUserProfile({
          name: formData.name,
          email: formData.email,
        })
      );

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.data?.message || "Terjadi kesalahan saat memperbarui profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={"Profile Orang Tua"} levels={["parent"]}>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-12'>
            <div className='card shadow-sm'>
              <div className='card-header bg-primary text-white'>
                <h4 className='mb-0'>
                  <i className='fas fa-user-edit me-2'></i>
                  Profile Orang Tua
                </h4>
              </div>
              <div className='card-body'>
                {message.text && (
                  <div
                    className={`alert alert-${
                      message.type === "error" ? "danger" : "success"
                    } alert-dismissible fade show`}
                    role='alert'
                  >
                    {message.text}
                    <button
                      type='button'
                      className='btn-close'
                      onClick={() => setMessage({ type: "", text: "" })}
                    ></button>
                  </div>
                )}

                <div className='row'>
                  {/* Profile Information */}
                  <div className='col-md-6'>
                    <div className='card border-0 bg-light'>
                      <div className='card-header bg-info text-white'>
                        <h5 className='mb-0'>
                          <i className='fas fa-info-circle me-2'></i>
                          Informasi Profil
                        </h5>
                      </div>
                      <div className='card-body'>
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>
                            Nama Lengkap:
                          </label>
                          <p className='form-control-plaintext'>
                            {user?.name || "-"}
                          </p>
                        </div>
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>Email:</label>
                          <p className='form-control-plaintext'>
                            {user?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className='col-md-6'>
                    <div className='card border-0 bg-light'>
                      <div className='card-header bg-success text-white'>
                        <h5 className='mb-0'>
                          <i className='fas fa-graduation-cap me-2'></i>
                          Informasi Siswa
                        </h5>
                      </div>
                      <div className='card-body'>
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>
                            Nama Siswa:
                          </label>
                          <p className='form-control-plaintext'>
                            {user?.student || "-"}
                          </p>
                        </div>
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>NIS:</label>
                          <p className='form-control-plaintext'>
                            {user?.nis || "-"}
                          </p>
                        </div>
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>Kelas:</label>
                          <p className='form-control-plaintext'>
                            {user?.class || "-"}
                          </p>
                        </div>
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>Jurusan:</label>
                          <p className='form-control-plaintext'>
                            {user?.major || "-"}
                          </p>
                        </div>
                        <div className='mb-3'>
                          <label className='form-label fw-bold'>
                            Homebase:
                          </label>
                          <p className='form-control-plaintext'>
                            {user?.homebase || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Profile Form */}
                <div className='row mt-4'>
                  <div className='col-12'>
                    <div className='card border-0'>
                      <div className='card-header bg-warning text-dark'>
                        <h5 className='mb-0'>
                          <i className='fas fa-edit me-2'></i>
                          Update Profil
                        </h5>
                      </div>
                      <div className='card-body'>
                        <form onSubmit={handleSubmit}>
                          <div className='row'>
                            <div className='col-md-4'>
                              <div className='mb-3'>
                                <label
                                  htmlFor='name'
                                  className='form-label fw-bold'
                                >
                                  Nama Lengkap{" "}
                                  <span className='text-danger'>*</span>
                                </label>
                                <input
                                  type='text'
                                  className='form-control'
                                  id='name'
                                  name='name'
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            <div className='col-md-4'>
                              <div className='mb-3'>
                                <label
                                  htmlFor='email'
                                  className='form-label fw-bold'
                                >
                                  Email <span className='text-danger'>*</span>
                                </label>
                                <input
                                  type='email'
                                  className='form-control'
                                  id='email'
                                  name='email'
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <hr className='my-4' />

                          <div className='row'>
                            <div className='col-12'>
                              <h6 className='text-muted mb-3'>
                                <i className='fas fa-lock me-2'></i>
                                Ubah Password (Opsional)
                              </h6>
                            </div>
                            <div className='col-md-4'>
                              <div className='mb-3'>
                                <label
                                  htmlFor='oldPassword'
                                  className='form-label'
                                >
                                  Password Lama
                                </label>
                                <input
                                  type='password'
                                  className='form-control'
                                  id='oldPassword'
                                  name='oldPassword'
                                  value={formData.oldPassword}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            <div className='col-md-4'>
                              <div className='mb-3'>
                                <label
                                  htmlFor='newPassword'
                                  className='form-label'
                                >
                                  Password Baru
                                </label>
                                <input
                                  type='password'
                                  className='form-control'
                                  id='newPassword'
                                  name='newPassword'
                                  value={formData.newPassword}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            <div className='col-md-4'>
                              <div className='mb-3'>
                                <label
                                  htmlFor='confirmPassword'
                                  className='form-label'
                                >
                                  Konfirmasi Password Baru
                                </label>
                                <input
                                  type='password'
                                  className='form-control'
                                  id='confirmPassword'
                                  name='confirmPassword'
                                  value={formData.confirmPassword}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className='d-flex justify-content-end'>
                            <button
                              type='submit'
                              className='btn btn-primary'
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <span
                                    className='spinner-border spinner-border-sm me-2'
                                    role='status'
                                    aria-hidden='true'
                                  ></span>
                                  Menyimpan...
                                </>
                              ) : (
                                <>
                                  <i className='fas fa-save me-2'></i>
                                  Simpan Perubahan
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
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

export default ParentProfile;
