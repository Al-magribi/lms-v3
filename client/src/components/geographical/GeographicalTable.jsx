import React from "react";

const GeographicalTable = ({ data, level }) => {
  const totalStudents =
    data?.reduce((sum, item) => sum + item.student_count, 0) || 0;

  const calculatePercentage = (value) => {
    return ((value / totalStudents) * 100).toFixed(1);
  };

  return (
    <div className='table-responsive'>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>
              {level === "province"
                ? "Provinsi"
                : level === "city"
                ? "Kota"
                : level === "district"
                ? "Kecamatan"
                : "Desa"}
            </th>
            {level !== "province" && <th>Provinsi</th>}
            {level === "district" && <th>Kota</th>}
            {level === "village" && <th>Kecamatan</th>}
            <th>Jumlah</th>
            <th>Persentase</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td>{item[`${level}_name`]}</td>
              {level !== "province" && <td>{item.province_name}</td>}
              {level === "district" && <td>{item.city_name}</td>}
              {level === "village" && <td>{item.district_name}</td>}
              <td>{item.student_count}</td>
              <td>{calculatePercentage(item.student_count)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeographicalTable;
