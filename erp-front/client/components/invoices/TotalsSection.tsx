import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { selectedCurrency } from "@/data/data";
import { ErrorMessage, Field } from "formik";
import { motion } from "framer-motion";
import {
  Calculator,
  CreditCard,
  DollarSign,
  Percent,
  Truck,
} from "lucide-react";

export function TotalsSection(props: {
  values: any;
  //setFieldValue: any;
  totals: any;
}) {
  const {
    values,
    // setFieldValue,
    totals,
  } = props;

  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
      style={{ animationDelay: "300ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {isRTL ? "الإجمالي والخصومات" : "Totals & Discounts"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                {isRTL ? "نوع الخصم" : "Discount Type"}
              </label>
              <Field
                as="select"
                name="discountType"
                className="w-full mt-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="percentage">
                  {isRTL ? "نسبة مئوية" : "Percentage"}
                </option>
                <option value="fixed">
                  {isRTL ? "مبلغ ثابت" : "Fixed Amount"}
                </option>
              </Field>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                {isRTL ? "قيمة الخصم" : "Discount Value"}
              </label>
              <div className="relative mt-1">
                {values.discountType === "percentage" ? (
                  <Percent className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                ) : (
                  <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                )}
                <Field
                  name="discountValue"
                  type="number"
                  min="0"
                  //  step="0.01"
                  className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              {isRTL ? "تكلفة الشحن" : "Shipping Cost"}
            </label>
            <div className="relative mt-1">
              <Truck className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Field
                name="shippingCost"
                type="number"
                min="0"
                //  step="0.01"
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Grand Total Display */}
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center text-lg">
            <Calculator className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
            {isRTL ? "الإجمالي " : "Grand Total"}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isRTL ? "المجموع الفرعي:" : "Subtotal:"}
              </span>
              <span className="font-medium">
                {formatAmount(
                  convertAmount(
                    totals.subtotal,
                    localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                  ),
                  JSON.parse(values.currency).symbol,
                )}
              </span>
            </div>
            {totals.totalItemDiscounts > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isRTL ? "خصومات البنود:" : "Item Discounts:"}
                </span>
                <span className="font-medium text-destructive">
                  -
                  {formatAmount(
                    convertAmount(
                      totals.totalItemDiscounts,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    JSON.parse(values.currency).symbol,
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isRTL ? "الضريبة:" : "Tax:"}
              </span>
              <span className="font-medium">
                {formatAmount(
                  convertAmount(
                    totals.totalTax,
                    localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                  ),
                  JSON.parse(values.currency).symbol,
                )}
              </span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isRTL ? "خصم الفاتورة:" : "Invoice Discount:"}
                </span>
                <span className="font-medium text-destructive">
                  -
                  {formatAmount(
                    convertAmount(
                      totals.discount,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    JSON.parse(values.currency).symbol,
                  )}
                </span>
              </div>
            )}
            {values.shippingCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {isRTL ? "الشحن:" : "Shipping:"}
                </span>
                <span className="font-medium">
                  {formatAmount(
                    convertAmount(
                      values.shippingCost,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    JSON.parse(values.currency).symbol,
                  )}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>{isRTL ? "الإجمالي :" : "Grand Total:"}</span>
                <span className="text-primary">
                  {formatAmount(
                    convertAmount(
                      totals.total,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    JSON.parse(values.currency).symbol,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
