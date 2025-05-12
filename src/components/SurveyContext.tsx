import React, { useState, useEffect, ReactNode } from "react";
import { Survey, SurveyResponse } from "../types";
import {
  useGetSurveysQuery,
  useCreateSurveyMutation,
  useUpdateSurveyMutation,
  useDeleteSurveyMutation,
  useSubmitResponseMutation,
  usePublishSurveyMutation,
} from "../../services/SURVEY-API";
import { SurveyContext } from "./SurveyContextCore";

// Define a constant for the API base URL
const API_BASE_URL = "http://localhost:5001/survey";

interface SurveyProviderProps {
  children: ReactNode;
}

export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: surveysData,
    isLoading: surveysLoading,
    error: surveysError,
  } = useGetSurveysQuery();
  const [createSurveyMutation] = useCreateSurveyMutation();
  const [updateSurveyMutation] = useUpdateSurveyMutation();
  const [deleteSurveyMutation] = useDeleteSurveyMutation();
  const [submitResponseMutation] = useSubmitResponseMutation();
  const [publishSurveyMutation] = usePublishSurveyMutation();

  // Update local state when RTK Query data changes
  useEffect(() => {
    if (surveysData) {
      setSurveys(surveysData);
    }
  }, [surveysData]);

  // Handle errors from RTK Query
  useEffect(() => {
    if (surveysError) {
      setError("Failed to fetch surveys");
      console.error("Error fetching surveys:", surveysError);
    }
  }, [surveysError]);

  const addSurvey = async (
    survey: Omit<Survey, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const result = await createSurveyMutation(survey).unwrap();
      setSurveys((prev) => [...prev, result]);
      return Promise.resolve();
    } catch (error) {
      setError("Failed to create survey");
      console.error("Error creating survey:", error);
      return Promise.reject(error);
    }
  };

  const updateSurvey = async (id: string, updatedSurvey: Partial<Survey>) => {
    try {
      const result = await updateSurveyMutation({
        id,
        data: updatedSurvey,
      }).unwrap();
      setSurveys((prev) =>
        prev.map((survey) =>
          survey.id === id ? { ...survey, ...result } : survey
        )
      );
      return Promise.resolve();
    } catch (error) {
      setError("Failed to update survey");
      console.error("Error updating survey:", error);
      return Promise.reject(error);
    }
  };

  const publishSurvey = async (id: string) => {
    try {
      const result = await publishSurveyMutation(id).unwrap();
      setSurveys((prev) =>
        prev.map((survey) =>
          survey.id === id ? { ...survey, ...result } : survey
        )
      );
      return Promise.resolve();
    } catch (error) {
      setError("Failed to publish survey");
      console.error("Error publishing survey:", error);
      return Promise.reject(error);
    }
  };

  const deleteSurvey = async (id: string) => {
    try {
      await deleteSurveyMutation(id).unwrap();
      setSurveys((prev) => prev.filter((survey) => survey.id !== id));
      return Promise.resolve();
    } catch (error) {
      setError("Failed to delete survey");
      console.error("Error deleting survey:", error);
      return Promise.reject(error);
    }
  };

  // Create a reference to the hooks, don't call them directly inside a function
  const getSurvey = async (id: string) => {
    try {
      // We can't call the hook conditionally, so we make a fetch request instead
      const response = await fetch(`${API_BASE_URL}/get/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      console.log("Survey response data:", data);

      // Handle different response formats
      if (data && typeof data === "object") {
        // Case 1: { success: true, survey: {...} }
        if (data.success && data.survey) {
          return data.survey as Survey;
        }
        // Case 2: { _id: '...', title: '...', ... }
        else if (data._id || data.id) {
          // Direct survey object
          return data as Survey;
        }
        // Case 3: { survey: {...} } without success flag
        else if (data.survey) {
          return data.survey as Survey;
        }
      }

      setError("Failed to parse survey data");
      return undefined;
    } catch (error) {
      setError("Failed to fetch survey");
      console.error("Error fetching survey:", error);
      return undefined;
    }
  };

  const getSurveyResponses = async (surveyId: string) => {
    try {
      // We can't call the hook conditionally, so we make a fetch request instead
      const response = await fetch(`${API_BASE_URL}/${surveyId}/responses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      console.log("Survey responses data:", data);

      // Handle different response formats
      if (data && typeof data === "object") {
        // Case 1: { success: true, responses: [...] }
        if (data.success && Array.isArray(data.responses)) {
          return data.responses as SurveyResponse[];
        }
        // Case 2: Direct array response
        else if (Array.isArray(data)) {
          return data as SurveyResponse[];
        }
        // Case 3: { responses: [...] } without success flag
        else if (data.responses && Array.isArray(data.responses)) {
          return data.responses as SurveyResponse[];
        }
      }

      setError("Failed to parse response data");
      return [];
    } catch (error) {
      setError("Failed to fetch responses");
      console.error("Error fetching responses:", error);
      return [];
    }
  };

  const addResponse = async (
    surveyId: string,
    response: Omit<SurveyResponse, "id" | "submittedAt">
  ) => {
    try {
      const result = await submitResponseMutation({
        surveyId,
        response,
      }).unwrap();
      setResponses((prev) => [...prev, result]);
      return Promise.resolve();
    } catch (error) {
      setError("Failed to submit response");
      console.error("Error submitting response:", error);
      return Promise.reject(error);
    }
  };

  const loading = surveysLoading;

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        responses,
        loading,
        error,
        addSurvey,
        updateSurvey,
        publishSurvey,
        deleteSurvey,
        getSurvey,
        getSurveyResponses,
        addResponse,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};
