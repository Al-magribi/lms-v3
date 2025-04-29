import React from "react";
import {
  MdScience,
  MdPark,
  MdRestaurant,
  MdHealthAndSafety,
  MdApartment,
  MdLanguage,
  MdComputer,
  MdLibraryBooks,
  MdSportsBasketball,
  MdPool,
} from "react-icons/md";

const Facilities = () => {
  const facilities = [
    { name: "Laboratorium IPA", icon: MdScience },
    { name: "Nuraida Green Project", icon: MdPark },
    { name: "Dapur Sehat", icon: MdRestaurant },
    { name: "Student Health Care", icon: MdHealthAndSafety },
    { name: "Asrama", icon: MdApartment },
    { name: "Laboratorium Bahasa", icon: MdLanguage },
    { name: "Laboratorium Komputer", icon: MdComputer },
    { name: "Perpustakaan", icon: MdLibraryBooks },
    { name: "Lapangan Basket", icon: MdSportsBasketball },
    { name: "Kolam Renang Indoor", icon: MdPool },
  ];

  return (
    <section id="fasilitas" className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5 fw-bold">Fasilitas Kami</h2>
        <div className="row row-cols-2  row-cols-lg-3 g-4">
          {facilities.map((facility, index) => (
            <div key={index} className="col">
              <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                <div className="card-body text-center p-4">
                  <div className="mb-3">
                    {React.createElement(facility.icon, {
                      size: 48,
                      className: "text-primary",
                    })}
                  </div>
                  <h5 className="card-title mb-0 fw-semibold">
                    {facility.name}
                  </h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
