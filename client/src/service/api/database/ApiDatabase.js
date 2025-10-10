import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDatabase = createApi({
  reducerPath: "ApiDatabase",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/database` }),
  tagTypes: ["Database"],
  endpoints: (builder) => ({
    getPeriode: builder.query({
      query: (homebaseid) => ({
        url: "/get-periode",
        params: { homebaseid },
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
    getDatabaseByClass: builder.query({
      query: ({ page, limit, search, classid }) => ({
        url: "/get-database-by-class",
        params: { page, limit, search, classid },
      }),
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
      invalidatesTags: ["Database"],
    }),
    exportDatabase: builder.query({
      query: () => ({
        url: "/export-database",
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "database-siswa.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          return { message: "File berhasil didownload" };
        },
      }),
    }),
  }),
});

export const {
  useGetPeriodeQuery,
  useGetHomebaseQuery,
  useGetDatabaseQuery,
  useGetDatabaseByClassQuery,
  useGetStudentDataQuery,
  useAddStudentDataMutation,
  useAddParentsDataMutation,
  useAddFamilyDataMutation,
  useDeleteFamilyDataMutation,
  useExportDatabaseQuery,
} = ApiDatabase;
