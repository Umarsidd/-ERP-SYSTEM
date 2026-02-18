import { motion } from "framer-motion";
import { Building, FileText, Mail, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "../ui/separator";
import { useCurrency } from "@/contexts/CurrencyContext";




export function CustomerInformation(props: { data: any }) {
  const { data } = props;
  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();

  return (
    <>
      {/* Customer Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isRTL ? "معلومات العميل" : "Customer Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "اسم العميل" : "Customer Name"}
                  </span>
                </div>
                <p className="font-semibold">
                  {" "}
                  {isRTL
                    ? JSON.parse(data.main).customer.name
                    : JSON.parse(data.main).customer.name}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "البريد الإلكتروني" : "Email"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(data.main).customer.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};