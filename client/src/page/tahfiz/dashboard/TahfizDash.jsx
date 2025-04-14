import React from "react";
import Layout from "../../../components/layout/Layout";
import { useGetAchievementQuery } from "../../../controller/api/tahfiz/ApiReport";
import GaugeChart from "react-gauge-chart";

const TahfizDash = () => {
  const { data } = useGetAchievementQuery();

  const renderGradeGauges = () => {
    if (!data) return null;

    return data.map((item, index) => (
      <div key={index} className='col-12 mb-4'>
        <div className='card shadow'>
          <div className='card-header'>
            <h5 className='mb-0'>
              {item.homebase} {item.periode}
            </h5>
          </div>
          <div className='card-body'>
            <div className='row'>
              {item.grade.map((grade, gradeIndex) => {
                const percentage = grade.achievement; // Langsung menggunakan achievement karena sudah dalam skala 0-100

                return (
                  <div key={gradeIndex} className='col-lg-4 col-md-6 mb-3'>
                    <div className='card h-100'>
                      <div className='card-body text-center'>
                        <h6 className='card-title'>Tingkat {grade.name}</h6>
                        <GaugeChart
                          id={`gauge-chart-${index}-${gradeIndex}`}
                          percent={percentage / 100} // Konversi ke skala 0-1 untuk chart
                          arcWidth={0.1}
                          colors={["#ff0048", "#ff7809", "#66ff2e"]}
                          textColor='#000000'
                          needleColor='#345243'
                          needleBaseColor='#345243'
                          animate={true}
                          formatTextValue={(value) =>
                            `${grade.achievement.toFixed(1)}%`
                          }
                        />
                        <div className='mt-2'>
                          <p className='mb-1'>
                            Pencapaian: {grade.achievement.toFixed(1)}%
                          </p>
                          <div className='border-top p-2 d-flex gap-2 justify-content-center flex-wrap'>
                            {grade.target.map((target, idx) => (
                              <p key={idx} className='m-0 small'>
                                {target.juz} ({target.verses} ayat -{" "}
                                {target.lines} Baris)
                              </p>
                            ))}
                          </div>
                          <div className='border-top p-2 d-flex gap-2 justify-content-center'>
                            <p className='m-0 rounded-pill bg-success p-2 text-white'>
                              Selesai: {grade.completed}
                            </p>
                            <p className='m-0 rounded-pill bg-danger p-2 text-white'>
                              Belum Selesai: {grade.uncompleted}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Layout title={"Tahfiz - Dashboard"} levels={["tahfiz"]}>
      <div className='row g-2'>{renderGradeGauges()}</div>
    </Layout>
  );
};

export default TahfizDash;
