

 import { ErrorMessage, Field, FieldArray } from "formik";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "../ui/label";
import { Trash2 } from "lucide-react";
import { currencies } from "@/data/currencies";


export function CompactCurrencyFields(props: {
  values: any;
  setFieldValue: any;
  setAddQuery: any;
  setProductSearch: any;
  compact?: boolean;
}) {
  const { values, setFieldValue, setAddQuery, setProductSearch, compact = false } = props;
  const { isRTL } = useLanguage();
  
  return (
    <div className={compact ? "h-full w-full" : "space-y-2"}> {/* Add w-full */}
      {!compact && <Label>{isRTL ? "العملة" : "Currency"}</Label>}
      <Field
        as="select"
        name="currency"
        id="currency"
        className={`
          w-full
          ${compact ? 'h-12 text-sm border border-border rounded-lg pl-2 pr-8 focus:ring-2 focus:ring-primary' : 'h-12 border border-border rounded-lg focus:ring-2 focus:ring-primary pl-4 pr-4 py-3'}
          bg-background
          focus:outline-none
          focus:border-transparent
          transition-all
          cursor-pointer
          appearance-none
          bg-no-repeat
          bg-[length:12px_12px]
          bg-[right_0.5rem_center]
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M3%204.5L6%207.5L9%204.5H3Z%22%2F%3E%3C%2Fsvg%3E')]
        `}
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
      {!compact && (
        <ErrorMessage
          name="currency"
          component="div"
          className="text-destructive text-sm"
        />
      )}
    </div>
  );
}
