import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsDataTable from "../components/CmsDataTable";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaLightbulb, FaEdit, FaTrash } from "react-icons/fa";

const ReasonsPage = () => {
  const [reasons, setReasons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedReason, setSelectedReason] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReasons([
        {
          id: 1,
          title: "Quality Education",
          description:
            "We provide high-quality education with experienced teachers.",
          icon: "education",
          order: 1,
        },
        {
          id: 2,
          title: "Islamic Values",
          description:
            "Our curriculum is based on Islamic values and principles.",
          icon: "mosque",
          order: 2,
        },
        {
          id: 3,
          title: "Modern Facilities",
          description:
            "State-of-the-art facilities for better learning experience.",
          icon: "building",
          order: 3,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Order",
      accessor: "order",
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setModalType("add");
    setSelectedReason(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reason) => {
    setModalType("edit");
    setSelectedReason(reason);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this reason?")) {
      // In a real app, you would call an API here
      setReasons(reasons.filter((reason) => reason.id !== id));
    }
  };

  const handleSubmit = (formData) => {
    if (modalType === "add") {
      // In a real app, you would call an API here
      const newReason = {
        id: reasons.length + 1,
        ...formData,
      };
      setReasons([...reasons, newReason]);
    } else {
      // In a real app, you would call an API here
      setReasons(
        reasons.map((reason) =>
          reason.id === selectedReason.id ? { ...reason, ...formData } : reason
        )
      );
    }
    setIsModalOpen(false);
  };

  const formFields = [
    {
      name: "title",
      label: "Title",
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
      name: "icon",
      label: "Icon",
      type: "text",
      required: true,
    },
    {
      name: "order",
      label: "Order",
      type: "number",
      required: true,
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <FaLightbulb className="text-primary fs-4" />
              </div>
              <h4 className="mb-0">Reasons</h4>
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add New Reason
            </button>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <CmsDataTable
                columns={columns}
                data={reasons}
                isLoading={isLoading}
                noDataMessage="No reasons found"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <CmsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "add" ? "Add New Reason" : "Edit Reason"}
      >
        <CmsForm
          fields={formFields}
          initialValues={selectedReason}
          onSubmit={handleSubmit}
          submitButtonText={
            modalType === "add" ? "Add Reason" : "Update Reason"
          }
        />
      </CmsModal>
    </Layout>
  );
};

export default ReasonsPage;
