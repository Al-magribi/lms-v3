import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDashboard = createApi({
  reducerPath: "ApiDashboard",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/dash" }),
  tagTypes: ["AdminDash", "CenterDash"],
  endpoints: (builder) => ({
    // General
    getHomebaseStats: builder.query({
      query: () => "/homebase-stats",
      providesTags: ["CenterDash", "AdminDash"],
    }),

    // Admin
    getAdminDashboard: builder.query({
      query: () => "/admin-stats",
      providesTags: ["AdminDash"],
    }),
    getTeacherDashboard: builder.query({
      query: () => "/teacher-stats",
      providesTags: ["TeacherDash"],
    }),
    getStudentDashboard: builder.query({
      query: () => "/student-stats",
      providesTags: ["StudentDash"],
    }),
    getParentDashboard: builder.query({
      query: () => "/parent-stats",
      providesTags: ["ParentDash"],
    }),
    // Center API
    getCenterBasic: builder.query({
      query: () => "/center-basic-stats",
      providesTags: ["CenterDash"],
    }),

    getHomeInfografis: builder.query({
      query: () => "/infografis",
      providesTags: ["HomeInfografis"],
    }),
    getCmsDashboard: builder.query({
      query: () => "/cms-dashboard",
      providesTags: ["CmsDash"],
    }),
  }),
});

export const {
  // General
  useGetHomebaseStatsQuery,

  // Admin
  useGetAdminDashboardQuery,
  useGetTeacherDashboardQuery,
  useGetStudentDashboardQuery,
  useGetParentDashboardQuery,

  // Center Api
  useGetCenterBasicQuery,
  useGetHomeInfografisQuery,
  useGetCmsDashboardQuery,
} = ApiDashboard;
