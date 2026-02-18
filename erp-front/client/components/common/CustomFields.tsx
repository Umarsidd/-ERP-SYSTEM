

 import { ErrorMessage, Field, FieldArray } from "formik";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "../ui/label";
import { Trash2 } from "lucide-react";


export function CustomFields(props: {
  values: any;
}) {
  const {
    values,
  } = props;
  const { isRTL } = useLanguage();
  return (
    <FieldArray name="fields">
      {({ remove, push }) => (
        <div className="space-y-3">
          {values.fields &&
            values.fields.length > 0 &&
            values.fields.map((c, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-muted/5 rounded-md grid grid-cols-1 md:grid-cols-2 gap-3 items-"
              >
                <div>
                  <Label>{isRTL ? "الاسم" : "Name"}</Label>
                  <Field
                    className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    name={`fields.${index}.name`}
                    value={c.name}
                  />{" "}
                  <ErrorMessage
                    name={`fields.${index}.name`}
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "القيمة" : "Value"}</Label>
                  <div className="flex items- gap-3">
                    <Field
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      name={`fields.${index}.value`}
                      value={c.value}
                    />{" "}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-2 mt- text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                  <ErrorMessage
                    name={`fields.${index}.value`}
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
              </motion.div>
            ))}

          <div>
            <Button
              className="mx-4"
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                push({
                  name: "",
                  value: "",
                })
              }
            >
              {isRTL ? "إضافة حقل مخصص" : "Add Custom Field"}
            </Button>
          </div>
        </div>
      )}
    </FieldArray>
  );
};
