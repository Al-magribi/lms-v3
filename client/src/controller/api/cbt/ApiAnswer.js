import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAnswer = createApi({
  reducerPath: "ApiAnswer",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/answer` }),
  tagTypes: ["answer"],
  endpoints: (builder) => ({
    addAnswer: builder.mutation({
      query: (body) => ({
        url: "/add-answer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["answer"],
    }),
    getStudentAnswer: builder.query({
      query: ({ student, exam }) => ({
        url: "/get-student-answer",
        params: { student, exam },
      }),
      providesTags: ["answer"],
    }),
    gradeEssay: builder.mutation({
      query: (body) => ({
        url: "/grade-essay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["answer"],
    }),
  }),
});

export const {
  useAddAnswerMutation,
  useGetStudentAnswerQuery,
  useGradeEssayMutation,
} = ApiAnswer;
