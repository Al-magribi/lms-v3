import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaNewspaper, FaPlus } from "react-icons/fa";
import Layout from "../layout/Layout";
import CmsPageLayout from "../components/CmsPageLayout";
import CmsDataTable from "../components/CmsDataTable";
import CmsModal from "../components/CmsModal";
import CmsForm from "../components/CmsForm";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would be an API call
    setNews([
      {
        id: 1,
        title: "School Achieves Excellence Award",
        category_id: 1,
        description: "Our school has received an excellence award...",
        image: "https://via.placeholder.com/150",
        createdat: "2023-05-15",
      },
      {
        id: 2,
        title: "New Library Opening Ceremony",
        category_id: 2,
        description: "The new library will be opening next month...",
        image: "https://via.placeholder.com/150",
        createdat: "2023-05-10",
      },
      {
        id: 3,
        title: "Student Science Fair Winners",
        category_id: 1,
        description: "Congratulations to our science fair winners...",
        image: "https://via.placeholder.com/150",
        createdat: "2023-05-05",
      },
    ]);

    setCategories([
      { id: 1, name: "Achievements" },
      { id: 2, name: "Events" },
      { id: 3, name: "Announcements" },
    ]);
  }, []);

  useEffect(() => {
    setFilteredNews(news);
  }, [news]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredNews(news);
      return;
    }

    const filtered = news.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredNews(filtered);
  };

  const handleFilter = (categoryId) => {
    setActiveFilter(categoryId);

    if (categoryId === "all") {
      setFilteredNews(news);
    } else {
      const filtered = news.filter(
        (item) => item.category_id === parseInt(categoryId)
      );
      setFilteredNews(filtered);
    }
  };

  const handleAdd = () => {
    setSelectedNews(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedNews(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setNewsToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleView = (item) => {
    // In a real app, this would navigate to a detail page
    console.log("Viewing news item:", item);
  };

  const handleSave = (formData) => {
    if (selectedNews) {
      // Update existing news
      const updatedNews = news.map((item) =>
        item.id === selectedNews.id ? { ...item, ...formData } : item
      );
      setNews(updatedNews);
    } else {
      // Add new news
      const newNewsItem = {
        id: news.length + 1,
        ...formData,
        createdat: new Date().toISOString().split("T")[0],
      };
      setNews([...news, newNewsItem]);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (newsToDelete) {
      const updatedNews = news.filter((item) => item.id !== newsToDelete.id);
      setNews(updatedNews);
      setIsDeleteModalOpen(false);
      setNewsToDelete(null);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "image",
      label: "Image",
      render: (value) => (
        <img
          src={value}
          alt="News"
          className="img-thumbnail"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      ),
    },
    { key: "title", label: "Title" },
    {
      key: "category_id",
      label: "Category",
      render: (value) => {
        const category = categories.find((cat) => cat.id === value);
        return category ? category.name : "Unknown";
      },
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <div
          style={{
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </div>
      ),
    },
    { key: "createdat", label: "Created At" },
  ];

  const formFields = [
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "category_id",
      label: "Category",
      type: "select",
      required: true,
      options: categories.map((cat) => ({ value: cat.id, label: cat.name })),
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    {
      name: "image",
      label: "Image",
      type: "file",
      accept: "image/*",
      helpText: "Upload an image for the news article",
    },
  ];

  const filterOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <Layout>
      <CmsPageLayout
        title="News Management"
        onAdd={handleAdd}
        onSearch={handleSearch}
        searchPlaceholder="Search news..."
        showFilter={true}
        filterOptions={filterOptions}
        activeFilter={activeFilter}
        setActiveFilter={handleFilter}
      >
        <CmsDataTable
          columns={columns}
          data={filteredNews}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </CmsPageLayout>

      {/* Add/Edit Modal */}
      <CmsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedNews ? "Edit News" : "Add News"}
        size="lg"
      >
        <CmsForm
          fields={formFields}
          initialValues={selectedNews || {}}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </CmsModal>

      {/* Delete Confirmation Modal */}
      <CmsModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <motion.button
              className="btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              className="btn btn-danger"
              onClick={confirmDelete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Delete
            </motion.button>
          </>
        }
      >
        <p>Are you sure you want to delete "{newsToDelete?.title}"?</p>
        <p className="text-danger">This action cannot be undone.</p>
      </CmsModal>
    </Layout>
  );
};

export default NewsPage;
