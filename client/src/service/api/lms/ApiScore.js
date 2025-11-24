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
    "finalScore",
    "attendance",
    "grades",
    "weighting",
  ],
  endpoints: (builder) => ({
    // Pembobotan
    getWeighting: builder.query({
      query: ({ subjectid }) => ({
        url: "/get-weighting",
        method: "GET",
        params: { subjectid },
      }),
      providesTags: ["weighting"],
    }),
    saveWeighting: builder.mutation({
      query: (body) => ({
        url: "/save-weighting",
        method: "POST",
        body,
      }),
      invalidatesTags: ["weighting"],
    }),

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

    // Final Socres
    getFinalScore: builder.query({
      query: ({ semester, classid, subjectid }) => ({
        url: "/get-final-score",
        method: "GET",
        params: { semester, classid, subjectid },
      }),
      providesTags: ["finalScore"],
    }),

    UpSertFinalScore: builder.mutation({
      query: ({ semester, classid, subjectid, data }) => ({
        url: "/final-score",
        method: "POST",
        body: data,
        params: { semester, classid, subjectid },
      }),
      invalidatesTags: ["finalScores"],
    }),

    getNewCompletion: builder.query({
      query: ({ month, page, limit, search, categoryId }) => ({
        url: "/teacher-completion",
        params: { month, page, limit, search, categoryId },
        method: "GET",
      }),
    }),
  }),
});

export const {
  // Pembobotan
  useGetWeightingQuery,
  useSaveWeightingMutation,

  // Nilai Sikap
  useGetAttitudeQuery,
  useUpsertAttitudeMutation,
  useBulkUpsertAttitudeMutation,

  // Nilai Formatif
  useGetFormativeQuery,
  useUpsertFormativeMutation,
  useBulkUpsertFormativeMutation,

  // Nilai Sumatif
  useGetSummativeQuery,
  useUpsertSummativeMutation,
  useBulkUpsertSummativeMutation,

  // Nilai Akhir Se,ester
  useGetFinalScoreQuery,
  useUpSertFinalScoreMutation,

  //Laporan Bulanan guru
  useGetNewCompletionQuery, // Baru
} = ApiScore;
