import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Question } from "../../../types";
import QuestionComponent from "./QuestionComponent";
import { useCreateResponseMutation } from "../../../../services/RESPONSE-API";
import { useGetQuestionsBySurveyQuery } from "../../../../services/QUESTION-API";

interface SurveyResponseFormProps {
  surveyId: string;
  userId: string;
}

const SurveyResponseForm: React.FC<SurveyResponseFormProps> = ({
  surveyId,
  userId,
}) => {
  const navigate = useNavigate();

  // Fetch questions for this survey
  const {
    data: questions = [],
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useGetQuestionsBySurveyQuery(surveyId);

  // Create response mutation
  const [createResponse, { isLoading: isSubmitting }] =
    useCreateResponseMutation();

  // State for form answers
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | number>
  >({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Function to handle answer changes
  const handleAnswerChange = (
    questionId: string,
    value: string | string[] | number
  ) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));

    // Clear error when user provides an answer
    if (formErrors[questionId]) {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Function to validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Check required questions
    questions.forEach((question: Question) => {
      if (
        question.required &&
        (!answers[question.id] || answers[question.id] === "")
      ) {
        newErrors[question.id] = "This question is required";
        isValid = false;
      }
    });

    setFormErrors(newErrors);
    return isValid;
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Submit each answer as a separate response
      const submissionPromises = Object.entries(answers).map(
        ([questionId, value]) => {
          return createResponse({
            questionId,
            userId,
            value: value.toString(), // Convert all value types to string for storage
          });
        }
      );

      await Promise.all(submissionPromises);

      // Show success message
      alert("Responses submitted successfully!");

      // Navigate back to surveys or to a thank you page
      navigate("/surveys");
    } catch (error) {
      console.error("Error submitting responses:", error);
      alert("Failed to submit responses. Please try again.");
    }
  };

  if (isLoadingQuestions) {
    return <div className="p-6 text-center">Loading questions...</div>;
  }

  if (questionsError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading questions. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Survey Response Form</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {questions.map((question: Question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <QuestionComponent
                question={question}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                error={formErrors[question.id]}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/surveys")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm mr-4 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Responses"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurveyResponseForm;
