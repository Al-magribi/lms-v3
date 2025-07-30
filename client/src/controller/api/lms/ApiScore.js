import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiScore = createApi({
  reducerPath: "ApiScore",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/scores` }),

  endpoints: (builder) => ({
    getStudents: builder.query({
      query: ({ page, limit, search, classid }) => ({
        url: "/get-students",
        method: "GET",
        params: { page, limit, search, classid },
      }),
    }),
    getReports: builder.query({
      query: ({ classid, subjectid, month, studentids }) => {
        // If studentids is an array, fetch for each student and flatten results
        if (Array.isArray(studentids) && studentids.length > 0) {
          // This will be handled in the component by multiple calls if needed
          // Here, just fetch for the first student as fallback
          return {
            url: "/reports",
            method: "GET",
            params: { classid, subjectid, month, studentid: studentids[0] },
          };
        }
        return {
          url: "/reports",
          method: "GET",
          params: { classid, subjectid, month },
        };
      },
      // transformResponse to handle array of students
      transformResponse: (response, meta, arg) => {
        if (Array.isArray(arg.studentids) && arg.studentids.length > 0) {
          // If only one student, return as is
          if (arg.studentids.length === 1) return response;
          // Otherwise, the component should call this per student
        }
        return response;
      },
    }),
    createReport: builder.mutation({
      query: (body) => ({
        url: "/add-report",
        method: "POST",
        body,
      }),
    }),
    updateReport: builder.mutation({
      query: ({ id, body }) => ({
        url: `/report/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
} = ApiScore;
