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
      query: ({ classid, subjectid }) => ({
        url: "/get-presensi",
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
  }),
});

export const { useGetPresensiQuery, useAddPresensiMutation } = ApiPresensi;
