import React from "react";
import { useGetFilterQuery } from "../../../../controller/api/log/ApiLog";

const Filters = ({ classid, setClassid, examid, name, token }) => {
  const { data: classes } = useGetFilterQuery(
    { exam: examid },
    { skip: !examid }
  );

  return (
    <div className='p-1 rounded my-1 bg-white shadow d-flex justify-content-between align-items-center'>
      <div className='d-flex gap-2 align-items-center'>
        <p className='m-0 h5'>{name?.replace(/-/g, " ")}</p>
        <span className='badge bg-primary m-0'>{token}</span>
      </div>
      <div className='btn-group'>
        {classes?.map((item) => (
          <button
            key={item.id}
            className={`btn ${
              classid === item.id ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setClassid(item.id)}
          >
            {item.name}
          </button>
        ))}
        <button
          className='btn btn-outline-primary'
          onClick={() => setClassid("")}
        >
          <i className='bi bi-recycle'></i>
        </button>
      </div>
    </div>
  );
};

export default Filters;
