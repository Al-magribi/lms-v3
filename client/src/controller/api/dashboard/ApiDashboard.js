import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDashboard = createApi({
  reducerPath: "ApiDashboard",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/dash" }),
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => "/admin-stats",
      providesTags: ["AdminDash"],
    }),
    getTeacherDashboard: builder.query({
      query: () => "/teacher-stats",
      providesTags: ["TeacherDash"],
    }),
  }),
});

export const { useGetAdminDashboardQuery, useGetTeacherDashboardQuery } =
  ApiDashboard;
