import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Edit, Trash2, BarChart2 } from "lucide-react";
import {
  useGetSurveysQuery,
  useDeleteSurveyMutation,
  usePublishSurveyMutation,
  useCompleteSurveyMutation,
} from "../../../../services/SURVEY-API";

const SurveyList: React.FC = () => {
  const {
    data: surveys = [],
    isLoading,
    error,
    refetch,
  } = useGetSurveysQuery();
  const [deleteSurvey] = useDeleteSurveyMutation();
  const [publishSurvey] = usePublishSurveyMutation();
  const [completeSurvey] = useCompleteSurveyMutation();

  const navigate = useNavigate();

  console.log("SurveyList rendering with data:", surveys);
  console.log("isLoading:", isLoading);
  console.log("error:", error);

  const handleCreateSurvey = () => {
    navigate("/create-survey");
  };

  const handleEditSurvey = (id: string) => {
    navigate(`/edit-survey/${id}`);
  };

  const handleViewResponses = (id: string) => {
    navigate(`/responses/${id}`);
  };

  const handleDeleteSurvey = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      try {
        await deleteSurvey(id).unwrap();
        refetch();
      } catch (error) {
        console.error("Error deleting survey:", error);
        alert("Failed to delete survey. Please try again.");
      }
    }
  };
  const handleUpdateStatus = async (
    id: string,
    newStatus: "published" | "completed"
  ) => {
    try {
      if (newStatus === "published") {
        await publishSurvey(id).unwrap();
      } else {
        await completeSurvey(id).unwrap();
      }
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Active Surveys</h2>
        <button
          onClick={handleCreateSurvey}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Create Survey</span>
        </button>
      </div>

      <div className="space-y-4">
        {surveys.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No surveys
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new survey.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateSurvey}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Survey
              </button>
            </div>
          </div>
        ) : (
          surveys.map((survey) => (
            <div
              key={survey.id}
              className="border rounded-lg p-4 hover:border-blue-500 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {survey.title}
                  </h3>
                  <p className="text-gray-500">{survey.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      {Array.isArray(survey.questions)
                        ? survey.questions.length
                        : 0}{" "}
                      questions
                    </span>
                    <span>
                      Created: {new Date(survey.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    survey.status === "published"
                      ? "bg-green-100 text-green-800"
                      : survey.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {survey.status.charAt(0).toUpperCase() +
                    survey.status.slice(1)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => handleViewResponses(survey.id)}
                  className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
                >
                  <BarChart2 size={16} className="mr-1" />
                  View Responses
                </button>

                <button
                  onClick={() => handleEditSurvey(survey.id)}
                  className="text-gray-600 hover:text-gray-800 flex items-center transition-colors duration-200"
                >
                  <Edit size={16} className="mr-1" />
                  Edit Survey
                </button>

                <button
                  onClick={() => handleDeleteSurvey(survey.id)}
                  className="text-red-600 hover:text-red-800 flex items-center transition-colors duration-200"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete Survey
                </button>

                {/* ✅ Edit Status Dropdown */}
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor={`status-${survey.id}`}
                    className="text-sm text-gray-600"
                  >
                    Edit Status:
                  </label>
                  <select
                    id={`status-${survey.id}`}
                    value={survey.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        survey.id,
                        e.target.value as "published" | "completed"
                      )
                    }
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SurveyList;
