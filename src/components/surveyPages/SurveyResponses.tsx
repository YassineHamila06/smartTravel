import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Filter, Download, BarChart2 } from "lucide-react";
import { SurveyResponse } from "../../types";
import QuestionResponses from "../survey/responses/QuestionResponses";

// Import from services (adjust paths as needed)
import { useGetSurveyByIdQuery } from "../../../services/SURVEY-API";
import { useGetQuestionsBySurveyQuery } from "../../../services/QUESTION-API";

const SurveyResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Fetch survey data
  const {
    data: survey,
    isLoading: isLoadingSurvey,
    error: surveyError,
  } = useGetSurveyByIdQuery(id || "");

  // Fetch questions for this survey
  const {
    data: questions = [],
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useGetQuestionsBySurveyQuery(id || "");

  // Loading state for responses
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);

  useEffect(() => {
    // Simulate loading time for responses based on questions
    if (questions.length > 0) {
      setIsLoadingResponses(false);

      // In a real implementation, we would aggregate responses from multiple questions
      // For now, we'll leave the mock data for the table view
      // but we'll use real data for the individual question response views
    }
  }, [questions]);

  if (isLoadingSurvey || isLoadingQuestions || isLoadingResponses) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (surveyError || questionsError || !survey) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading survey data. Please try again.
      </div>
    );
  }

  // For the table view, we'll continue using mock responses temporarily
  // This would be replaced with real aggregated data from the API
  const mockResponses: SurveyResponse[] = [
    {
      id: "resp1",
      surveyId: id || "1",
      userId: "u1",
      userName: "Alice Johnson",
      submittedAt: "2025-04-21T13:30:00Z",
      answers: [
        { questionId: questions[0]?.id || "q1", value: "Paris", userId: "u1" },
        { questionId: questions[1]?.id || "q2", value: "Luxury", userId: "u1" },
      ],
      metadata: {
        preferredDestination: "Paris",
        travelStyle: "Luxury",
        budget: "2000-3000 USD",
        travelDates: "June 2025",
        groupSize: 2,
        interests: ["Museums", "Fine Dining"],
        additionalNotes: "Prefer 5-star hotels",
      },
    },
    {
      id: "resp2",
      surveyId: id || "1",
      userId: "u2",
      userName: "Bob Smith",
      submittedAt: "2025-04-20T11:15:00Z",
      answers: [
        { questionId: questions[0]?.id || "q1", value: "Tokyo", userId: "u2" },
        {
          questionId: questions[1]?.id || "q2",
          value: "Adventure",
          userId: "u2",
        },
      ],
      metadata: {
        preferredDestination: "Tokyo",
        travelStyle: "Adventure",
        budget: "1500-2000 USD",
        travelDates: "May 2025",
        groupSize: 4,
        interests: ["Technology", "Culture"],
        additionalNotes: "Wants to attend a festival",
      },
    },
  ];

  const filteredResponses = mockResponses.filter((response) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      response.userName.toLowerCase().includes(searchLower) ||
      response.metadata?.preferredDestination
        ?.toLowerCase()
        .includes(searchLower) ||
      response.metadata?.travelStyle?.toLowerCase().includes(searchLower)
    );
  });

  const formatAnswerValue = (value: string | string[] | number | Date) => {
    if (Array.isArray(value)) return value.join(", ");
    if (value instanceof Date) return value.toLocaleDateString();
    return value.toString();
  };

  const getAnswerByQuestionId = (
    response: SurveyResponse,
    questionId: string
  ) => {
    const answer = response.answers.find((a) => a.questionId === questionId);
    return answer ? formatAnswerValue(answer.value) : "-";
  };

  const getQuestionTitle = (questionId: string) => {
    for (const question of questions) {
      if (question.id === questionId) return question.text;
    }
    return questionId;
  };

  const allQuestionIds = questions.map((question) => question.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold">
                  {survey.title} - Responses
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/analytics/${survey.id}`)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md border border-blue-200 flex items-center space-x-2 hover:bg-blue-100 transition-colors duration-200"
              >
                <BarChart2 size={18} />
                <span>View Analytics</span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 hover:bg-green-700 transition-colors duration-200">
                <Download size={18} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabs for different views */}
          <div className="border-b border-gray-200">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("summary")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "summary"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Summary Table
              </button>
              {questions.length > 0 && (
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === "questions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Question Analysis
                </button>
              )}
            </nav>
          </div>

          {activeTab === "summary" ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500">
                      {filteredResponses.length}{" "}
                      {filteredResponses.length === 1
                        ? "response"
                        : "responses"}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setFilterOpen(!filterOpen)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Filter size={20} />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search responses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Respondent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      {allQuestionIds.map((questionId) => (
                        <th
                          key={questionId}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {getQuestionTitle(questionId)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResponses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2 + allQuestionIds.length}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No responses found
                        </td>
                      </tr>
                    ) : (
                      filteredResponses.map((response) => (
                        <tr key={response.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {response.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {response.userId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(response.submittedAt).toLocaleString()}
                          </td>
                          {allQuestionIds.map((questionId) => (
                            <td
                              key={questionId}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {getAnswerByQuestionId(response, questionId)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Response Analysis by Question
              </h2>

              {/* Here we'll display the question responses using our new component */}
              <div className="space-y-8">
                {questions.map((question) => (
                  <QuestionResponses
                    key={question.id}
                    questionId={question.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyResponses;
