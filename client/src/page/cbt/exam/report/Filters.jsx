import React, { useState } from "react";
import { useGetFilterQuery } from "../../../../controller/api/log/ApiLog";

const Filters = ({
  classid,
  setClassid,
  examid,
  name,
  token,
  onRefetch,
  activeView,
  setActiveView,
  onExport,
}) => {
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const { data: classes, refetch: refetchClasses } = useGetFilterQuery(
    { exam: examid },
    { skip: !examid }
  );

  const handleRefetch = () => {
    setLastUpdateTime(new Date().toLocaleString());
    // Refetch all data
    refetchClasses();
    onRefetch();
  };

  return (
    <div className='d-flex flex-column'>
      <div className='p-2 rounded my-1 bg-white shadow d-flex justify-content-between align-items-center'>
        <div className='d-flex flex-column gap-1 align-items-start'>
          <div className='d-flex gap-2 align-items-center'>
            <p className='m-0 h5'>{name?.replace(/-/g, " ")}</p>
            <span className='badge bg-primary m-0'>{token}</span>
          </div>

          {lastUpdateTime && (
            <span className='badge bg-danger'>
              Terakhir diperbarui: {lastUpdateTime}
            </span>
          )}
        </div>

        <div className='btn-group'>
          <button
            className={`btn btn-sm ${
              activeView === "table" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setActiveView("table")}
          >
            <i className='bi bi-person-lines-fill'></i>
          </button>
          <button
            className={`btn btn-sm ${
              activeView === "chart" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setActiveView("chart")}
          >
            <i className='bi bi-bar-chart'></i>
          </button>
          <button
            className={`btn btn-sm ${
              activeView === "list" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setActiveView("list")}
          >
            <i className='bi bi-file-earmark-excel'></i>
          </button>

          {(activeView === "table" || activeView === "list") && (
            <button
              className='btn btn-sm btn-primary'
              onClick={onExport}
              title='Export to Excel'
            >
              <i className='bi bi-file-earmark-arrow-down'></i>
            </button>
          )}
        </div>

        <div className='btn-group'>
          {classes?.map((item) => (
            <button
              key={item.id}
              className={`btn btn-sm ${
                classid === item.id ? "btn-secondary" : "btn-outline-secondary"
              }`}
              onClick={() => setClassid(item.id)}
            >
              {item.name}
            </button>
          ))}
          <button
            className='btn btn-sm btn-dark'
            onClick={() => setClassid("")}
          >
            <i className='bi bi-recycle'></i>
          </button>

          <button className='btn btn-sm btn-danger' onClick={handleRefetch}>
            <i className='bi bi-repeat'></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
