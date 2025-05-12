import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Question, QuestionType } from "../src/types";

// Backend question response type
interface BackendQuestion {
  _id?: string;
  id?: string;
  surveyId: string;
  text: string;
  options: string[];
  type: string;
  order: number;
  required?: boolean;
  description?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Function to convert string type to QuestionType
function convertToQuestionType(type: string): QuestionType {
  const validTypes: QuestionType[] = [
    "short-text",
    "long-text",
    "multiple-choice",
    "checkbox",
    "dropdown",
    "linear-scale",
    "date",
    "time",
  ];

  return validTypes.includes(type as QuestionType)
    ? (type as QuestionType)
    : "short-text";
}

// Safe type assertion function
function assertBackendQuestion(obj: unknown): BackendQuestion {
  if (!obj || typeof obj !== "object") {
    throw new Error("Not a valid question object");
  }

  const question = obj as BackendQuestion;

  // Return with default values for missing properties
  return {
    _id: question._id || "",
    id: question.id || "",
    surveyId: question.surveyId || "",
    text: question.text || "",
    options: question.options || [],
    type: question.type || "short-text",
    order: question.order || 0,
    required: question.required,
    description: question.description,
    minValue: question.minValue,
    maxValue: question.maxValue,
    step: question.step,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
  };
}

export const API_QUESTION = createApi({
  reducerPath: "API_QUESTION",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/question",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Question"],
  endpoints: (builder) => ({
    getQuestions: builder.query<Question[], void>({
      query: () => "/",
      transformResponse: (response: unknown) => {
        console.log("Backend response for questions:", response);
        if (
          !response ||
          typeof response !== "object" ||
          !("questions" in response) ||
          !Array.isArray((response as { questions: unknown[] }).questions)
        ) {
          console.error("Unexpected response format:", response);
          return [];
        }

        try {
          return (response as { questions: unknown[] }).questions.map(
            (questionData: unknown) => {
              const question = assertBackendQuestion(questionData);

              return {
                id: question._id || question.id || "",
                surveyId: question.surveyId || "",
                text: question.text || "",
                options: question.options || [],
                type: convertToQuestionType(question.type),
                order: question.order || 0,
                required: question.required,
                description: question.description,
                minValue: question.minValue,
                maxValue: question.maxValue,
                step: question.step,
                createdAt: question.createdAt,
                updatedAt: question.updatedAt,
              };
            }
          );
        } catch (error) {
          console.error("Error transforming questions:", error);
          return [];
        }
      },
      providesTags: ["Question"],
    }),

    getQuestionsBySurvey: builder.query<Question[], string>({
      query: (surveyId) => `/survey/${surveyId}`,
      transformResponse: (response: unknown) => {
        console.log("Backend response for questions by survey:", response);
        if (
          !response ||
          typeof response !== "object" ||
          !("questions" in response) ||
          !Array.isArray((response as { questions: unknown[] }).questions)
        ) {
          console.error("Unexpected response format:", response);
          return [];
        }

        try {
          return (response as { questions: unknown[] }).questions.map(
            (questionData: unknown) => {
              const question = assertBackendQuestion(questionData);

              return {
                id: question._id || question.id || "",
                surveyId: question.surveyId || "",
                text: question.text || "",
                options: question.options || [],
                type: convertToQuestionType(question.type),
                order: question.order || 0,
                required: question.required,
                description: question.description,
                minValue: question.minValue,
                maxValue: question.maxValue,
                step: question.step,
                createdAt: question.createdAt,
                updatedAt: question.updatedAt,
              };
            }
          );
        } catch (error) {
          console.error("Error transforming questions:", error);
          return [];
        }
      },
      providesTags: (_result, _error, surveyId) => [
        { type: "Question", id: surveyId },
        "Question",
      ],
    }),

    getQuestion: builder.query<Question, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: unknown) => {
        console.log("Backend response for single question:", response);
        if (
          !response ||
          typeof response !== "object" ||
          !("question" in response)
        ) {
          console.error("Empty question response");
          return {
            id: "",
            surveyId: "",
            text: "",
            options: [],
            type: "short-text", // Default type
            order: 0,
          };
        }

        try {
          const backendQuestion = assertBackendQuestion(
            (response as { question: unknown }).question
          );

          return {
            id: backendQuestion._id || backendQuestion.id || "",
            surveyId: backendQuestion.surveyId || "",
            text: backendQuestion.text || "",
            options: backendQuestion.options || [],
            type: convertToQuestionType(backendQuestion.type),
            order: backendQuestion.order || 0,
            required: backendQuestion.required,
            description: backendQuestion.description,
            minValue: backendQuestion.minValue,
            maxValue: backendQuestion.maxValue,
            step: backendQuestion.step,
            createdAt: backendQuestion.createdAt,
            updatedAt: backendQuestion.updatedAt,
          };
        } catch (error) {
          console.error("Error transforming question:", error);
          return {
            id: "",
            surveyId: "",
            text: "",
            options: [],
            type: "short-text" as const,
            order: 0,
          };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Question", id }],
    }),

    createQuestion: builder.mutation<Question, Partial<Question>>({
      query: (questionData) => ({
        url: "/",
        method: "POST",
        body: questionData,
      }),
      invalidatesTags: ["Question"],
    }),

    updateQuestion: builder.mutation<
      Question,
      { id: string; data: Partial<Question> }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Question", id },
        "Question",
      ],
    }),

    deleteQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Question"],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetQuestionsBySurveyQuery,
  useGetQuestionQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = API_QUESTION;
