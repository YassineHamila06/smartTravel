import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Survey, SurveyResponse, Question } from "../src/types";

// Backend survey response type
interface BackendSurvey {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  questions?: Array<Question | string> | null;
  status: "draft" | "published" | "completed";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  numberOfRespondents: number;
}

interface SurveysResponse {
  surveys: unknown[];
}

interface SingleSurveyResponse {
  survey: unknown;
}

interface ResponsesResponse {
  responses: unknown[];
}

// Define a safe type assertion function
function assertBackendSurvey(obj: unknown): BackendSurvey {
  if (!obj || typeof obj !== "object") {
    console.error("Invalid survey object:", obj);
    throw new Error("Not a valid survey object");
  }

  console.log("Asserting backend survey from:", obj);
  const survey = obj as BackendSurvey;

  // Check required fields
  if (!survey.title) {
    console.warn("Survey missing title:", survey);
  }

  if (!survey.status) {
    console.warn("Survey missing status:", survey);
  }

  // Return with default values for missing properties
  const result = {
    _id: survey._id || "",
    id: survey.id || survey._id || "", // Use _id as fallback for id
    title: survey.title || "Untitled Survey",
    description: survey.description || "",
    questions: survey.questions || [],
    status: survey.status || "draft",
    createdAt: survey.createdAt || new Date().toISOString(),
    updatedAt: survey.updatedAt || new Date().toISOString(),
    isActive: typeof survey.isActive === "boolean" ? survey.isActive : false,
    numberOfRespondents: survey.numberOfRespondents || 0,
  };

  console.log("Processed backend survey:", result);
  return result;
}

export const API_SURVEY = createApi({
  reducerPath: "API_SURVEY",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/survey",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      console.log(
        "Sending request with headers:",
        Object.fromEntries(headers.entries())
      );
      return headers;
    },
  }),
  tagTypes: ["Survey"],
  endpoints: (builder) => ({
    getSurveys: builder.query<Survey[], void>({
      query: () => "/get",
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Error fetching surveys:", error);
        }
      },
      transformResponse: (response: unknown) => {
        console.log("Backend response for surveys (raw):", response);
        console.log("Response type:", typeof response);
        if (Array.isArray(response)) {
          console.log("Response is an array with length:", response.length);
        }

        // Handle both formats: array directly or object with surveys property
        let surveysArray: unknown[] = [];

        if (Array.isArray(response)) {
          // If response is directly an array of surveys
          console.log("Using direct array response");
          surveysArray = response;
        } else if (
          response &&
          typeof response === "object" &&
          "surveys" in response &&
          Array.isArray((response as SurveysResponse).surveys)
        ) {
          // If response is an object with surveys property
          console.log("Using surveys property from response object");
          surveysArray = (response as SurveysResponse).surveys;
        } else {
          console.error("Unexpected response format:", response);
          return [];
        }

        console.log("Surveys array to process:", surveysArray);

        try {
          const mappedSurveys = surveysArray.map((surveyData: unknown) => {
            console.log("Processing survey data:", surveyData);
            const survey = assertBackendSurvey(surveyData);

            // Transform backend survey format to frontend Survey type
            return {
              id: survey._id || survey.id || "",
              title: survey.title,
              description: survey.description,
              questions: survey.questions || ([] as (Question | string)[]),
              status: survey.status,
              createdAt: survey.createdAt,
              updatedAt: survey.updatedAt,
              isActive: survey.isActive,
              numberOfRespondents: survey.numberOfRespondents,
            } as Survey;
          });

          console.log("Mapped surveys:", mappedSurveys);
          return mappedSurveys;
        } catch (error) {
          console.error("Error transforming surveys:", error);
          return [];
        }
      },
      providesTags: ["Survey"],
    }),

    getSurveyById: builder.query<Survey, string>({
      query: (id) => `get/${id}`,
      transformResponse: (response: unknown) => {
        console.log("Backend response for single survey:", response);
        if (
          !response ||
          typeof response !== "object" ||
          !("survey" in response)
        ) {
          console.error("Empty survey response");
          return {
            id: "",
            title: "Unknown Survey",
            description: "",
            questions: [] as Question[],
            status: "draft" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: false,
            numberOfRespondents: 0,
          } as Survey;
        }

        try {
          const backendSurvey = assertBackendSurvey(
            (response as SingleSurveyResponse).survey
          );

          return {
            id: backendSurvey._id || backendSurvey.id || "",
            title: backendSurvey.title,
            description: backendSurvey.description,
            questions: backendSurvey.questions || ([] as (Question | string)[]),
            status: backendSurvey.status,
            createdAt: backendSurvey.createdAt,
            updatedAt: backendSurvey.updatedAt,
            isActive: backendSurvey.isActive,
            numberOfRespondents: backendSurvey.numberOfRespondents,
          } as Survey;
        } catch (error) {
          console.error("Error transforming survey:", error);
          return {
            id: "",
            title: "Unknown Survey",
            description: "",
            questions: [] as Question[],
            status: "draft" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: false,
            numberOfRespondents: 0,
          } as Survey;
        }
      },
      providesTags: ["Survey"],
    }),
    completeSurvey: builder.mutation<Survey, string>({
      query: (surveyId) => ({
        url: `/complete/${surveyId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Survey"],
    }),
    

    createSurvey: builder.mutation<Survey, Partial<Survey>>({
      query: (surveyData) => ({
        url: "/add",
        method: "POST",
        body: surveyData,
      }),
      invalidatesTags: ["Survey"],
    }),

    updateSurvey: builder.mutation<
      Survey,
      { id: string; data: Partial<Survey> }
    >({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Survey"],
    }),

    deleteSurvey: builder.mutation<void, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Survey"],
    }),

    getSurveyResponses: builder.query<SurveyResponse[], string>({
      query: (surveyId) => `/${surveyId}/responses`,
      transformResponse: (response: unknown) => {
        if (
          !response ||
          typeof response !== "object" ||
          !("responses" in response) ||
          !Array.isArray((response as ResponsesResponse).responses)
        ) {
          console.error("Unexpected response format for responses:", response);
          return [];
        }
        return (response as ResponsesResponse).responses as SurveyResponse[];
      },
      providesTags: ["Survey"],
    }),

    submitResponse: builder.mutation<
      SurveyResponse,
      { surveyId: string; response: Omit<SurveyResponse, "id" | "submittedAt"> }
    >({
      query: ({ surveyId, response }) => ({
        url: `/${surveyId}/submit`,
        method: "POST",
        body: response,
      }),
      invalidatesTags: ["Survey"],
    }),

    publishSurvey: builder.mutation<Survey, string>({
      query: (surveyId) => ({
        url: `/publish/${surveyId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Survey"],
    }),
  }),
});

export const {
  useGetSurveysQuery,
  useGetSurveyByIdQuery,
  useCreateSurveyMutation,
  useUpdateSurveyMutation,
  useDeleteSurveyMutation,
  useGetSurveyResponsesQuery,
  useSubmitResponseMutation,
  usePublishSurveyMutation,
  useCompleteSurveyMutation,
} = API_SURVEY;
