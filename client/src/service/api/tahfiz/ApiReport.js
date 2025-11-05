import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiReport = createApi({
  reducerPath: "ApiReport",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/report`, credentials: "include" }),
  tagTypes: ["reports"],
  endpoints: (builder) => ({
    deleteJuzReport: builder.mutation({
      query: ({ userid, juzId }) => ({
        url: "/delete-juz-report",
        method: "DELETE",
        params: { userid, juzId },
      }),
      invalidatesTags: ["reports"],
    }),
    deleteSurahReport: builder.mutation({
      query: ({ userid, surahId, date }) => ({
        url: "/delete-surah-report",
        method: "DELETE",
        params: { userid, surahId, date },
      }),
      invalidatesTags: ["reports"],
    }),

    getAchievement: builder.query({
      query: () => ({
        url: "/get-report-target",
        method: "GET",
      }),
      providesTags: ["reports"],
    }),
    getStudentReport: builder.query({
      query: (userid) => ({
        url: `/get-student-report`,
        method: "GET",
        params: { userid },
      }),
      providesTags: ["reports"],
    }),
    getRecordMemo: builder.query({
      query: ({ page, limit, search, type }) => ({
        url: "/get-record-memo",
        method: "GET",
        params: { page, limit, search, type },
      }),
      providesTags: ["reports"],
    }),
  }),
});

export const {
  useDeleteJuzReportMutation,
  useDeleteSurahReportMutation,
  useGetAchievementQuery,
  useGetStudentReportQuery,
  useGetRecordMemoQuery,
} = ApiReport;
