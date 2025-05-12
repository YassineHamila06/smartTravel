import React, { useState } from "react";
import { Survey, SurveyAnswer, Question } from "../../types";
import QuestionComponent from "./questions/QuestionComponent";

interface SurveyFormProps {
  survey: Survey;
  onSubmit?: (answers: SurveyAnswer[]) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ survey, onSubmit }) => {
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | number>
  >({});
  const [currentPage, setCurrentPage] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Group questions into pages (5 questions per page)
  const QUESTIONS_PER_PAGE = 5;
  const sortedQuestions = [...(survey.questions as Question[])].sort(
    (a, b) => a.order - b.order
  );
  const totalPages = Math.ceil(sortedQuestions.length / QUESTIONS_PER_PAGE);

  const currentPageQuestions = sortedQuestions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const handleAnswerChange = (
    questionId: string,
    value: string | string[] | number
  ) => {
    setAnswers({ ...answers, [questionId]: value });

    // Clear error for this question if it exists
    if (errors[questionId]) {
      const newErrors = { ...errors };
      delete newErrors[questionId];
      setErrors(newErrors);
    }
  };

  const validatePage = (pageIndex: number) => {
    const pageQuestions = sortedQuestions.slice(
      pageIndex * QUESTIONS_PER_PAGE,
      (pageIndex + 1) * QUESTIONS_PER_PAGE
    );
    const newErrors: Record<string, string> = {};

    pageQuestions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id];
        if (
          answer === undefined ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          newErrors[question.id] = "This question requires an answer";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage(currentPage)) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentPage(currentPage - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePage(currentPage)) {
      return;
    }

    // Convert answers to the format expected by onSubmit
    const formattedAnswers: SurveyAnswer[] = Object.entries(answers).map(
      ([questionId, value]) => ({
        questionId,
        // In the backend model, value must be a string
        value:
          typeof value === "object" ? JSON.stringify(value) : String(value),
        userId: "current-user-id", // This would typically come from authentication context
      })
    );

    if (onSubmit) {
      onSubmit(formattedAnswers);
    }
  };

  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 bg-blue-600 text-white">
        <h1 className="text-2xl font-bold">{survey.title}</h1>
        {survey.description && <p className="mt-2">{survey.description}</p>}
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${((currentPage + 1) / totalPages) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {currentPageQuestions.map((question) => (
            <div
              key={question.id}
              className="border-b border-gray-200 pb-6 last:border-0"
            >
              <QuestionComponent
                question={question}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                error={errors[question.id]}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          {currentPage > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Back
            </button>
          )}

          <div className={currentPage > 0 ? "ml-auto" : ""}>
            {isLastPage ? (
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SurveyForm;
