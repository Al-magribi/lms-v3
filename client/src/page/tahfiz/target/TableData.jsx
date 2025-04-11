import React, { Fragment } from "react";
import { useGetTargetsQuery } from "../../../controller/api/tahfiz/ApiScoring";

const TableData = () => {
  const { data: targets } = useGetTargetsQuery();

  return (
    <div className='border shadow rounded p-2 table-responsive bg-white'>
      <table className='mb-0 table table-bordered table-hover'>
        <thead>
          <tr>
            <th className='text-center'>Tingkat</th>
            <th className='text-center'>Juz</th>
            <th className='text-center'>Ayat</th>
            <th className='text-center'>Baris</th>
            <th className='text-center'>Total Ayat</th>
            <th className='text-center'>Total Baris</th>
            <th className='text-center'>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {targets?.length > 0 ? (
            targets?.map((item, index) => (
              <Fragment key={index}>
                {item.target.map((targetItem, targetIndex) => (
                  <tr key={targetIndex}>
                    {targetIndex === 0 && (
                      <th
                        rowSpan={item.target.length}
                        className='text-center align-middle'
                      >
                        {item.grade}
                      </th>
                    )}
                    <td className='text-center'>{targetItem.juz}</td>
                    <td className='text-center'>{targetItem.total_ayat}</td>
                    <td className='text-center'>{targetItem.total_line}</td>
                    {targetIndex === 0 && (
                      <td
                        rowSpan={item.target.length}
                        className='text-center align-middle'
                      >
                        {item.total_ayat}
                      </td>
                    )}
                    {targetIndex === 0 && (
                      <td
                        rowSpan={item.target.length}
                        className='text-center align-middle'
                      >
                        {item.total_line}
                      </td>
                    )}
                    <td className='text-center'>
                      <div className='d-flex justify-content-center gap-2'>
                        <button className='btn btn-sm btn-danger'>
                          <i className='bi bi-trash'></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))
          ) : (
            <tr>
              <td colSpan='5' className='text-center'>
                Tidak ada data tersedia
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableData;
