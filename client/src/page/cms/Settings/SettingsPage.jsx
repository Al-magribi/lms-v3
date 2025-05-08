import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaCog, FaSave, FaRegLightbulb } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  useGetHomepageQuery,
  useUpdateHomepageMutation,
} from "../../../controller/api/cms/ApiHomepage";

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#0d6efd");
  const [secondaryColor, setSecondaryColor] = useState("#cfe2ff");

  // Bootstrap base colors with their variations
  const baseColors = [
    { name: "Blue", value: "#0d6efd", light: "#cfe2ff" },
    { name: "Indigo", value: "#6610f2", light: "#e0cffc" },
    { name: "Purple", value: "#6f42c1", light: "#e2d9f3" },
    { name: "Pink", value: "#d63384", light: "#f7d6e6" },
    { name: "Red", value: "#dc3545", light: "#f8d7da" },
    { name: "Orange", value: "#fd7e14", light: "#ffe5d0" },
    { name: "Yellow", value: "#ffc107", light: "#fff3cd" },
    { name: "Green", value: "#198754", light: "#d1e7dd" },
    { name: "Teal", value: "#20c997", light: "#d2f4ea" },
    { name: "Cyan", value: "#0dcaf0", light: "#cff4fc" },
  ];

  // Function to generate a lighter shade of a color
  const generateLightColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Mix with white (255, 255, 255) with 85% white
    const mixRatio = 0.85;
    const lightR = Math.round(r * (1 - mixRatio) + 255 * mixRatio);
    const lightG = Math.round(g * (1 - mixRatio) + 255 * mixRatio);
    const lightB = Math.round(b * (1 - mixRatio) + 255 * mixRatio);

    // Convert back to hex
    return `#${lightR.toString(16).padStart(2, "0")}${lightG
      .toString(16)
      .padStart(2, "0")}${lightB.toString(16).padStart(2, "0")}`;
  };

  const {
    data,
    isLoading: getLoading,
    refetch,
    error: getError,
  } = useGetHomepageQuery();

  const [
    updateHomepage,
    { isLoading: updateLoading, isSuccess, isError, error, reset, data: msg },
  ] = useUpdateHomepageMutation();

  useEffect(() => {
    if (data) {
      setSettings(data);
      setLogoPreview(data.logo);
      setPrimaryColor(data.primary_color || "#0d6efd");
      setSecondaryColor(data.secondary_color || "#cfe2ff");
      setIsLoading(false);
    }
  }, [data]);

  const handleSubmit = async (formData) => {
    try {
      const formDataToSend = new FormData();

      // Create a complete data object including the colors
      const completeData = {
        ...formData,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      };

      // Append all fields except logo
      Object.keys(completeData).forEach((key) => {
        if (key !== "logo") {
          formDataToSend.append(key, completeData[key]);
        }
      });

      // Append logo if it exists
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      } else if (data?.logo) {
        formDataToSend.append("logo", data.logo);
      }

      toast.promise(
        updateHomepage(formDataToSend)
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Menyimpan pengaturan...",
          success: (message) => message,
          error: (err) => err?.data?.message || "Gagal menyimpan pengaturan",
        }
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Terjadi kesalahan saat menyimpan pengaturan");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleColorChange = async (color) => {
    const lightColor = generateLightColor(color);

    // Langsung update ke backend
    if (settings) {
      try {
        const formDataToSend = new FormData();
        // Gabungkan data settings lama dengan warna baru
        Object.entries({
          ...settings,
          primary_color: color,
          secondary_color: lightColor,
        }).forEach(([key, value]) => {
          if (key !== "logo") {
            formDataToSend.append(key, value);
          }
        });
        // Logo (jika ada)
        if (logoFile) {
          formDataToSend.append("logo", logoFile);
        } else if (settings.logo) {
          formDataToSend.append("logo", settings.logo);
        }
        // Panggil updateHomepage
        await updateHomepage(formDataToSend).unwrap();
        toast.success("Warna berhasil diperbarui!");
      } catch (error) {
        toast.error("Gagal memperbarui warna");
      }
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      refetch();
      window.location.reload();
      // Reset logo file state after successful update
      setLogoFile(null);
    }
    if (isError) {
      reset();
    }
  }, [isSuccess, isError, msg, error, refetch, reset]);

  const formFields = [
    {
      name: "name",
      label: "Site Name",
      type: "text",
      required: true,
    },
    {
      name: "tagline",
      label: "Tagline",
      type: "text",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    {
      name: "video_url",
      label: "Video URL",
      type: "text",
    },
    {
      name: "youtube",
      label: "YouTube",
      type: "text",
    },
    {
      name: "instagram",
      label: "Instagram",
      type: "text",
    },
    {
      name: "facebook",
      label: "Facebook",
      type: "text",
    },
    {
      name: "ppdb_url",
      label: "PPDB URL",
      type: "text",
    },
    {
      name: "address",
      label: "Alamat",
      type: "text",
    },
    {
      name: "title_reason",
      label: "Judul Alasan",
      type: "text",
    },
    {
      name: "desc_reason",
      label: "Deskripsi Alasan",
      type: "textarea",
    },
    {
      name: "title_facility",
      label: "Judul Fasilitas",
      type: "text",
    },
    {
      name: "desc_facility",
      label: "Deskripsi Fasilitas",
      type: "textarea",
    },
  ];

  return (
    <Layout title='Pengaturan' levels={["cms"]}>
      <div className='container-fluid py-3 py-md-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className='d-flex align-items-center mb-4'>
            <div
              style={{
                backgroundColor: data?.secondary_color,
                color: data?.primary_color,
              }}
              className=' p-3 rounded me-3'>
              <FaCog className='fs-4' />
            </div>
            <h4 className='mb-0'>Pengaturan</h4>
          </div>

          <div className='card border-0 shadow-sm'>
            <div className='card-body'>
              {isLoading || getLoading || updateLoading ? (
                <div className='text-center py-5'>
                  <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                  <p className='mt-2'>Loading settings...</p>
                </div>
              ) : (
                <>
                  <div className='mb-4'>
                    <label className='form-label'>Logo</label>
                    <div className='d-flex align-items-center gap-3'>
                      <input
                        type='file'
                        className='form-control'
                        accept='image/*'
                        onChange={handleLogoChange}
                      />
                      {logoPreview && (
                        <img
                          src={logoPreview}
                          alt='Logo preview'
                          style={{ maxHeight: "100px", objectFit: "contain" }}
                          className='border rounded p-2'
                        />
                      )}
                    </div>
                  </div>
                  <CmsForm
                    fields={formFields}
                    initialValues={settings}
                    onSubmit={handleSubmit}
                    submitButtonText='Simpan'
                    submitButtonIcon={<FaSave className='me-2' />}
                  />
                </>
              )}

              <div className='mt-4'>
                <h4>Pengaturan Warna</h4>
                <div className='mt-4'>
                  <div className='d-flex align-items-center justify-content-between mb-3'>
                    <label className='form-label mb-0'>Primary Color</label>
                    <div className='d-flex align-items-center gap-2'>
                      <div
                        className='rounded-circle'
                        style={{
                          backgroundColor: secondaryColor,
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid #dee2e6",
                        }}>
                        <FaRegLightbulb
                          style={{ color: primaryColor }}
                          className='fs-4'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='d-flex flex-wrap gap-2'>
                    {baseColors.map((color) => (
                      <div
                        key={color.name}
                        className='rounded-circle'
                        style={{
                          backgroundColor: color.value,
                          width: "30px",
                          height: "30px",
                          border: "2px solid #dee2e6",
                          cursor: "pointer",
                        }}
                        onClick={() => handleColorChange(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>

                  <div className='mt-3'>
                    <input
                      type='color'
                      className='form-control form-control-color'
                      value={primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      title='Choose your color'
                    />
                  </div>

                  <div className='mt-3'>
                    <small className='text-muted'>
                      Selected Colors:
                      <div className='d-flex gap-2 mt-1'>
                        <div className='d-flex align-items-center'>
                          <div
                            className='rounded-circle me-1'
                            style={{
                              backgroundColor: primaryColor,
                              width: "20px",
                              height: "20px",
                              border: "1px solid #dee2e6",
                            }}></div>
                          Primary: {primaryColor}
                        </div>
                        <div className='d-flex align-items-center'>
                          <div
                            className='rounded-circle me-1'
                            style={{
                              backgroundColor: secondaryColor,
                              width: "20px",
                              height: "20px",
                              border: "1px solid #dee2e6",
                            }}></div>
                          Secondary: {secondaryColor}
                        </div>
                      </div>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
