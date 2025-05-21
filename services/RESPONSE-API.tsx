import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Response type definition
export interface Response {
  id?: string;
  questionId: string;
  userId: string;
  value: string;
  answeredAt?: string;
}

// Backend response type
interface BackendResponse {
  _id?: string;
  id?: string;
  questionId: string;
  userId: string;
  value: string;
  answeredAt?: string;
}

// Safe type assertion function
function assertBackendResponse(obj: unknown): BackendResponse {
  if (!obj || typeof obj !== "object") {
    throw new Error("Not a valid response object");
  }

  const response = obj as BackendResponse;

  // Return with default values for missing properties
  return {
    _id: response._id || "",
    id: response.id || "",
    questionId: response.questionId || "",
    userId: response.userId || "",
    value: response.value || "",
    answeredAt: response.answeredAt,
  };
}

export const API_RESPONSE = createApi({
  reducerPath: "API_RESPONSE",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/response",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Response"],
  endpoints: (builder) => ({
    // Get all responses
    getResponses: builder.query<Response[], void>({
      query: () => "/get",
      transformResponse: (response: unknown) => {
        console.log("Backend response for responses:", response);
        if (
          !response ||
          typeof response !== "object" ||
          !("responses" in response) ||
          !Array.isArray((response as { responses: unknown[] }).responses)
        ) {
          console.error("Unexpected response format:", response);
          return [];
        }

        try {
          return (response as { responses: unknown[] }).responses.map(
            (responseData: unknown) => {
              const backendResponse = assertBackendResponse(responseData);

              return {
                id: backendResponse._id || backendResponse.id || "",
                questionId: backendResponse.questionId,
                userId: backendResponse.userId,
                value: backendResponse.value,
                answeredAt: backendResponse.answeredAt,
              };
            }
          );
        } catch (error) {
          console.error("Error transforming responses:", error);
          return [];
        }
      },
      providesTags: ["Response"],
    }),

    // Get response by ID
    getResponse: builder.query<Response, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: unknown) => {
        console.log("Backend response for single response:", response);
        if (
          !response ||
          typeof response !== "object" ||
          !("response" in response)
        ) {
          console.error("Empty response");
          return {
            id: "",
            questionId: "",
            userId: "",
            value: "",
          };
        }

        try {
          const backendResponse = assertBackendResponse(
            (response as { response: unknown }).response
          );

          return {
            id: backendResponse._id || backendResponse.id || "",
            questionId: backendResponse.questionId,
            userId: backendResponse.userId,
            value: backendResponse.value,
            answeredAt: backendResponse.answeredAt,
          };
        } catch (error) {
          console.error("Error transforming response:", error);
          return {
            id: "",
            questionId: "",
            userId: "",
            value: "",
          };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Response", id }],
    }),

    // Get responses by question ID
    getResponsesByQuestion: builder.query<Response[], string>({
      query: (questionId) => `/get?questionId=${questionId}`,
      transformResponse: (response: unknown) => {
        if (
          !response ||
          typeof response !== "object" ||
          !("responses" in response) ||
          !Array.isArray((response as { responses: unknown[] }).responses)
        ) {
          console.error("Unexpected response format:", response);
          return [];
        }

        try {
          return (response as { responses: unknown[] }).responses.map(
            (responseData: unknown) => {
              const backendResponse = assertBackendResponse(responseData);

              return {
                id: backendResponse._id || backendResponse.id || "",
                questionId: backendResponse.questionId,
                userId: backendResponse.userId,
                value: backendResponse.value,
                answeredAt: backendResponse.answeredAt,
              };
            }
          );
        } catch (error) {
          console.error("Error transforming responses:", error);
          return [];
        }
      },
      providesTags: (_result, _error, questionId) => [
        { type: "Response", id: `question-${questionId}` },
        "Response",
      ],
    }),

    // Get responses by user ID
    getResponsesByUser: builder.query<Response[], string>({
      query: (userId) => `/get?userId=${userId}`,
      transformResponse: (response: unknown) => {
        if (
          !response ||
          typeof response !== "object" ||
          !("responses" in response) ||
          !Array.isArray((response as { responses: unknown[] }).responses)
        ) {
          console.error("Unexpected response format:", response);
          return [];
        }

        try {
          return (response as { responses: unknown[] }).responses.map(
            (responseData: unknown) => {
              const backendResponse = assertBackendResponse(responseData);

              return {
                id: backendResponse._id || backendResponse.id || "",
                questionId: backendResponse.questionId,
                userId: backendResponse.userId,
                value: backendResponse.value,
                answeredAt: backendResponse.answeredAt,
              };
            }
          );
        } catch (error) {
          console.error("Error transforming responses:", error);
          return [];
        }
      },
      providesTags: (_result, _error, userId) => [
        { type: "Response", id: `user-${userId}` },
        "Response",
      ],
    }),

    // Create a new response
    createResponse: builder.mutation<Response, Partial<Response>>({
      query: (responseData) => ({
        url: "/add",
        method: "POST",
        body: responseData,
      }),
      invalidatesTags: ["Response"],
    }),

    // Update a response
    updateResponse: builder.mutation<
      Response,
      { id: string; data: Partial<Response> }
    >({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Response", id },
        "Response",
      ],
    }),

    // Delete a response
    deleteResponse: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Response", id },
        "Response",
      ],
    }),
    getResponsesBySurvey: builder.query<Response[], string>({
      query: (surveyId) => `/get-by-survey/${surveyId}`,
      transformResponse: (response: unknown) => {
        if (
          !response ||
          typeof response !== "object" ||
          !("data" in response) ||
          !Array.isArray((response as any).data.responses)
        ) {
          console.error("Unexpected response format:", response);
          return [];
        }
    
        try {
          return (response as { data: { responses: unknown[] } }).data.responses.map(
            (responseData: unknown) => {
              const backendResponse = assertBackendResponse(responseData);
              return {
                id: backendResponse._id || backendResponse.id || "",
                questionId: backendResponse.questionId,
                userId: backendResponse.userId,
                value: backendResponse.value,
                answeredAt: backendResponse.answeredAt,
              };
            }
          );
        } catch (error) {
          console.error("Error transforming responses by survey:", error);
          return [];
        }
      },
      providesTags: (_result, _error, surveyId) => [
        { type: "Response", id: `survey-${surveyId}` },
        "Response",
      ],
    }),
  }),
});

export const {
  useGetResponsesQuery,
  useGetResponseQuery,
  useGetResponsesByQuestionQuery,
  useGetResponsesByUserQuery,
  useCreateResponseMutation,
  useUpdateResponseMutation,
  useDeleteResponseMutation,
  useGetResponsesBySurveyQuery,
} = API_RESPONSE;
