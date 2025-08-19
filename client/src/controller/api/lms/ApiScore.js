import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiScore = createApi({
  reducerPath: "ApiScore",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/scores",
    credentials: "include",
  }),
  tagTypes: [
    "reports",
    "attitude",
    "formative",
    "summative",
    "attendance",
    "grades",
  ],
  endpoints: (builder) => ({
    // Fetch per-type score data (new minimal endpoints)
    getAttitude: builder.query({
      query: ({ classid, subjectid, chapterid, month, semester }) => ({
        url: "/attitude",
        params: { classid, subjectid, chapterid, month, semester },
      }),
      providesTags: (
        result,
        error,
        { classid, subjectid, chapterid, month, semester }
      ) => [
        {
          type: "attitude",
          id: `${classid}-${subjectid}-${chapterid}-${month}-${semester}`,
        },
      ],
    }),
    upsertAttitude: builder.mutation({
      query: (body) => ({
        url: "/attitude",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        {
          type: "attitude",
          id: `${body.class_id}-${body.subject_id}-${body.chapter_id}-${body.month}-${body.semester}`,
        },
        "reports",
      ],
    }),
    bulkUpsertAttitude: builder.mutation({
      query: ({ classid, subjectid, chapterid, month, semester, data }) => ({
        url: "/attitude/upload-score",
        method: "POST",
        body: data,
        params: {
          classid,
          subjectid,
          chapterid,
          month,
          semester,
        },
      }),
      invalidatesTags: ["attitude"],
    }),

    getFormative: builder.query({
      query: ({ classid, subjectid, chapterid, month, semester }) => ({
        url: "/formative",
        params: { classid, subjectid, chapterid, month, semester },
      }),
      providesTags: (
        result,
        error,
        { classid, subjectid, chapterid, month, semester }
      ) => [
        {
          type: "formative",
          id: `${classid}-${subjectid}-${chapterid}-${month}-${semester}`,
        },
      ],
    }),
    upsertFormative: builder.mutation({
      query: (body) => ({
        url: "/formative",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        {
          type: "formative",
          id: `${body.class_id}-${body.subject_id}-${body.chapter_id}-${body.month}-${body.semester}`,
        },
        "reports",
      ],
    }),
    bulkUpsertFormative: builder.mutation({
      query: ({ classid, subjectid, chapterid, month, semester, data }) => ({
        url: "/formative/upload-score",
        method: "POST",
        body: data,
        params: {
          classid,
          subjectid,
          chapterid,
          month,
          semester,
        },
      }),
      invalidatesTags: ["formative"],
    }),

    getSummative: builder.query({
      query: ({ classid, subjectid, chapterid, month, semester }) => ({
        url: "/summative",
        params: { classid, subjectid, chapterid, month, semester },
      }),
      providesTags: (
        result,
        error,
        { classid, subjectid, chapterid, month, semester }
      ) => [
        {
          type: "summative",
          id: `${classid}-${subjectid}-${chapterid}-${month}-${semester}`,
        },
      ],
    }),
    upsertSummative: builder.mutation({
      query: (body) => ({
        url: "/summative",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        {
          type: "summative",
          id: `${body.class_id}-${body.subject_id}-${body.chapter_id}-${body.month}-${body.semester}`,
        },
        "reports",
      ],
    }),
    bulkUpsertSummative: builder.mutation({
      query: ({ classid, subjectid, chapterid, month, semester, data }) => ({
        url: "/summative/upload-score",
        method: "POST",
        body: data,
        params: {
          classid,
          subjectid,
          chapterid,
          month,
          semester,
        },
      }),
      invalidatesTags: ["summative"],
    }),
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

    // Get comprehensive recap data
    getRecap: builder.query({
      query: ({ classid, subjectid, chapterid, month, semester }) => ({
        url: "/recap",
        params: { classid, subjectid, chapterid, month, semester },
      }),
      providesTags: (
        result,
        error,
        { classid, subjectid, chapterid, month, semester }
      ) => [
        {
          type: "reports",
          id: `recap-${classid}-${subjectid}-${chapterid}-${month}-${semester}`,
        },
      ],
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

    // Parent Monthly Reports
    getParentMonthlyReport: builder.query({
      query: ({ month, semester }) => ({
        url: "/parent-monthly-report",
        params: { month, semester },
      }),
      providesTags: ["parent-reports"],
    }),

    getParentAvailableMonths: builder.query({
      query: () => ({
        url: "/parent-available-months",
      }),
      providesTags: ["parent-months"],
    }),
  }),
});

export const {
  useGetAttitudeQuery,
  useUpsertAttitudeMutation,
  useBulkUpsertAttitudeMutation,
  useGetFormativeQuery,
  useUpsertFormativeMutation,
  useBulkUpsertFormativeMutation,
  useGetSummativeQuery,
  useUpsertSummativeMutation,
  useBulkUpsertSummativeMutation,
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
  useGetRecapQuery,
  useExportReportMutation,
  useGetParentMonthlyReportQuery,
  useGetParentAvailableMonthsQuery,
} = ApiScore;
