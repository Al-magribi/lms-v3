import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiPresensi = createApi({
  reducerPath: "ApiPresensi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/presensi`,
    credentials: "include",
  }),
  tagTypes: ["Presensi"],
  endpoints: (builder) => ({
    getPresensi: builder.query({
      query: ({ classid, subjectid, date }) => ({
        url: "/get-presensi",
        params: { classid, subjectid, ...(date && { date }) },
      }),
      providesTags: ["Presensi"],
    }),
    getPresensiSummary: builder.query({
      query: ({ classid, subjectid, month, year }) => ({
        url: "/get-presensi-summary",
        params: { classid, subjectid, month, year },
      }),
      providesTags: ["Presensi"],
    }),
    getAttendanceDates: builder.query({
      query: ({ classid, subjectid }) => ({
        url: "/get-attendance-dates",
        params: { classid, subjectid },
      }),
      providesTags: ["Presensi"],
    }),
    addPresensi: builder.mutation({
      query: (body) => ({
        url: "/add-presensi",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Presensi"],
    }),
    bulkPresensi: builder.mutation({
      query: (body) => ({
        url: "/bulk-presensi",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Presensi"],
    }),
    deletePresensi: builder.mutation({
      query: ({ classid, subjectid, studentid, date }) => ({
        url: "/delete-presensi",
        method: "DELETE",
        params: { classid, subjectid, studentid, date },
      }),
      invalidatesTags: ["Presensi"],
    }),
    bulkDeletePresensi: builder.mutation({
      query: (body) => ({
        url: "/bulk-delete-presensi",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Presensi"],
    }),
  }),
});

export const {
  useGetPresensiQuery,
  useGetPresensiSummaryQuery,
  useGetAttendanceDatesQuery,
  useAddPresensiMutation,
  useBulkPresensiMutation,
  useDeletePresensiMutation,
  useBulkDeletePresensiMutation,
} = ApiPresensi;
