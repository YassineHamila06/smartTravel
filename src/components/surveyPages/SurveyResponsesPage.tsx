import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SurveyResponseList } from "../survey";
import { useSurvey } from "../SurveyContextCore";
import { Survey, SurveyResponse } from "../../types";

const SurveyResponsesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getSurvey, getSurveyResponses } = useSurvey();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch survey details
        const surveyData = await getSurvey(id);
        if (!surveyData) {
          setError("Survey not found");
          return;
        }
        setSurvey(surveyData);

        // Fetch survey responses
        const responseData = await getSurveyResponses(id);
        setResponses(responseData);
      } catch (err) {
        setError("Error fetching survey data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getSurvey, getSurveyResponses]);

  const handleViewDetails = (response: SurveyResponse) => {
    // This could navigate to a detailed view, or open a modal
    console.log("Viewing response details:", response);
    // For example: navigate(`/responses/${id}/details/${response.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-8 text-gray-500">
        Survey not found or could not be loaded.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Survey Responses</h1>
        <button
          onClick={() => navigate(`/surveys`)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Back to Surveys
        </button>
      </div>

      <SurveyResponseList
        survey={survey}
        responses={responses}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default SurveyResponsesPage;
