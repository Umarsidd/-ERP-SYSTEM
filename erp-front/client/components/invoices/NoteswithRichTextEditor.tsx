import { useLanguage } from "@/contexts/LanguageContext";
import ReliableRichTextEditor from "../editor/ReliableRichTextEditor";




export function NoteswithRichTextEditor(props: {
  values: any;
  setFieldValue: any;
  // totals: any;
}) {
  const {
    values,
    setFieldValue,
    //totals,
  } = props;

  const { isRTL } = useLanguage();

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
      style={{ animationDelay: "500ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {isRTL ? "الملاحظات والشروط" : "Notes & Terms"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            {isRTL ? "ملاحظات" : "Notes"}
          </label>
          <ReliableRichTextEditor
            value={values.notes}
            onChange={(value) => setFieldValue("notes", value)}
            placeholder={isRTL ? "ملاحظات إضافية" : "Additional notes"}
            height="150px"
            isRTL={isRTL}
          />
        </div>
      </div>
    </div>
  );
};