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

  const { data, isLoading, isError, error } = useGetSubjectsOnClassQuery(
    { classid: user?.class_id, search: debouncedSearchTerm },
    { skip: !user?.class_id }
  );

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/pelajaran/${formattedName}/${id}`);
  };

  return (
    <div className='d-flex flex-column gap-2'>
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
                onClick={() => goToLink(item.name, item.id)}>
                <div className='card-header text-center bg-primary text-white'>
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
                    className='w-100 object-fit-contain overflow-hidden'
                    style={{ height: 220 }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='col-12'>
            <p className='m-0 h5 text-muted'>
              {searchTerm ? (
                <div className='alert alert-danger' role='alert'>
                  <h4 className='alert-heading'>Error!</h4>
                  <p>Mata pelajaran tidak ditemukan</p>
                  <hr />
                  {isError && (
                    <p className='mb-0'>Error details: {error?.message}</p>
                  )}
                </div>
              ) : (
                <div className='alert alert-danger' role='alert'>
                  <h4 className='alert-heading'>Error!</h4>
                  <p>Data belum tersedia</p>
                  <hr />
                  {isError && (
                    <p className='mb-0'>Error details: {error?.message}</p>
                  )}
                </div>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListSubjects;
