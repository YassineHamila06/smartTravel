import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SurveyEditor as Editor } from "../survey";
import { useSurvey } from "../SurveyContextCore";
import { Survey } from "../../types";

const SurveyEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getSurvey, addSurvey, updateSurvey } = useSurvey();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const fetchedSurvey = await getSurvey(id);
        if (fetchedSurvey) {
          setSurvey(fetchedSurvey);
        } else {
          setError("Survey not found");
        }
      } catch (err) {
        setError("Error fetching survey");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id, getSurvey]);

  const handleSave = async (updatedSurvey: Survey) => {
    setLoading(true);
    try {
      if (id) {
        await updateSurvey(id, updatedSurvey);
      } else {
        await addSurvey(updatedSurvey);
      }
      navigate("/surveys");
    } catch (err) {
      setError("Error saving survey");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Edit Survey" : "Create New Survey"}
      </h1>
      <Editor initialSurvey={survey || undefined} onSave={handleSave} />
    </div>
  );
};

export default SurveyEditor;
