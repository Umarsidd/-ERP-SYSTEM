import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ErrorMessage, Field } from "formik";
import { motion } from "framer-motion";
import { Calculator, ChevronDown, CreditCard, DollarSign, MapPin, Percent, Truck } from "lucide-react";




export function ShippingInformation(props: {
  //values: any;
  //setFieldValue: any;
   // totals: any;
}) {
  const {
   // values,
    // setFieldValue,
     //totals,
  } = props;

  const { isRTL } = useLanguage();

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {isRTL ? "معلومات الشحن" : "Shipping Information"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-foreground">
            {isRTL ? "عنوان الشحن" : "Shipping Address"}
          </label>
          <div className="relative mt-2">
            <MapPin className="absolute left-3 rtl:left-auto rtl:right-3 top-3 text-muted-foreground w-4 h-4" />
            <Field
              as="textarea"
              name="shippingAddress"
              rows="3"
              className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              placeholder={isRTL ? "عنوان الشحن" : "Shipping address"}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            {isRTL ? "طريقة الشحن" : "Shipping Method"}
          </label>
          <div className="relative mt-2">
            <Truck className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Field
              as="select"
              name="shippingMethod"
              className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
            >
              <option value="Standard Delivery">
                {isRTL ? "توصيل عادي" : "Standard Delivery"}
              </option>
              <option value="Express Delivery">
                {isRTL ? "توصيل سريع" : "Express Delivery"}
              </option>
              <option value="Same Day Delivery">
                {isRTL ? "توصيل في نفس اليوم" : "Same Day Delivery"}
              </option>
              <option value="Customer Pickup">
                {isRTL ? "استلام من العميل" : "Customer Pickup"}
              </option>
            </Field>
            <ChevronDown className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          </div>


            <div className="flex items-center space-x-3 rtl:space-x-reverse mt-4">
              <Field
                name="isWareHouse"
                type="checkbox"
                className="w-5 h-5 text-primary bg-background border border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
              <label className="text-sm font-medium text-foreground">
                {isRTL ? "اختيار بند لكل مستودع" : "Select Item per Warehouse"}
              </label>
            </div>
      

        </div>
      </div>
    </div>
  );
};