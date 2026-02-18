import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useLanguage } from "@/contexts/LanguageContext";




export function NoteAndTerm(props: { data: any }) {
  const { data } = props;
  const { isRTL } = useLanguage();

  return (
    <>
      {/* Terms & Conditions */}
      {JSON.parse(data.main).terms && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isRTL ? "الشروط والأحكام" : "Terms & Conditions"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {JSON.parse(data.main).terms}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notes */}
      {JSON.parse(data.main).notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isRTL ? "ملاحظات" : "Notes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {JSON.parse(data.main).notes}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
};