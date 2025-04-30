import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsDataTable from "../components/CmsDataTable";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaBuilding, FaEdit, FaTrash } from "react-icons/fa";

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFacilities([
        {
          id: 1,
          name: "Library",
          description:
            "A well-stocked library with academic and Islamic books.",
          image: "library.jpg",
          capacity: 100,
        },
        {
          id: 2,
          name: "Prayer Room",
          description:
            "Spacious prayer room for daily prayers and religious activities.",
          image: "prayer.jpg",
          capacity: 200,
        },
        {
          id: 3,
          name: "Computer Lab",
          description:
            "Modern computer lab with internet access for research and learning.",
          image: "computer.jpg",
          capacity: 30,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Capacity",
      accessor: "capacity",
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
    setSelectedFacility(null);
    setIsModalOpen(true);
  };

  const handleEdit = (facility) => {
    setModalType("edit");
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this facility?")) {
      // In a real app, you would call an API here
      setFacilities(facilities.filter((facility) => facility.id !== id));
    }
  };

  const handleSubmit = (formData) => {
    if (modalType === "add") {
      // In a real app, you would call an API here
      const newFacility = {
        id: facilities.length + 1,
        ...formData,
      };
      setFacilities([...facilities, newFacility]);
    } else {
      // In a real app, you would call an API here
      setFacilities(
        facilities.map((facility) =>
          facility.id === selectedFacility.id
            ? { ...facility, ...formData }
            : facility
        )
      );
    }
    setIsModalOpen(false);
  };

  const formFields = [
    {
      name: "name",
      label: "Name",
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
      name: "image",
      label: "Image URL",
      type: "text",
      required: true,
    },
    {
      name: "capacity",
      label: "Capacity",
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
                <FaBuilding className="text-primary fs-4" />
              </div>
              <h4 className="mb-0">Facilities</h4>
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add New Facility
            </button>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <CmsDataTable
                columns={columns}
                data={facilities}
                isLoading={isLoading}
                noDataMessage="No facilities found"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <CmsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "add" ? "Add New Facility" : "Edit Facility"}
      >
        <CmsForm
          fields={formFields}
          initialValues={selectedFacility}
          onSubmit={handleSubmit}
          submitButtonText={
            modalType === "add" ? "Add Facility" : "Update Facility"
          }
        />
      </CmsModal>
    </Layout>
  );
};

export default FacilitiesPage;
