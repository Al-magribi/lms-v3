import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { useParams } from "react-router-dom";
import Biodata from "./Biodata";
import Parent from "./Parent";
import Family from "./Family";

const DbPage = () => {
  const { name, nis, periode } = useParams();

  const [activeTab, setActiveTab] = useState("biodata");

  const handleTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Layout
      title={`Database ${name.replace(/-/g, " ")}`}
      levels={["admin", "teacher", "student", "parent"]}
    >
      <div className="d-flex justify-content-center">
        <div className="btn-group">
          <button
            className={`btn btn-sm  ${
              activeTab === "biodata" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handleTab("biodata")}
          >
            <i className="bi bi-person"></i> Biodata
          </button>

          <button
            className={`btn btn-sm  ${
              activeTab === "parent" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handleTab("parent")}
          >
            <i className="bi bi-people"></i> Orang Tua
          </button>

          <button
            className={`btn btn-sm  ${
              activeTab === "family" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handleTab("family")}
          >
            <i className="bi bi-person-lines-fill"></i> Keluarga
          </button>
        </div>
      </div>

      {activeTab === "biodata" && <Biodata />}
      {activeTab === "parent" && <Parent />}
      {activeTab === "family" && <Family />}
    </Layout>
  );
};

export default DbPage;
