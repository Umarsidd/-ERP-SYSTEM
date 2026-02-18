

 import { ErrorMessage, Field, FieldArray } from "formik";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "../ui/label";
import { Trash2 } from "lucide-react";
import { currencies } from "@/data/currencies";


export function CurrencyFields(props: {
  values: any;
  setFieldValue: any;
  setAddQuery: any;
  setProductSearch: any;
}) {
  const { values, setFieldValue, setAddQuery, setProductSearch } = props;
  const { isRTL } = useLanguage();
  return (
    <div className="space-y-2">
      <Label>{isRTL ? "العملة" : "Currency"}</Label>
      <Field
        as="select"
        name="currency"
        id="currency"
        className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        onChange={(e) => {
          setFieldValue("currency", e.target.value);
          setFieldValue("items", [
            {
              productId: "",
              productName: "",
              description: "",
              quantity: 1,
              stockQuantity: 0,
              oldQuantity: 0,
              unitPrice: 0,
              discount: 0,
              discountType: "percentage",
              taxRate: 0,
              total: 0,
              unitList: [],
              unit: "",
              originalUnitPrice: 0,
              unitName: "",
              warehouses: "main",
            },
          ]);

          setProductSearch((prev) => ({}));

          setAddQuery("");
        }}
      >
        {(
          JSON.parse(localStorage.getItem("selectedCurrencyList")) ?? currencies
        ).map((c) => (
          <option key={c.code} value={JSON.stringify(c)}>
            {isRTL ? `${c.code} - ${c.symbol}` : `${c.code} - ${c.symbol}`}
          </option>
        ))}
      </Field>

      <ErrorMessage
        name="currency"
        component="div"
        className="text-destructive text-sm"
      />
    </div>
  );
};
