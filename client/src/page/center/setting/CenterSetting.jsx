import React from "react";
import Layout from "../../../components/layout/Layout";
import AppSetting from "./AppSetting";
import SmtpSetting from "./SmtpSetting";
import Profile from "./Profile";
import { motion } from "framer-motion";
import "./CenterSetting.css";
import { useGetAppDataQuery } from "../../../controller/api/center/ApiApp";
import Loading from "../../../components/loader/Loading";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const CenterSetting = () => {
  const { data, isLoading } = useGetAppDataQuery();

  const { admin, app } = data || {};

  if (isLoading) {
    return (
      <Loading title={"Pengaturan Aplikasi"} levels={["center", "admin"]} />
    );
  }

  return (
    <Layout title={"Pengaturan Aplikasi"} levels={["center"]}>
      <motion.div
        className="row g-4 p-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="col-lg-6 col-12" variants={itemVariants}>
          <div className="card h-100 shadow-sm rounded-3 hover-shadow">
            <AppSetting app={app} />
          </div>
        </motion.div>

        <motion.div className="col-lg-6 col-12" variants={itemVariants}>
          <div className="card h-100 shadow-sm rounded-3 hover-shadow">
            <SmtpSetting app={app} />
          </div>
        </motion.div>

        <motion.div className="col-lg-6 col-12" variants={itemVariants}>
          <div className="card h-100 shadow-sm rounded-3 hover-shadow">
            <Profile admin={admin} />
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default CenterSetting;
