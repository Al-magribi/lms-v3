import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsDataTable from "../components/CmsDataTable";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaTags, FaEdit, FaTrash } from "react-icons/fa";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories([
        {
          id: 1,
          name: "Academic",
          description: "Academic achievements and programs",
          slug: "academic",
          count: 15,
        },
        {
          id: 2,
          name: "Islamic Studies",
          description: "Islamic education and religious activities",
          slug: "islamic-studies",
          count: 10,
        },
        {
          id: 3,
          name: "Events",
          description: "School events and activities",
          slug: "events",
          count: 8,
        },
        {
          id: 4,
          name: "Announcements",
          description: "Important announcements and updates",
          slug: "announcements",
          count: 12,
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
      header: "Slug",
      accessor: "slug",
    },
    {
      header: "Count",
      accessor: "count",
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
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setModalType("edit");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      // In a real app, you would call an API here
      setCategories(categories.filter((category) => category.id !== id));
    }
  };

  const handleSubmit = (formData) => {
    if (modalType === "add") {
      // In a real app, you would call an API here
      const newCategory = {
        id: categories.length + 1,
        ...formData,
        count: 0,
      };
      setCategories([...categories, newCategory]);
    } else {
      // In a real app, you would call an API here
      setCategories(
        categories.map((category) =>
          category.id === selectedCategory.id
            ? { ...category, ...formData }
            : category
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
      name: "slug",
      label: "Slug",
      type: "text",
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
                <FaTags className="text-primary fs-4" />
              </div>
              <h4 className="mb-0">Categories</h4>
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add New Category
            </button>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <CmsDataTable
                columns={columns}
                data={categories}
                isLoading={isLoading}
                noDataMessage="No categories found"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <CmsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "add" ? "Add New Category" : "Edit Category"}
      >
        <CmsForm
          fields={formFields}
          initialValues={selectedCategory}
          onSubmit={handleSubmit}
          submitButtonText={
            modalType === "add" ? "Add Category" : "Update Category"
          }
        />
      </CmsModal>
    </Layout>
  );
};

export default CategoriesPage;
