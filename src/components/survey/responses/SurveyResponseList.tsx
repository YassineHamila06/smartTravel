import React, { useState, useEffect } from "react";
import { SurveyResponse, Survey, Question } from "../../../types";

interface SurveyResponseListProps {
  survey: Survey;
  responses: SurveyResponse[];
  onViewDetails?: (response: SurveyResponse) => void;
}

const SurveyResponseList: React.FC<SurveyResponseListProps> = ({
  survey,
  responses,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Build a map of question IDs to question text for easier display
  const [questionMap, setQuestionMap] = useState<Record<string, Question>>({});

  useEffect(() => {
    const map: Record<string, Question> = {};
    survey.sections.forEach((section) => {
      (section.questions as Question[]).forEach((question) => {
        map[question.id] = question;
      });
    });
    setQuestionMap(map);
  }, [survey]);

  // Filter responses by search term
  const filteredResponses = responses.filter((response) => {
    return (
      response.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.answers.some(
        (answer) =>
          questionMap[answer.questionId]?.text
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          answer.value
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    );
  });

  // Sort responses
  const sortedResponses = [...filteredResponses].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      const nameA = a.userName.toLowerCase();
      const nameB = b.userName.toLowerCase();
      return sortDir === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
  });

  const toggleSort = (field: "date" | "name") => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Extract a summary of responses for display
  const getSummary = (response: SurveyResponse): string => {
    const answerTexts = response.answers.map((answer) => {
      const question = questionMap[answer.questionId];
      if (!question) return "";

      // Truncate long answers
      let answerValue = answer.value.toString();
      if (answerValue.length > 30) {
        answerValue = answerValue.substring(0, 30) + "...";
      }

      // Format specific question types
      if (
        question.type === "multiple-choice" ||
        question.type === "checkbox" ||
        question.type === "dropdown"
      ) {
        // For these types, try to interpret JSON if it's a stringified array
        try {
          const parsedValue = JSON.parse(answerValue);
          if (Array.isArray(parsedValue)) {
            answerValue = parsedValue.join(", ");
          }
        } catch {
          // Not JSON or not an array, keep original value
        }
      }

      return `${question.text}: ${answerValue}`;
    });

    // Get the first few answers for summary
    return answerTexts.slice(0, 2).join(" | ");
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 bg-blue-600 text-white">
        <h2 className="text-2xl font-bold">Responses for {survey.title}</h2>
        <p className="mt-2 text-sm">
          {responses.length} {responses.length === 1 ? "response" : "responses"}{" "}
          received
        </p>
      </div>

      <div className="p-6">
        {/* Search and Filter Controls */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No responses have been submitted yet.
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No responses match your search.
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      Respondent
                      {sortBy === "name" && (
                        <span className="ml-1">
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => toggleSort("date")}
                    >
                      Submitted
                      {sortBy === "date" && (
                        <span className="ml-1">
                          {sortDir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Summary
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedResponses.map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {response.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(response.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {getSummary(response)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            onViewDetails && onViewDetails(response)
                          }
                          className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponseList;
