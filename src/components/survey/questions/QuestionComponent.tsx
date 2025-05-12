import React from "react";
import { Question } from "../../../types";
import {
  ShortTextQuestion,
  LongTextQuestion,
  MultipleChoiceQuestion,
  CheckboxQuestion,
  DropdownQuestion,
  LinearScaleQuestion,
  DateQuestion,
  TimeQuestion,
} from "./QuestionTypes";

interface QuestionComponentProps {
  question: Question;
  answers: Record<string, string | string[] | number>;
  onAnswerChange: (
    questionId: string,
    value: string | string[] | number
  ) => void;
  error?: string;
}

const QuestionComponent: React.FC<QuestionComponentProps> = ({
  question,
  answers,
  onAnswerChange,
  error,
}) => {
  const props = {
    question,
    value: answers[question.id] || null,
    onChange: (value: string | string[] | number) =>
      onAnswerChange(question.id, value),
    error,
  };

  switch (question.type) {
    case "short-text":
      return <ShortTextQuestion {...props} />;
    case "long-text":
      return <LongTextQuestion {...props} />;
    case "multiple-choice":
      return <MultipleChoiceQuestion {...props} />;
    case "checkbox":
      return <CheckboxQuestion {...props} />;
    case "dropdown":
      return <DropdownQuestion {...props} />;
    case "linear-scale":
      return <LinearScaleQuestion {...props} />;
    case "date":
      return <DateQuestion {...props} />;
    case "time":
      return <TimeQuestion {...props} />;
    default:
      return null;
  }
};

export default QuestionComponent;
