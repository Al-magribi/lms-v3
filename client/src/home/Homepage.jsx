import React, { Fragment } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import "./home.css";
import AboutUs from "./components/AboutUs";
import Reason from "./components/Reason";
import Facilities from "./components/Facilities";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import Infographic from "./components/Infographic";
const Homepage = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <Fragment>
      <Header />
      <section className="hero-container">
        <div className="hero-section">
          <div className="hero-overlay"></div>
          <motion.div
            className="hero-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp}>
              Nuraida Islamic Boarding School
            </motion.h1>
            <motion.p variants={fadeInUp}>
              Membina Generasi Rabbani Berprestasi Menuju Ridha Illahi
            </motion.p>
            <motion.button
              className="btn"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Yuk, Daftar Sekarang!
            </motion.button>
          </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ amount: 0.3 }}
      >
        <AboutUs />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ amount: 0.3 }}
      >
        <Reason />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ amount: 0.3 }}
      >
        <Facilities />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        viewport={{ amount: 0.3 }}
      >
        <Infographic />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        viewport={{ amount: 0.3 }}
      >
        <Testimonials />
      </motion.div>

      <Footer />
    </Fragment>
  );
};

export default Homepage;
