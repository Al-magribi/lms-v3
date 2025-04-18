import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiStudent = createApi({
  reducerPath: "ApiStudent",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/student",
    credentials: "include",
  }),
  tagTypes: ["student"],
  endpoints: (builder) => ({
    addStudent: builder.mutation({
      query: (body) => ({
        url: "/add-student",
        method: "POST",
        body,
      }),
      invalidatesTags: ["student"],
    }),
    getStudents: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-students",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["student"],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: "/delete-student",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["student"],
    }),
    uploadStudents: builder.mutation({
      query: (body) => ({
        url: "/upload-students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["student"],
    }),
  }),
});

export const {
  useAddStudentMutation,
  useGetStudentsQuery,
  useDeleteStudentMutation,
  useUploadStudentsMutation,
} = ApiStudent;
