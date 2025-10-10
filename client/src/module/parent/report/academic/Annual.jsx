import { Alert } from "antd";
import React from "react";

const Annual = () => {
  return (
    <Alert
      type="info"
      showIcon
      message="Laporan Semester"
      description="Halaman ini masih dalam tahap pengembangan"
    />
  );
};

export default Annual;

const resultsWithBranches = [
  {
    month: "Nama Bulan",
    nis: "Nis Siswa",
    name: "Nama Siswa",
    homebase: "Nama Homebase diambil dari a_homebase",
    periode: "Nama periode yang aktf berdasarkan homebase dari a_periode",
    grade: "Nama tingkat diambil dari a_grade",
    class:
      "Nama Kelas diambil dari cl_students yang a_periodenya aktif berdasarkan homebasenya",
    teacher_homeroom: `Nama guru yang memiliki u_teachers.homeroom true u_teachers.class yang sama 
      dengan a_class dan sama dengan cl_students.classid`,
    category: [
      {
        name: "Nama Kategori diambil dari a_category",
        subjects: [
          {
            name: "Nama Mata Pelajaran diambil dari a_subject",
            teacher:
              "Nama guru yang ditugaskan di subject ini diambil dari at_subject dan yang mengajar di kelas ini dapat diliat di l_chapter",
            score: `Nilai ini diambil pada setiap bulan dan ini dicapai dari 
            rata rata l_attendance (dengan note Hadir) dikali l_weighting.presensi
              + rata rata l_attitude dikali l_weighting.attitude
              + rata rata l_summative dan l_formative dikali l_weighting.daily`,
            chapters: [
              {
                id: "Id Chapter",
                name: "Nama Chapter yang sesuai dengan bulan ini yang memiliki chapter_id di l_summatice dan l_formative ",
              },
            ],
            note: "Catatan guru",
            detail: [
              {
                attendance: [
                  { Hadir: "Jumlah note Hadir pada l_attendance" },
                  { Sakit: "Jumlah note Sakit pada l_attendance" },
                  { Ijin: "Jumlah note Ijin pada l_attendance" },
                  { Alpa: "Jumlah note Alpa pada l_attendance" },
                  { presentase: "Presentase Hadir" },
                ],
              },
              {
                attitude: [
                  { kinerja: "Nilai kinerja dari l_attitude.kinerja" },
                  {
                    kedisiplinan:
                      "Nilai kedisiplinan dari l_attitude.kedisiplinan",
                  },
                  { keaktifan: "Nilai keaktifan dari l_attitude.kinerja" },
                  {
                    percaya_diri:
                      "Nilai percaya_diri dari l_attitude.percaya_diri",
                  },
                ],
              },
              {
                summative: [
                  { lisan: "Nilai oral dari l_summative.oral" },
                  { tulis: "Nilai written dari l_summative.written" },
                  { proyek: "Nilai project dari l_summative.project" },
                  {
                    keterampilan:
                      "Nilai performance dari l_summative.performance",
                  },
                ],
                formative: ["Semua nilai formative di l_formative"],
              },
            ],
          },
        ],
      },
      {
        name: "Nama Kategori diambil dari a_category Jika a_category.name adalah Diniyah",
        branch: [
          {
            name: "Nama rumpun diambil dari a_branch",
            score:
              "Nilai rata rata dair score di setiap subject pada rumpun yang sama",
            subjects: [
              {
                name: "Nama Mata Pelajaran diambil dari a_subject",
                score: `hasil ini dicapai dari rata rata l_attendance (dengan note Hadir) dikali l_weighting.presensi
              + rata rata l_attitude dikali l_weighting.attitude
              + rata rata l_summative dan l_formative dikali l_weighting.daily`,
                chapters: [{ id: "Id Chapter", name: "Nama Chapter" }],
                note: "Catatan guru",
                detail: [
                  {
                    attendance: [
                      { Hadir: "Jumlah note Hadir pada l_attendance" },
                      { Sakit: "Jumlah note Sakit pada l_attendance" },
                      { Ijin: "Jumlah note Ijin pada l_attendance" },
                      { Alpa: "Jumlah note Alpa pada l_attendance" },
                      { presentase: "Presentase Hadir" },
                    ],
                  },
                  {
                    attitude: [
                      { kinerja: "Nilai kinerja dari l_attitude.kinerja" },
                      {
                        kedisiplinan:
                          "Nilai kedisiplinan dari l_attitude.kedisiplinan",
                      },
                      { keaktifan: "Nilai keaktifan dari l_attitude.kinerja" },
                      {
                        percaya_diri:
                          "Nilai percaya_diri dari l_attitude.percaya_diri",
                      },
                    ],
                  },
                  {
                    summative: [
                      { lisan: "Nilai oral dari l_summative.oral" },
                      { tulis: "Nilai written dari l_summative.written" },
                      { proyek: "Nilai project dari l_summative.project" },
                      {
                        keterampilan:
                          "Nilai performance dari l_summative.performance",
                      },
                    ],
                    formative: ["Semua nilai formative di l_formative"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const resultsWithOutBranches = [
  {
    month: "Nama Bulan",
    nis: "Nis Siswa",
    name: "Nama Siswa",
    homebase: "Nama Homebase diambil dari a_homebase",
    periode: "Nama periode yang aktf berdasarkan homebase dari a_periode",
    grade: "Nama tingkat diambil dari a_grade",
    class:
      "Nama Kelas diambil dari cl_students yang a_periodenya aktif berdasarkan homebasenya",
    teacher_homeroom: `Nama guru yang memiliki u_teachers.homeroom true u_teachers.class yang sama 
      dengan a_class dan sama dengan cl_students.classid`,
    category: [
      {
        name: "Nama Kategori diambil dari a_category",
        subjects: [
          {
            name: "Nama Mata Pelajaran diambil dari a_subject",
            teacher:
              "Nama guru yang ditugaskan di subject ini diambil dari at_subject dan yang mengajar di kelas ini dapat diliat di l_chapter",
            score: `Nilai ini diambil pada setiap bulan dan ini dicapai dari 
            rata rata l_attendance (dengan note Hadir) dikali l_weighting.presensi
              + rata rata l_attitude dikali l_weighting.attitude
              + rata rata l_summative dan l_formative dikali l_weighting.daily`,
            chapters: [
              {
                id: "Id Chapter",
                name: "Nama Chapter yang sesuai dengan bulan ini yang memiliki chapter_id di l_summatice dan l_formative",
              },
            ],
            note: "Catatan guru",
            detail: [
              {
                attendance: [
                  { Hadir: "Jumlah note Hadir pada l_attendance" },
                  { Sakit: "Jumlah note Sakit pada l_attendance" },
                  { Ijin: "Jumlah note Ijin pada l_attendance" },
                  { Alpa: "Jumlah note Alpa pada l_attendance" },
                  { presentase: "Presentase Hadir" },
                ],
              },
              {
                attitude: [
                  { kinerja: "Nilai kinerja dari l_attitude.kinerja" },
                  {
                    kedisiplinan:
                      "Nilai kedisiplinan dari l_attitude.kedisiplinan",
                  },
                  { keaktifan: "Nilai keaktifan dari l_attitude.kinerja" },
                  {
                    percaya_diri:
                      "Nilai percaya_diri dari l_attitude.percaya_diri",
                  },
                ],
              },
              {
                summative: [
                  { lisan: "Nilai oral dari l_summative.oral" },
                  { tulis: "Nilai written dari l_summative.written" },
                  { proyek: "Nilai project dari l_summative.project" },
                  {
                    keterampilan:
                      "Nilai performance dari l_summative.performance",
                  },
                ],
                formative: ["Semua nilai formative di l_formative"],
              },
            ],
          },
        ],
      },
    ],
  },
];
