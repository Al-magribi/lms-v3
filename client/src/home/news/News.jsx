import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useGetNewsQuery } from "../../controller/api/cms/ApiNews";

const News = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useGetNewsQuery({ page, limit, search });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReadMore = (id) => {
    navigate(`/berita/${id}`);
  };

  if (isLoading) {
    return (
      <Fragment>
        <Header />
        <main className="container py-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </main>
        <Footer />
      </Fragment>
    );
  }

  if (isError) {
    return (
      <Fragment>
        <Header />
        <main className="container py-5">
          <div className="alert alert-danger" role="alert">
            Error loading news. Please try again later.
          </div>
        </main>
        <Footer />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Header />
      <main className="container py-5">
        <h1 className="mb-4">Latest News</h1>

        <div className="row row-cols-1 row-cols-md-2 g-4">
          {data?.result?.map((news) => (
            <div key={news.id} className="col">
              <div className="card h-100">
                <img
                  src={news.image}
                  className="card-img-top"
                  alt={news.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <span className="badge bg-primary mb-2">
                    {news.category_name}
                  </span>
                  <h5 className="card-title">{news.title}</h5>
                  <p className="card-text text-muted">
                    {formatDate(news.createdat)}
                  </p>
                  <button
                    className="btn btn-outline-primary mt-3"
                    onClick={() => handleReadMore(news.id)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <nav className="mt-5">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
            </li>
            {[...Array(data?.totalPage)].map((_, index) => (
              <li
                key={index + 1}
                className={`page-item ${page === index + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                page === data?.totalPage ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setPage(page + 1)}
                disabled={page === data?.totalPage}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </main>
      <Footer />
    </Fragment>
  );
};

export default News;
