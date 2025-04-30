import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaCog, FaSave } from "react-icons/fa";
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

  const { data, isLoading: getLoading, refetch } = useGetHomepageQuery();

  const [
    updateHomepage,
    { isLoading: updateLoading, isSuccess, isError, error, reset, data: msg },
  ] = useUpdateHomepageMutation();

  useEffect(() => {
    if (data) {
      setSettings(data);
      setLogoPreview(data.logo);
      setIsLoading(false);
    }
  }, [data]);

  const handleSubmit = async (formData) => {
    try {
      const formDataToSend = new FormData();

      // Append all text fields
      Object.keys(formData).forEach((key) => {
        if (key !== "logo") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append logo if it exists
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      } else if (data?.logo) {
        formDataToSend.append("logo", data.logo);
      }

      await updateHomepage(formDataToSend).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg.message);
      reset();
      refetch();
    }
    if (isError) {
      toast.error(error.data.message);
      reset();
    }
  }, [isSuccess, isError, msg, error, refetch]);

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
  ];

  return (
    <Layout>
      <div className="container-fluid py-3 py-md-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex align-items-center mb-4">
            <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
              <FaCog className="text-primary fs-4" />
            </div>
            <h4 className="mb-0">Settings</h4>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {isLoading || getLoading || updateLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading settings...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="form-label">Logo</label>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      {logoPreview && (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          style={{ maxHeight: "100px", objectFit: "contain" }}
                          className="border rounded p-2"
                        />
                      )}
                    </div>
                  </div>
                  <CmsForm
                    fields={formFields}
                    initialValues={settings}
                    onSubmit={handleSubmit}
                    submitButtonText="Save Settings"
                    submitButtonIcon={<FaSave className="me-2" />}
                  />
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
