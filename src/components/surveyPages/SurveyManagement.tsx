import React, { useState } from "react";
import { FileText, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "../../components/SurveyContextCore";
import SurveyList from "../survey/list/SurveyList";

const SurveyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "forms" | "responses" | "analytics"
  >("forms");
  const navigate = useNavigate();
  const { surveys } = useSurvey();

  const handleViewResponses = () => {
    if (surveys.length > 0) {
      navigate(`/responses/${surveys[0].id}`);
    } else {
      alert("No surveys available to view responses");
    }
  };

  const handleViewAnalytics = () => {
    if (surveys.length > 0) {
      navigate(`/analytics/${surveys[0].id}`);
    } else {
      alert("No surveys available to view analytics");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("forms")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "forms"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600"
            } transition-colors duration-200`}
          >
            <FileText size={20} />
            <span>Forms</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("responses");
              handleViewResponses();
            }}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "responses"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600"
            } transition-colors duration-200`}
          >
            <FileText size={20} />
            <span>Responses</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("analytics");
              handleViewAnalytics();
            }}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "analytics"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600"
            } transition-colors duration-200`}
          >
            <BarChart2 size={20} />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {activeTab === "forms" && <SurveyList />}
    </div>
  );
};

export default SurveyManagement;
