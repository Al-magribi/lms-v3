import React from "react";
import Layout from "../../../components/layout/Layout";
import { useParams } from "react-router-dom";
import { useGetStudentReportQuery } from "../../../controller/api/tahfiz/ApiReport";

const StudentReport = () => {
  const { userid, name, grade, classname } = useParams();

  const { data, isLoading } = useGetStudentReportQuery(userid, {
    skip: !userid,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Layout
        title={`Laporan Hafalan ${name.replace(/-/g, " ")}`}
        levels={["tahfiz", "student", "parent"]}>
        <div className='d-flex justify-content-center'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Laporan Hafalan ${name.replace(/-/g, " ")}`}
      levels={["tahfiz", "student", "parent"]}>
      <div className='d-print-none container mb-2'>
        <button className='btn btn-primary' onClick={handlePrint}>
          <i className='bi bi-printer me-2'></i>
          Cetak Laporan
        </button>
      </div>

      <div className='print-section container'>
        <div className='text-center mb-4'>
          <h4 className='mb-1'>Laporan Hafalan Al-Qur'an</h4>
          <h5 className='mb-4'>{data?.homebase}</h5>
          <hr className='mb-4' />
        </div>

        <div className='mb-4'>
          <h6 className='mb-3'>
            <i className='bi bi-person-circle me-2'></i>
            Informasi Siswa
          </h6>
          <div className='ps-4'>
            <p className='mb-1'>Nama: {data?.student_name}</p>
            <p className='mb-1'>NIS: {data?.student_nis}</p>
            <p className='mb-1'>
              Kelas: {data?.grade} - {data?.class}
            </p>
            <p className='mb-1'>Sekolah: {data?.homebase}</p>
          </div>
        </div>

        <div className='row g-4'>
          {data?.memorization.map((juz, index) => (
            <div className='col-6' key={index}>
              <div className='card border-primary h-100'>
                <div className='card-header bg-primary text-white py-2'>
                  <h6 className='mb-0'>{juz.juz}</h6>
                </div>
                <div className='card-body'>
                  <div className='mb-3'>
                    <div className='progress' style={{ height: "20px" }}>
                      <div
                        className='progress-bar bg-success'
                        style={{ width: `${juz.progress}%` }}>
                        {juz.progress}%
                      </div>
                    </div>
                  </div>

                  <div className='row mb-3'>
                    <div className='col-6'>
                      <div className='d-flex align-items-center'>
                        <i className='bi bi-layout-text-window me-2'></i>
                        <div>
                          <div>Baris</div>
                          <strong>{juz.lines}</strong>
                        </div>
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='d-flex align-items-center'>
                        <i className='bi bi-bookmark me-2'></i>
                        <div>
                          <div>Ayat</div>
                          <strong>{juz.verses}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className='mb-2'>Detail Surah:</h6>
                    {juz.surah.map((surah, idx) => (
                      <div
                        key={idx}
                        className='d-flex justify-content-between align-items-center mb-1'>
                        <span>{surah.surah_name}</span>
                        <span className='badge bg-info'>
                          {surah.verse} ayat | {surah.line} baris
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-section,
    .print-section * {
      visibility: visible;
    }
    .print-section {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px;
    }
    
    .card {
      border: 1px solid #0d6efd !important;
      break-inside: avoid;
    }
    .progress {
      border: 1px solid #dee2e6;
    }
    .progress-bar {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .bg-primary, .bg-info, .bg-success {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .badge {
      border: 1px solid #0dcaf0;
    }
    hr {
      border-top: 1px solid #000;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
    }
    .col-6 {
      width: 50%;
      padding: 0 15px;
    }
  }
`;

const style = document.createElement("style");
style.innerHTML = printStyles;
document.head.appendChild(style);

export default StudentReport;
