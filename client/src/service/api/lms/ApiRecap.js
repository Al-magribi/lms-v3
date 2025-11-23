import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiRecap = createApi({
  reducerPath: "ApiRecap",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/recap",
    credentials: "include",
  }),
  tagTypes: ["recap"],
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
      providesTags: ["recap"],
    }),
    getMonthlyRecap: builder.query({
      query: ({ studentId, month, periode }) => ({
        url: "/monthly-recap",
        method: "GET",
        params: { studentId, month, periode },
      }),
      providesTags: (result, error, arg) =>
        result ? [{ type: "recap", id: arg.studentId }] : ["recap"],
    }),
    getFinalScore: builder.query({
      query: ({ semester, classid, subjectid }) => ({
        url: "/final-score",
        method: "GET",
        params: { semester, classid, subjectid },
      }),
      invalidatesTags: ["subjects"],
    }),
    getDailyRecap: builder.query({
      query: ({ semester, classid, subjectid }) => ({
        url: "/daily-recap",
        method: "GET",
        params: { semester, classid, subjectid },
      }),
      invalidatesTags: ["subjects"],
    }),
  }),
});

export const {
  useGetChapterRecapQuery,
  useGetMonthlyRecapQuery,
  useGetFinalScoreQuery,
  useGetDailyRecapQuery,
} = ApiRecap;
