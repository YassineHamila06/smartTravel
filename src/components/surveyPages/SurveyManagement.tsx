import React from "react";
import { useNavigate } from "react-router-dom";
import { useSurvey } from "../../components/SurveyContextCore";
import SurveyList from "../survey/list/SurveyList";

const SurveyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { surveys } = useSurvey();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
      </div>

      <SurveyList />
    </div>
  );
};

export default SurveyManagement;
