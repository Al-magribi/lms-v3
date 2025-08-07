import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiScore = createApi({
  reducerPath: "ApiScore",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/scores",
    credentials: "include",
  }),
  tagTypes: ["reports", "attitude", "academic", "attendance", "grades"],
  endpoints: (builder) => ({
    // Get reports with enhanced data
    getReports: builder.query({
      query: ({ classid, subjectid, month, chapterid }) => ({
        url: "/reports",
        params: { classid, subjectid, month, chapterid },
      }),
      providesTags: ["reports"],
    }),

    // Create report
    createReport: builder.mutation({
      query: (body) => ({
        url: "/add-report",
        method: "POST",
        body,
      }),
      invalidatesTags: ["reports"],
    }),

    // Update report
    updateReport: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-report/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["reports"],
    }),

    // Attitude scores
    getAttitudeScores: builder.query({
      query: ({ classid, subjectid, month }) => ({
        url: "/attitude-scores",
        params: { classid, subjectid, month },
      }),
      providesTags: ["attitude"],
    }),

    createAttitudeScore: builder.mutation({
      query: (body) => ({
        url: "/add-attitude-score",
        method: "POST",
        body,
      }),
      invalidatesTags: ["attitude"],
    }),

    updateAttitudeScore: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-attitude-score/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["attitude"],
    }),

    // Academic scores
    getAcademicScores: builder.query({
      query: ({ classid, subjectid, chapterid }) => ({
        url: "/academic-scores",
        params: { classid, subjectid, chapterid },
      }),
      providesTags: ["academic"],
    }),

    createAcademicScore: builder.mutation({
      query: (body) => ({
        url: "/add-academic-score",
        method: "POST",
        body,
      }),
      invalidatesTags: ["academic"],
    }),

    updateAcademicScore: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-academic-score/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["academic"],
    }),

    // Attendance records
    getAttendanceRecords: builder.query({
      query: ({ classid, subjectid, month }) => ({
        url: "/attendance-records",
        params: { classid, subjectid, month },
      }),
      providesTags: ["attendance"],
    }),

    createAttendanceRecord: builder.mutation({
      query: (body) => ({
        url: "/add-attendance-record",
        method: "POST",
        body,
      }),
      invalidatesTags: ["attendance"],
    }),

    updateAttendanceRecord: builder.mutation({
      query: ({ id, body }) => ({
        url: `/update-attendance-record/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["attendance"],
    }),

    // Daily summative scores
    getDailySummative: builder.query({
      query: ({ classid, subjectid, chapterid }) => ({
        url: "/daily-summative",
        params: { classid, subjectid, chapterid },
      }),
      providesTags: ["academic"],
    }),

    createDailySummative: builder.mutation({
      query: (body) => ({
        url: "/add-daily-summative",
        method: "POST",
        body,
      }),
      invalidatesTags: ["academic"],
    }),

    // Final semester exam
    getFinalSemesterExam: builder.query({
      query: ({ classid, subjectid }) => ({
        url: "/final-semester-exam",
        params: { classid, subjectid },
      }),
      providesTags: ["grades"],
    }),

    createFinalSemesterExam: builder.mutation({
      query: (body) => ({
        url: "/add-final-semester-exam",
        method: "POST",
        body,
      }),
      invalidatesTags: ["grades"],
    }),

    // Final grades calculation
    getFinalGrades: builder.query({
      query: ({ classid, subjectid }) => ({
        url: "/final-grades",
        params: { classid, subjectid },
      }),
      providesTags: ["grades"],
    }),

    calculateFinalGrade: builder.mutation({
      query: (body) => ({
        url: "/calculate-final-grade",
        method: "POST",
        body,
      }),
      invalidatesTags: ["grades"],
    }),

    // Comprehensive student report
    getStudentReport: builder.query({
      query: ({ studentid, subjectid, month }) => ({
        url: "/student-report",
        params: { studentid, subjectid, month },
      }),
      providesTags: ["reports", "attitude", "academic", "attendance", "grades"],
    }),

    // Bulk operations
    bulkSaveScores: builder.mutation({
      query: (body) => ({
        url: "/bulk-save-scores",
        method: "POST",
        body,
      }),
      invalidatesTags: ["reports", "attitude", "academic"],
    }),

    // Export reports
    exportReport: builder.mutation({
      query: (body) => ({
        url: "/export-report",
        method: "POST",
        body,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useGetAttitudeScoresQuery,
  useCreateAttitudeScoreMutation,
  useUpdateAttitudeScoreMutation,
  useGetAcademicScoresQuery,
  useCreateAcademicScoreMutation,
  useUpdateAcademicScoreMutation,
  useGetAttendanceRecordsQuery,
  useCreateAttendanceRecordMutation,
  useUpdateAttendanceRecordMutation,
  useGetDailySummativeQuery,
  useCreateDailySummativeMutation,
  useGetFinalSemesterExamQuery,
  useCreateFinalSemesterExamMutation,
  useGetFinalGradesQuery,
  useCalculateFinalGradeMutation,
  useGetStudentReportQuery,
  useBulkSaveScoresMutation,
  useExportReportMutation,
} = ApiScore;
