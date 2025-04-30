import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import CmsDataTable from "../components/CmsDataTable";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";
import { motion } from "framer-motion";
import { FaComments, FaEdit, FaTrash } from "react-icons/fa";

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTestimonials([
        {
          id: 1,
          name: "Ahmad Rahman",
          role: "Parent",
          content:
            "My children have shown remarkable improvement since joining this school. The Islamic values and academic excellence are perfectly balanced.",
          image: "ahmad.jpg",
          rating: 5,
        },
        {
          id: 2,
          name: "Fatima Zahra",
          role: "Student",
          content:
            "I love the learning environment here. The teachers are supportive and the facilities are excellent. I've grown both academically and spiritually.",
          image: "fatima.jpg",
          rating: 5,
        },
        {
          id: 3,
          name: "Umar Hassan",
          role: "Parent",
          content:
            "The school's commitment to Islamic education while maintaining high academic standards is impressive. My son has developed a strong moral compass.",
          image: "umar.jpg",
          rating: 4,
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
      header: "Role",
      accessor: "role",
    },
    {
      header: "Content",
      accessor: "content",
    },
    {
      header: "Rating",
      accessor: "rating",
      cell: (row) => (
        <div className="d-flex">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`me-1 ${
                i < row.rating ? "text-warning" : "text-muted"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      ),
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
    setSelectedTestimonial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial) => {
    setModalType("edit");
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      // In a real app, you would call an API here
      setTestimonials(
        testimonials.filter((testimonial) => testimonial.id !== id)
      );
    }
  };

  const handleSubmit = (formData) => {
    if (modalType === "add") {
      // In a real app, you would call an API here
      const newTestimonial = {
        id: testimonials.length + 1,
        ...formData,
      };
      setTestimonials([...testimonials, newTestimonial]);
    } else {
      // In a real app, you would call an API here
      setTestimonials(
        testimonials.map((testimonial) =>
          testimonial.id === selectedTestimonial.id
            ? { ...testimonial, ...formData }
            : testimonial
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
      name: "role",
      label: "Role",
      type: "text",
      required: true,
    },
    {
      name: "content",
      label: "Content",
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
      name: "rating",
      label: "Rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
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
                <FaComments className="text-primary fs-4" />
              </div>
              <h4 className="mb-0">Testimonials</h4>
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add New Testimonial
            </button>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <CmsDataTable
                columns={columns}
                data={testimonials}
                isLoading={isLoading}
                noDataMessage="No testimonials found"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <CmsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "add" ? "Add New Testimonial" : "Edit Testimonial"}
      >
        <CmsForm
          fields={formFields}
          initialValues={selectedTestimonial}
          onSubmit={handleSubmit}
          submitButtonText={
            modalType === "add" ? "Add Testimonial" : "Update Testimonial"
          }
        />
      </CmsModal>
    </Layout>
  );
};

export default TestimonialsPage;
