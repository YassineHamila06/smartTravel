import React from "react";
import { Question } from "../../../types";

interface QuestionProps {
  question: Question;
  value: string | string[] | number | null;
  onChange: (value: string | string[] | number) => void;
  error?: string;
}

export const ShortTextQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          error ? "border-red-300" : ""
        }`}
        placeholder="Your answer"
      />
    </div>
  );
};

export const LongTextQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          error ? "border-red-300" : ""
        }`}
        placeholder="Your answer"
      ></textarea>
    </div>
  );
};

export const MultipleChoiceQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <div className="mt-2 space-y-2">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              id={`${question.id}-${index}`}
              name={`question-${question.id}`}
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor={`${question.id}-${index}`}
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CheckboxQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  const selectedOptions = Array.isArray(value) ? value : [];

  const handleChange = (option: string) => {
    const newSelectedOptions = [...selectedOptions];
    const optionIndex = newSelectedOptions.indexOf(option);

    if (optionIndex === -1) {
      newSelectedOptions.push(option);
    } else {
      newSelectedOptions.splice(optionIndex, 1);
    }

    onChange(newSelectedOptions);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <div className="mt-2 space-y-2">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              id={`${question.id}-${index}`}
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleChange(option)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor={`${question.id}-${index}`}
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DropdownQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          error ? "border-red-300" : ""
        }`}
      >
        <option value="">Select an option</option>
        {question.options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export const LinearScaleQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  const min = question.minValue || 1;
  const max = question.maxValue || 5;
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <div className="mt-4">
        <div className="flex justify-between">
          {values.map((val) => (
            <div key={val} className="flex flex-col items-center">
              <input
                id={`${question.id}-${val}`}
                name={`question-${question.id}`}
                type="radio"
                checked={
                  value !== null && typeof value === "number"
                    ? value === val
                    : value !== null && typeof value === "string"
                    ? parseInt(value) === val
                    : false
                }
                onChange={() => onChange(val.toString())}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`${question.id}-${val}`}
                className="mt-1 text-sm text-gray-500"
              >
                {val}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{question.options[0] || "Low"}</span>
          <span>{question.options[1] || "High"}</span>
        </div>
      </div>
    </div>
  );
};

export const DateQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          error ? "border-red-300" : ""
        }`}
      />
    </div>
  );
};

export const TimeQuestion: React.FC<QuestionProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <input
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          error ? "border-red-300" : ""
        }`}
      />
    </div>
  );
};
