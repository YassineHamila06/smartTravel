import { useState, useEffect } from "react";
import { Survey, SurveyResponse, Question } from "../../types";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Download } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#6B7280",
];

// Mock data
const mockSurvey = {
  id: "1",
  title: "Customer Feedback Survey",
  description: "A survey to understand customer feedback.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "active",
  sections: [
    {
      id: "s1",
      title: "Experience",
      questions: [
        {
          id: "q1",
          title: "How satisfied are you with our service?",
          type: "linear-scale",
          required: true,
        },
        {
          id: "q2",
          title: "What features do you use the most?",
          type: "checkbox",
          required: false,
        },
        {
          id: "q3",
          title: "How did you hear about us?",
          type: "multiple-choice",
          required: true,
        },
      ],
    },
  ],
};

const mockResponses = [
  {
    id: "r1",
    surveyId: "1",
    userId: "u1",
    userName: "Alice Smith",
    submittedAt: new Date().toISOString(),
    answers: [
      { questionId: "q1", value: 5 },
      { questionId: "q2", value: ["Feature A", "Feature B"] },
      { questionId: "q3", value: "Online Ads" },
    ],
  },
  {
    id: "r2",
    surveyId: "1",
    userId: "u2",
    userName: "Bob Jones",
    submittedAt: new Date().toISOString(),
    answers: [
      { questionId: "q1", value: 4 },
      { questionId: "q2", value: ["Feature B"] },
      { questionId: "q3", value: "Friend" },
    ],
  },
];

const SurveyAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[] | null>(null);

  useEffect(() => {
    if (id === "1") {
      setSurvey(mockSurvey);
      setResponses(mockResponses);
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  if (!survey) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  // Get all questions from all sections
  const allQuestions = survey.sections.flatMap((section) => section.questions);

  // Prepare data for visualization
  const prepareQuestionData = (question: Question) => {
    // Extract all answers for this question
    const questionAnswers = responses
      .map((response) =>
        response.answers.find((a) => a.questionId === question.id)
      )
      .filter((answer) => answer !== undefined);

    if (questionAnswers.length === 0) return null;

    switch (question.type) {
      case "multiple-choice":
      case "dropdown": {
        // Count occurrences of each option
        const countMap: Record<string, number> = {};
        questionAnswers.forEach((answer) => {
          if (answer && typeof answer.value === "string") {
            countMap[answer.value] = (countMap[answer.value] || 0) + 1;
          }
        });

        return Object.entries(countMap).map(([name, value]) => ({
          name,
          value,
        }));
      }

      case "checkbox": {
        // Count occurrences of each option (for checkboxes, values are arrays)
        const countMap: Record<string, number> = {};
        questionAnswers.forEach((answer) => {
          if (answer && Array.isArray(answer.value)) {
            answer.value.forEach((option) => {
              countMap[option] = (countMap[option] || 0) + 1;
            });
          }
        });

        return Object.entries(countMap).map(([name, count]) => ({
          name,
          count,
        }));
      }

      case "linear-scale": {
        // Count occurrences of each rating
        const countMap: Record<string, number> = {};
        questionAnswers.forEach((answer) => {
          if (answer && typeof answer.value === "number") {
            const value = answer.value.toString();
            countMap[value] = (countMap[value] || 0) + 1;
          }
        });

        return Object.entries(countMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => parseInt(a.name) - parseInt(b.name));
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/responses/${survey.id}`)}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold">
                  {survey.title} - Analytics
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-2 hover:bg-green-700 transition-colors duration-200">
                <Download size={18} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Survey Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-500 font-medium">
                Total Responses
              </p>
              <p className="text-2xl font-bold">{responses.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-500 font-medium">
                Completion Rate
              </p>
              <p className="text-2xl font-bold">
                {responses.length > 0 ? "100%" : "0%"}
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-500 font-medium">
                Avg. Completion Time
              </p>
              <p className="text-2xl font-bold">3m 24s</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-500 font-medium">Status</p>
              <p className="text-2xl font-bold capitalize">{survey.status}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {allQuestions.map((question) => {
            const chartData = prepareQuestionData(question);
            if (!chartData) return null;

            return (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h2 className="text-lg font-semibold mb-6">{question.title}</h2>

                {(question.type === "multiple-choice" ||
                  question.type === "dropdown") && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {(question.type === "checkbox" ||
                  question.type === "linear-scale") && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytics;
