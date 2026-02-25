import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiCenterData = createApi({
  reducerPath: "ApiCenterData",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/center/data` }),
  endpoints: (builder) => ({
    getTeachersData: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-teachers-data?page=${page}&limit=${limit}&search=${search}`,
      }),
    }),
    getStudentsData: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-students-data?page=${page}&limit=${limit}&search=${search}`,
      }),
    }),
    getFamilyData: builder.query({
      query: ({ page, limit, search, family_age, family_gender }) => ({
        url: `/get-family-data?page=${page}&limit=${limit}&search=${search}${
          family_age ? `&family_age=${family_age}` : ""
        }${family_gender ? `&family_gender=${family_gender}` : ""}`,
      }),
    }),
    downloadMarketAnalysis: builder.mutation({
      query: ({ search = "", family_age = "", family_gender = "" }) => ({
        url: "/download-market-analysis",
        method: "GET",
        params: {
          search,
          ...(family_age ? { family_age } : {}),
          ...(family_gender ? { family_gender } : {}),
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "analisis-market.xlsx";
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
  useGetTeachersDataQuery,
  useGetStudentsDataQuery,
  useGetFamilyDataQuery,
  useDownloadMarketAnalysisMutation,
} = ApiCenterData;
