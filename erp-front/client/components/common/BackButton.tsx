import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";




export function BackButton() {

  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  return (
    <button
    type="button"
      onClick={() => navigate(-1)}
      className="p-2 hover:bg-accent rounded-lg transition-colors"
    >
      {isRTL ? (
        <ArrowRight className="w-5 h-5" />
      ) : (
        <ArrowLeft className="w-5 h-5" />
      )}
    </button>
  );
};