import React, { useState } from "react";
import Layout from "../layout/Layout";
import { motion } from "framer-motion";
import {
  FaNewspaper,
  FaTags,
  FaBuilding,
  FaComments,
  FaChartLine,
  FaEye,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const CmsDash = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const statsData = [
    {
      id: "total_visitors",
      title: "Total Visitors",
      value: "1,234",
      icon: <FaEye />,
      color: "primary",
      change: "+12%",
      period: "vs last month",
    },
    {
      id: "total_news",
      title: "Published News",
      value: "45",
      icon: <FaNewspaper />,
      color: "success",
      change: "+5",
      period: "this month",
    },
    {
      id: "total_facilities",
      title: "Facilities",
      value: "12",
      icon: <FaBuilding />,
      color: "info",
      change: "2",
      period: "new added",
    },
    {
      id: "total_testimonials",
      title: "Testimonials",
      value: "89",
      icon: <FaComments />,
      color: "warning",
      change: "+8",
      period: "this month",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New news article published",
      title: "School Achievement in National Competition",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "New testimonial added",
      title: "Parent Feedback - Sarah Johnson",
      time: "5 hours ago",
    },
    {
      id: 3,
      action: "Facility information updated",
      title: "Science Laboratory Equipment",
      time: "1 day ago",
    },
    {
      id: 4,
      action: "New category created",
      title: "Academic Excellence",
      time: "1 day ago",
    },
  ];

  return (
    <Layout>
      <div className="container-fluid py-3 py-md-4">
        <motion.div
          className="row g-3 g-md-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Stats Cards */}
          {statsData.map((stat) => (
            <motion.div
              key={stat.id}
              className="col-12 col-sm-6 col-lg-3"
              variants={itemVariants}
            >
              <div
                className={`card border-0 shadow-sm h-100 bg-${stat.color} bg-opacity-10`}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-title text-muted mb-1">
                        {stat.title}
                      </h6>
                      <h2 className="mb-1 fs-3">{stat.value}</h2>
                      <div className="small text-success">
                        {stat.change} {stat.period}
                      </div>
                    </div>
                    <div className={`display-6 text-${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Recent Activities */}
          <motion.div className="col-12 col-lg-8" variants={itemVariants}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Recent Activities</h5>
                  <Link
                    to="/cms/news"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View All
                  </Link>
                </div>
                <div className="timeline">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="timeline-item mb-3 pb-3 border-bottom"
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="text-muted small mb-1">
                            {activity.action}
                          </div>
                          <div className="fw-medium">{activity.title}</div>
                        </div>
                        <div className="text-muted small">
                          <FaClock className="me-1" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div className="col-12 col-lg-4" variants={itemVariants}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title mb-4">Website Analytics</h5>
                <div className="d-flex align-items-center mb-3">
                  <div className="flex-shrink-0">
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <FaChartLine className="text-primary fs-4" />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="text-muted small">Page Views</div>
                    <div className="fs-5 fw-medium">5,678</div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="flex-shrink-0">
                    <div className="bg-success bg-opacity-10 p-3 rounded">
                      <FaUsers className="text-success fs-4" />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="text-muted small">Unique Visitors</div>
                    <div className="fs-5 fw-medium">3,456</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CmsDash;
