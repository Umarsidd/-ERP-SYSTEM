import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { paymentList, selectedCurrency } from "@/data/data";
import { ErrorMessage, Field } from "formik";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Calculator,
  ChevronDown,
  CreditCard,
  DollarSign,
  Hash,
  MapPin,
  Percent,
  Truck,
} from "lucide-react";
import { Label } from "../ui/label";

export function DepositDetails(props: {
  values: any;
  totals: any;
  location: any;
}) {
  const { values, totals, location } = props;

  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
      style={{ animationDelay: "450ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {isRTL ? "تفاصيل الدفع" : "Deposit Details"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-foreground">
            {isRTL ? "المبلغ المدفوع" : "Deposit Amount"}
          </label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Field
              name="depositAmount"
              type="number"
              min="0"
              // step="0.01"
              className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {location.state?.action === "copy" ||
        (location.state?.newData.status != "Paid" &&
          location.state?.newData.status != "PaidByExcess") ? (
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Field
              name="depositPaid"
              type="checkbox"
              className="w-5 h-5 text-primary bg-background border border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
            <label className="text-sm font-medium text-foreground">
              {isRTL ? "تم دفع المبلغ بالكامل" : "Deposit Paid in Full"}
            </label>
          </div>
        ) : null}

        <div>
          <label className="text-sm font-medium text-foreground">
            {isRTL ? "طريقة الدفع" : "Payment Method"}
          </label>
          <div className="relative mt-2">
            <CreditCard className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Field
              as="select"
              name="paymentMethod"
              className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
            >
              {/* <option value="Select payment method">
                          {isRTL ? "اختر طريقة الدفع" : "Select payment method"}
                        </option> */}
              {paymentList.map((payment) => (
                <option value={payment.name}>
                  {isRTL ? payment.nameAr : payment.name}
                </option>
              ))}
            </Field>
            <ChevronDown className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionId">
            {isRTL ? "معرف المعاملة" : "Transaction ID"}
          </Label>

          <div className="relative">
            <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />

            <Field
              className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              name="transactionId"
              placeholder={isRTL ? "معرف المعاملة" : "Transaction ID"}
            />
          </div>
          <ErrorMessage
            name="transactionId"
            component="div"
            className="text-red-500 text-sm"
          />
        </div>
      </div>

      {values.depositAmount > 0 && (
        <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-info">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">
              {isRTL ? "معلومات الدفع" : "Deposit Information"}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{isRTL ? "مبلغ الدفع:" : "Deposit Amount:"}</span>
              <span className="font-medium">{values.depositAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>{isRTL ? "المبلغ المتبقي:" : "Remaining Amount:"}</span>
              <span className="font-medium">
                {formatAmount(
                  convertAmount(
                    totals.total - values.depositAmount,
                    localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                  ),
                  JSON.parse(values.currency).symbol,
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
