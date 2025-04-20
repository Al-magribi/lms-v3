import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDatabase = createApi({
  reducerPath: "ApiDatabase",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/database` }),
  tagTypes: ["Database"],
  endpoints: (builder) => ({
    getPeriode: builder.query({
      query: () => ({
        url: "/get-periode",
      }),
    }),
    getHomebase: builder.query({
      query: () => ({
        url: "/get-homebase",
      }),
    }),
    getDatabase: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-database",
        params: { page, limit, search },
      }),
      providesTags: ["Database"],
    }),
    getStudentData: builder.query({
      query: (userid) => ({
        url: "/get-student-data",
        params: { userid },
      }),
      providesTags: ["Database"],
    }),
    addStudentData: builder.mutation({
      query: (data) => ({
        url: "/add-student-data",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Database"],
    }),
    addParentsData: builder.mutation({
      query: (data) => ({
        url: "/add-parents-data",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Database"],
    }),
    addFamilyData: builder.mutation({
      query: (data) => ({
        url: "/add-family-data",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Database"],
    }),
    deleteFamilyData: builder.mutation({
      query: (id) => ({
        url: "/delete-family-data",
        method: "DELETE",
        params: { id },
      }),
    }),
  }),
});

export const {
  useGetPeriodeQuery,
  useGetHomebaseQuery,
  useGetDatabaseQuery,
  useGetStudentDataQuery,
  useAddStudentDataMutation,
  useAddParentsDataMutation,
  useAddFamilyDataMutation,
  useDeleteFamilyDataMutation,
} = ApiDatabase;
