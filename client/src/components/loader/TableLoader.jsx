import React from "react";

const TableLoader = () => {
  return (
    <div className="container py-5">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i}>
                  <span className="placeholder-glow w-75 d-block">
                    <span className="placeholder col-8"></span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {[...Array(5)].map((_, colIdx) => (
                  <td key={colIdx}>
                    <span className="placeholder-glow w-100 d-block">
                      <span className="placeholder col-10"></span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableLoader;
