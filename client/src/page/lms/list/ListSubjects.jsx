import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetSubjectsOnClassQuery } from "../../../controller/api/lms/ApiLms";
import { useNavigate } from "react-router-dom";

const ListSubjects = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Use debounced search term for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useGetSubjectsOnClassQuery(
    { classid: user?.class_id, search: debouncedSearchTerm },
    { skip: !user?.class_id }
  );

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/pelajaran/${formattedName}/${id}`);
  };

  return (
    <div className='d-flex flex-column gap-3'>
      <div className='input-group w-25'>
        <span className='input-group-text bg-secondary text-white'>
          <i className='bi bi-search'></i>
        </span>
        <input
          type='text'
          className='form-control'
          placeholder='Cari mata pelajaran...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='row g-2'>
        {isLoading ? (
          <div className='col-12'>
            <p className='m-0 h5 text-muted'>Memuat data...</p>
          </div>
        ) : data?.length > 0 ? (
          data.map((item) => (
            <div key={item.id} className='col-lg-2 col-md-4 col-6'>
              <div
                className='card shadow pointer'
                onClick={() => goToLink(item.name, item.id)}
              >
                <div className='card-header h5 bg-primary text-white'>
                  {item.name}
                </div>
                <div className='card-body'>
                  <img
                    src={
                      item.cover
                        ? `${window.location.origin}${item.cover}`
                        : `/logo.png`
                    }
                    alt={item.name}
                    className='w-100 object-fit-contain'
                    style={{ height: 220 }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='col-12'>
            <p className='m-0 h5 text-muted'>
              {searchTerm
                ? "Tidak ada mata pelajaran yang sesuai dengan pencarian"
                : "Data belum tersedia"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListSubjects;
