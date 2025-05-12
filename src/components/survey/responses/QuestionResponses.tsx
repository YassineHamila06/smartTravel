import React from "react";
import { useGetResponsesByQuestionQuery } from "../../../../services/RESPONSE-API";
import { useGetQuestionQuery } from "../../../../services/QUESTION-API";

interface QuestionResponsesProps {
  questionId: string;
}

const QuestionResponses: React.FC<QuestionResponsesProps> = ({
  questionId,
}) => {
  // Fetch the question details
  const {
    data: question,
    isLoading: isLoadingQuestion,
    error: questionError,
  } = useGetQuestionQuery(questionId);

  // Fetch responses for this question
  const {
    data: responses = [],
    isLoading: isLoadingResponses,
    error: responsesError,
  } = useGetResponsesByQuestionQuery(questionId);

  if (isLoadingQuestion || isLoadingResponses) {
    return <div className="p-4 text-center">Loading responses...</div>;
  }

  if (questionError || responsesError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading responses. Please try again.
      </div>
    );
  }

  if (!question) {
    return <div className="p-4 text-center">Question not found</div>;
  }

  if (responses.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No responses yet for this question.
      </div>
    );
  }

  // Group responses by value for quantitative analysis
  const valueGroups: Record<string, number> = {};
  responses.forEach((response) => {
    const value = response.value;
    valueGroups[value] = (valueGroups[value] || 0) + 1;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">{question.text}</h3>

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">
          {responses.length} {responses.length === 1 ? "response" : "responses"}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Response Summary</h4>

        <div className="space-y-2">
          {Object.entries(valueGroups).map(([value, count]) => (
            <div key={value} className="flex items-center">
              <div className="w-32 mr-4 truncate">{value}</div>
              <div className="w-full max-w-md">
                <div className="h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(count / responses.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-sm text-gray-600">
                {count} ({((count / responses.length) * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h4 className="font-medium text-gray-700 mb-4">Individual Responses</h4>
        <div className="space-y-3">
          {responses.map((response) => (
            <div
              key={response.id}
              className="p-3 border border-gray-200 rounded-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{response.value}</p>
                  <p className="text-sm text-gray-500">
                    User ID: {response.userId}
                  </p>
                </div>
                {response.answeredAt && (
                  <div className="text-xs text-gray-400">
                    {new Date(response.answeredAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionResponses;
