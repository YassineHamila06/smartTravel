import { createContext, useContext } from "react";
import { Survey, SurveyResponse } from "../types";

interface SurveyContextType {
  surveys: Survey[];
  responses: SurveyResponse[];
  loading: boolean;
  error: string | null;
  addSurvey: (
    survey: Omit<Survey, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateSurvey: (id: string, updatedSurvey: Partial<Survey>) => Promise<void>;
  publishSurvey: (id: string) => Promise<void>;
  deleteSurvey: (id: string) => Promise<void>;
  getSurvey: (id: string) => Promise<Survey | undefined>;
  getSurveyResponses: (surveyId: string) => Promise<SurveyResponse[]>;
  addResponse: (
    surveyId: string,
    response: Omit<SurveyResponse, "id" | "submittedAt">
  ) => Promise<void>;
}

export const SurveyContext = createContext<SurveyContextType | undefined>(
  undefined
);

// Custom hook to use the SurveyContext
export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error("useSurvey must be used within a SurveyProvider");
  }
  return context;
};
