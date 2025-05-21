import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  BarChart2,
  AlertCircle,
  Loader,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { useGetResponsesBySurveyQuery } from "../../../../services/RESPONSE-API";
import { useGetSurveyByIdQuery } from "../../../../services/SURVEY-API";
import { useGetusersQuery } from "../../../../services/USER-API";
import { Question, User } from "../../../types";

interface ResponseWithUser {
  id: string;
  questionId: string;
  userId: string;
  value: string;
  answeredAt?: string;
  user: User | null;
  question: Question | null;
}

const SurveyResponsesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"responses" | "analytics">(
    "responses"
  );
  const [responsesWithUsers, setResponsesWithUsers] = useState<
    ResponseWithUser[]
  >([]);

  // Fetch survey details
  const {
    data: survey,
    isLoading: isSurveyLoading,
    error: surveyError,
  } = useGetSurveyByIdQuery(id || "");

  // Fetch survey responses
  const {
    data: responses,
    isLoading: isResponsesLoading,
    error: responsesError,
  } = useGetResponsesBySurveyQuery(id || "");

  // Fetch all users
  const {
    data: users,
    isLoading: isUsersLoading,
    error: usersError,
  } = useGetusersQuery();

  // Process and combine responses with user data
  useEffect(() => {
    if (responses && users && survey) {
      const enrichedResponses = responses.map((response) => {
        const user = users.find((u) => u.id === response.userId) || null;

        // Find question from survey
        let question = null;
        if (survey.questions) {
          const foundQuestion = survey.questions.find((q) => {
            if (typeof q === "string") return false;
            return (
              (q as Question)._id === (response.questionId as any)._id ||
              (q as Question)._id === response.questionId
            );
          });

          if (foundQuestion && typeof foundQuestion !== "string") {
            question = foundQuestion as Question;
          }
        }

        return {
          ...response,
          id: response.id || "", // Ensure id is always a string
          user,
          question,
        } as ResponseWithUser; // Type assertion to ensure it matches ResponseWithUser
      });

      setResponsesWithUsers(enrichedResponses);
    }
  }, [responses, users, survey]);

  const goBack = () => {
    navigate("/surveys");
  };
  console.log("responses", responses);

  // Group responses by user
  const responsesByUser = responsesWithUsers.reduce((acc, response) => {
    const userId =
      typeof response.userId === "string"
        ? response.userId
        : response.userId?._id;

    if (!userId) return acc;

    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(response);
    return acc;
  }, {} as Record<string, ResponseWithUser[]>);

  // Find a question by its ID
  const getQuestionText = (questionId: any) => {
    if (!questionId) return "Unknown Question";

    if (typeof questionId === "object" && questionId.text) {
      return questionId.text;
    }

    // fallback if still passed a string (rare)
    if (!survey || !survey.questions) return "Unknown Question";

    const question = survey.questions.find((q) => {
      if (typeof q === "string") return false;
      return (q as Question).id === questionId;
    });

    if (!question || typeof question === "string") {
      return "Unknown Question";
    }

    return (question as Question).text || "Unknown Question";
  };
  console.log("survey", survey);

  // Order responses according to question order in survey
  const getOrderedResponses = (userResponses: ResponseWithUser[]) => {
    if (!survey || !survey.questions) return userResponses;

    // Create a map of question IDs to their order
    const questionOrderMap = new Map<string, number>();
    survey.questions.forEach((q, index) => {
      questionOrderMap.set(q.id, index);
    });

    // Sort responses based on question order
    return [...userResponses].sort((a, b) => {
      const orderA = questionOrderMap.get(a.questionId) ?? Number.MAX_VALUE;
      const orderB = questionOrderMap.get(b.questionId) ?? Number.MAX_VALUE;
      return orderA - orderB;
    });
  };

  // Loading state
  if (isSurveyLoading || isResponsesLoading || isUsersLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2 text-lg text-gray-600">
            Loading responses...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (surveyError || responsesError || usersError) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64 flex-col">
          <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
          <h2 className="text-xl font-semibold text-red-600">
            Error Loading Data
          </h2>
          <p className="text-gray-600">
            {surveyError
              ? "Failed to load survey details"
              : responsesError
              ? "Failed to load responses"
              : "Failed to load user information"}
          </p>
          <button
            onClick={goBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={goBack}
          className="mr-2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold">
            {survey?.title || "Survey Results"}
          </h1>
          {survey?.description && (
            <p className="text-gray-500 mt-1">{survey.description}</p>
          )}
        </div>
      </div>

      <div className="mb-6 flex border-b">
        <button
          className={`py-2 px-4 border-b-2 ${
            activeTab === "responses"
              ? "border-blue-500 text-blue-600 font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("responses")}
        >
          <div className="flex items-center space-x-2">
            <FileText size={18} />
            <span>Responses</span>
          </div>
        </button>
        <button
          className={`py-2 px-4 border-b-2 ${
            activeTab === "analytics"
              ? "border-blue-500 text-blue-600 font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          <div className="flex items-center space-x-2">
            <BarChart2 size={18} />
            <span>Analytics</span>
          </div>
        </button>
      </div>

      {activeTab === "responses" ? (
        <div className="responses-container">
          <h2 className="text-lg font-medium mb-4">Individual Responses</h2>

          {Object.entries(responsesByUser).map(([userKey, userResponses]) => {
            const user = userResponses[0]?.userId;

            return (
              <div
                key={userKey}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6"
              >
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h3 className="font-semibold text-lg mb-1">
                    {user?.name} {user?.lastname ?? ""}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <UserIcon size={14} className="mr-1" />
                    <span className="mr-4">
                      {user?.name} {user?.lastname ?? ""}
                    </span>
                    <Mail size={14} className="mr-1" />
                    <span>{user?.email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {userResponses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-white p-3 rounded border border-gray-100 shadow-sm"
                    >
                      <p className="font-medium text-gray-700">
                        {getQuestionText(response.questionId)}
                      </p>
                      <p className="mt-1 text-gray-600">{response.value}</p>
                      {response.answeredAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          Answered:{" "}
                          {new Date(response.answeredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="analytics-container">
          <h2 className="text-lg font-medium mb-4">Response Analytics</h2>
          <p className="text-gray-500 mb-4">
            A summary of responses collected for this survey.
          </p>

          {responses && responses.length > 0 ? (
            <div>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Responses</p>
                      <p className="text-xl font-bold">
                        {Object.keys(responsesByUser).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Questions</p>
                      <p className="text-xl font-bold">
                        {survey?.questions?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Answers</p>
                      <p className="text-xl font-bold">{responses.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic analytics would go here */}
              <p className="italic text-gray-500">
                Detailed analytics visualization coming soon
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No data available for analytics.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveyResponsesPage;
