import React from "react";
import { useGetTestimoniesQuery } from "../../controller/api/cms/ApiTestimoni";

const Testimonials = () => {
  const { data, isLoading } = useGetTestimoniesQuery({
    page: "",
    limit: "",
    search: "",
  });

  const testimonials = data?.results || [];

  return (
    <section className="bg-white py-5">
      <div className="container position-relative">
        <h2 className="text-center mb-5">Testimoni</h2>
        <div
          id="testimonialCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card border shadow">
                      <div className="card-body p-4">
                        <div className="text-center mb-4">
                          <i className="fas fa-quote-left fa-2x text-primary"></i>
                        </div>
                        <p className="card-text text-center mb-4">
                          {testimonial.testimonial}
                        </p>
                        <div className="text-center">
                          <h5 className="card-title mb-1">
                            {testimonial.name}
                          </h5>
                          <p className="text-muted mb-0">
                            {testimonial.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#testimonialCarousel"
            data-bs-slide="prev"
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              top: "50%",
              transform: "translateY(-50%)",
              left: "-50px",
            }}
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#testimonialCarousel"
            data-bs-slide="next"
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              top: "50%",
              transform: "translateY(-50%)",
              right: "-50px",
            }}
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
