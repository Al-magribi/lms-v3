import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiRecap = createApi({
  reducerPath: "ApiRecap",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/recap",
    credentials: "include",
  }),
  tagTypes: ["Recap", "Subjects", "Presensi"],
  endpoints: (builder) => ({
    getChapterRecap: builder.query({
      query: ({
        classid,
        subjectid,
        chapterid,
        month,
        search,
        page,
        limit,
      }) => ({
        url: "/chapter-final-score",
        method: "GET",
        params: { classid, subjectid, chapterid, month, search, page, limit },
      }),
      providesTags: ["Recap"],
    }),
    getMonthlyRecap: builder.query({
      query: ({ studentId, month, periode }) => ({
        url: "/monthly-recap",
        method: "GET",
        params: { studentId, month, periode },
      }),
      providesTags: (result, error, arg) =>
        result ? [{ type: "Recap", id: arg.studentId }] : ["Recap"],
    }),
    getPresensi: builder.query({
      query: ({ semester, classid, subjectid }) => ({
        url: "/attendance-recap",
        method: "GET",
        params: { semester, classid, subjectid },
      }),
      providesTags: ["Presensi"],
    }),

    getAttitude: builder.query({
      query: ({ semester, classid, subjectid }) => ({
        url: "/attitude-recap",
        method: "GET",
        params: { semester, classid, subjectid },
      }),
      invalidatesTags: ["Subjects"],
    }),

    getDailyRecap: builder.query({
      query: ({ semester, classid, subjectid }) => ({
        url: "/daily-recap",
        method: "GET",
        params: { semester, classid, subjectid },
      }),
      invalidatesTags: ["Subjects"],
    }),

    getFinalScore: builder.query({
      query: ({ semester, classid, subjectid }) => ({
        url: "/final-score",
        method: "GET",
        params: { semester, classid, subjectid },
      }),
      invalidatesTags: ["Subjects"],
    }),
  }),
});

export const {
  useGetChapterRecapQuery,
  useGetMonthlyRecapQuery,
  useGetPresensiQuery,
  useGetAttitudeQuery,
  useGetDailyRecapQuery,
  useGetFinalScoreQuery,
} = ApiRecap;
