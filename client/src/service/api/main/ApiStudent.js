import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiClass } from "./ApiClass";

export const ApiStudent = createApi({
  reducerPath: "ApiStudent",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/student",
    credentials: "include",
  }),
  tagTypes: ["students"],
  endpoints: (builder) => ({
    updateStudent: builder.mutation({
      query: (body) => ({
        url: "/update-student",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["students"],
    }),
    getStudents: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-students",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["students"],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: "/delete-student",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["students"],
    }),
    changeStatus: builder.mutation({
      query: (id) => ({
        url: "/change-status",
        method: "PUT",
        params: { id },
      }),
      invalidatesTags: ["students"],
    }),
    graduated: builder.mutation({
      query: (classid) => ({
        url: "/graduated",
        method: "PUT",
        params: { classid },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(ApiClass.util.invalidateTags(["students", "class"]));
        } catch {
          // Handle error if needed
        }
      },
    }),
    changePeriode: builder.mutation({
      query: (body) => ({
        url: "/change-periode",
        method: "PUT",
        body,
      }),
    }),
    downloadStudent: builder.mutation({
      query: () => ({
        url: "/download-students",
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "data-siswa.xlsx";
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
  useUpdateStudentMutation,
  useGetStudentsQuery,
  useDeleteStudentMutation,
  useChangeStatusMutation,
  useGraduatedMutation,
  useChangePeriodeMutation,
  useDownloadStudentMutation,
} = ApiStudent;
