import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";
import { QuotationTemplate } from "../template/QuotationTemplate";

export function QuotationPreviewModal(props: { values: any; setShowPreview: any; title: string; title2: string }) {
  const { values, setShowPreview, title, title2 } = props;

  const { isRTL } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quotation Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <QuotationTemplate
            data={{
              ...values,
              title: title2,
            }}
            isRTL={isRTL}
            mode="preview"
          />
        </div>
      </div>
    </div>
  );
};