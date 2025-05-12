import React, { useState, useEffect } from "react";
import { Survey, Question, QuestionType } from "../../../types";
import { v4 as uuidv4 } from "uuid";

interface SurveyEditorProps {
  initialSurvey?: Survey;
  onSave: (survey: Survey) => void;
}

// Helper function to create a default question (outside component)
function createDefaultQuestion(surveyId: string = "temp-id"): Question {
  return {
    id: uuidv4(),
    surveyId: surveyId,
    text: "Untitled Question",
    type: "short-text",
    options: [],
    order: 0,
    required: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Helper function to ensure questions is a proper array of Question objects
function ensureQuestionsArray(
  questions: Question[] | string[] | null | undefined
): Question[] {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return [createDefaultQuestion()];
  }

  // If questions are strings (references), convert them to basic Question objects
  if (typeof questions[0] === "string") {
    return questions.map(() => createDefaultQuestion());
  }

  return questions as Question[];
}

const SurveyEditor: React.FC<SurveyEditorProps> = ({
  initialSurvey,
  onSave,
}) => {
  const [survey, setSurvey] = useState<Survey>(() => {
    if (initialSurvey) {
      // Ensure questions is a proper array when initializing from an existing survey
      return {
        ...initialSurvey,
        questions: ensureQuestionsArray(initialSurvey.questions),
      };
    }

    // Create a new survey with default values
    const id = uuidv4();
    return {
      id: id,
      title: "Untitled Survey",
      description: "",
      questions: [createDefaultQuestion(id)],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      numberOfRespondents: 0,
    };
  });

  // Effect to handle initialSurvey changes (e.g., when fetched asynchronously)
  useEffect(() => {
    if (initialSurvey) {
      setSurvey({
        ...initialSurvey,
        questions: ensureQuestionsArray(initialSurvey.questions),
      });
    }
  }, [initialSurvey]);

  // Updates the survey title/description
  const updateSurveyField = (field: "title" | "description", value: string) => {
    setSurvey({
      ...survey,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add a question to the survey
  const addQuestion = () => {
    const questions = ensureQuestionsArray(survey.questions);
    const newQuestion = {
      ...createDefaultQuestion(survey.id),
      order: questions.length,
    };

    setSurvey({
      ...survey,
      questions: [...questions, newQuestion],
      updatedAt: new Date().toISOString(),
    });
  };

  // Update a question
  const updateQuestion = (
    questionIndex: number,
    field: keyof Question,
    value: string | number | boolean | string[]
  ) => {
    const questions = ensureQuestionsArray(survey.questions);
    const updatedQuestions = [...questions];

    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    setSurvey({
      ...survey,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete a question
  const deleteQuestion = (questionIndex: number) => {
    const questions = ensureQuestionsArray(survey.questions);
    if (questions.length <= 1) {
      alert("Survey must have at least one question");
      return;
    }

    const updatedQuestions = [...questions];
    updatedQuestions.splice(questionIndex, 1);

    // Update order of remaining questions
    updatedQuestions.forEach((question, idx) => {
      question.order = idx;
    });

    setSurvey({
      ...survey,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add an option to a multiple choice/checkbox question
  const addOption = (questionIndex: number) => {
    const questions = ensureQuestionsArray(survey.questions);
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];

    if (!question.options) {
      question.options = [];
    }

    const updatedOptions = [
      ...question.options,
      `Option ${question.options.length + 1}`,
    ];

    updatedQuestions[questionIndex] = {
      ...question,
      options: updatedOptions,
      updatedAt: new Date().toISOString(),
    };

    setSurvey({
      ...survey,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update an option
  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const questions = ensureQuestionsArray(survey.questions);
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];

    if (!question.options) {
      question.options = [];
    }

    const updatedOptions = [...question.options];
    updatedOptions[optionIndex] = value;

    updatedQuestions[questionIndex] = {
      ...question,
      options: updatedOptions,
      updatedAt: new Date().toISOString(),
    };

    setSurvey({
      ...survey,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete an option
  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const questions = ensureQuestionsArray(survey.questions);
    const question = questions[questionIndex];

    if (!question.options || question.options.length <= 2) {
      alert("Multiple choice questions must have at least two options");
      return;
    }

    const updatedQuestions = [...questions];
    const updatedOptions = [...question.options];
    updatedOptions.splice(optionIndex, 1);

    updatedQuestions[questionIndex] = {
      ...question,
      options: updatedOptions,
      updatedAt: new Date().toISOString(),
    };

    setSurvey({
      ...survey,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Validate the survey before saving
  const validateSurvey = (): boolean => {
    if (!survey.title.trim()) {
      alert("Survey must have a title");
      return false;
    }

    const questions = ensureQuestionsArray(survey.questions);
    for (const question of questions) {
      if (!question.text.trim()) {
        alert("All questions must have text");
        return false;
      }

      if (
        ["multiple-choice", "checkbox", "dropdown"].includes(question.type) &&
        (!question.options || question.options.length < 2)
      ) {
        alert(`${question.type} questions must have at least two options`);
        return false;
      }
    }

    return true;
  };

  // Handle survey publish/save
  const handleSaveAsDraft = () => {
    if (validateSurvey()) {
      onSave({ ...survey, status: "draft" });
    }
  };

  const handlePublish = () => {
    if (validateSurvey()) {
      onSave({ ...survey, status: "published" });
    }
  };

  // Ensure questions is a valid array before rendering
  const questions = ensureQuestionsArray(survey.questions);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label
            htmlFor="survey-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Survey Title
          </label>
          <input
            id="survey-title"
            type="text"
            value={survey.title}
            onChange={(e) => updateSurveyField("title", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter survey title"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="survey-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Survey Description
          </label>
          <textarea
            id="survey-description"
            value={survey.description || ""}
            onChange={(e) => updateSurveyField("description", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Enter survey description"
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((question, questionIndex) => (
        <div
          key={question.id || questionIndex}
          className="bg-white shadow-md rounded-lg p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 mr-4">
              <label
                htmlFor={`question-text-${questionIndex}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Question Text
              </label>
              <input
                id={`question-text-${questionIndex}`}
                type="text"
                value={question.text}
                onChange={(e) =>
                  updateQuestion(questionIndex, "text", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter question text"
              />
            </div>
            <button
              type="button"
              onClick={() => deleteQuestion(questionIndex)}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Delete
            </button>
          </div>

          <div className="mb-4">
            <label
              htmlFor={`question-type-${questionIndex}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question Type
            </label>
            <select
              id={`question-type-${questionIndex}`}
              value={question.type}
              onChange={(e) =>
                updateQuestion(
                  questionIndex,
                  "type",
                  e.target.value as QuestionType
                )
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="short-text">Short Text</option>
              <option value="long-text">Long Text</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="checkbox">Checkbox</option>
              <option value="dropdown">Dropdown</option>
              <option value="linear-scale">Linear Scale</option>
              <option value="date">Date</option>
              <option value="time">Time</option>
            </select>
          </div>

          {/* Options for multiple choice, checkbox, dropdown */}
          {["multiple-choice", "checkbox", "dropdown"].includes(
            question.type
          ) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              {(question.options || []).map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center mb-2 last:mb-0"
                >
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(questionIndex, optionIndex, e.target.value)
                    }
                    className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => deleteOption(questionIndex, optionIndex)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(questionIndex)}
                className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Option
              </button>
            </div>
          )}

          {/* Required checkbox */}
          <div className="flex items-center mb-4">
            <input
              id={`question-required-${questionIndex}`}
              type="checkbox"
              checked={question.required}
              onChange={(e) =>
                updateQuestion(questionIndex, "required", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor={`question-required-${questionIndex}`}
              className="ml-2 block text-sm text-gray-700"
            >
              Required
            </label>
          </div>
        </div>
      ))}

      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={addQuestion}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          Add Question
        </button>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSaveAsDraft}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Publish
        </button>
      </div>
    </div>
  );
};

export default SurveyEditor;
