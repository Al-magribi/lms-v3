import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiLog = createApi({
  reducerPath: "ApiLog",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/logs`, credentials: "include" }),
  tagTypes: ["logs", "log"],
  endpoints: (builder) => ({
    getUserLog: builder.query({
      query: ({ exam, student }) => ({
        url: "/get-user-log",
        params: { exam, student },
      }),
      providesTags: ["log"],
    }),
    addCbtLogs: builder.mutation({
      query: (data) => ({
        url: "/add-cbt-logs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["log"],
    }),
    finishCbt: builder.mutation({
      query: ({ id, exam }) => ({
        url: "/finish-cbt",
        method: "POST",
        params: { id, exam },
      }),
      invalidatesTags: ["log"],
    }),
    getFilter: builder.query({
      query: ({ exam }) => ({
        url: "/get-filter",
        params: { exam },
      }),
      providesTags: ["logs"],
    }),
    getExamLog: builder.query({
      query: ({ exam, classid, page, limit, search }) => ({
        url: "/get-exam-log",
        params: { exam, classid, page, limit, search },
      }),
      providesTags: ["logs"],
    }),
    retakeExam: builder.mutation({
      query: ({ id, student, exam }) => ({
        url: "/retake-exam",
        params: { id, student, exam },
      }),
      invalidatesTags: ["logs"],
    }),
    rejoinExam: builder.mutation({
      query: ({ id }) => ({
        url: "/rejoin-exam",
        method: "PUT",
        params: { id },
      }),
      invalidatesTags: ["logs"],
    }),
  }),
});

export const {
  useGetUserLogQuery,
  useAddCbtLogsMutation,
  useFinishCbtMutation,
  useGetExamLogQuery,
  useGetFilterQuery,
  useRetakeExamMutation,
  useRejoinExamMutation,
} = ApiLog;
