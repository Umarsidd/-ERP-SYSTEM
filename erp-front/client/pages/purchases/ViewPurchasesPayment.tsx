import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UnifiedPaymentTemplate } from "@/components/template/PaymentTemplate";
import { printUnifiedPaymentReceipt } from "@/utils/paymentPrintPdf";
import { Edit, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { getStatusColor, getStatusLabel, handleEdit } from "@/lib/function";
import { MainIcon } from "@/components/common/mainIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import CryptoJS from "crypto-js";

const PurchasesViewPayment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const { formatAmount, convertAmount } = useCurrency();
  const [payment, setPayment] = useState(location.state?.viewFrom);
  //const [loading, setLoading] = useState(true);
  const handlePrintReceipt = () => {
    if (!payment) return;
    printUnifiedPaymentReceipt(
      JSON.parse(payment.main),
      isRTL,
      formatAmount,
      convertAmount,
    );
  };

  // if (loading) {
  //   return (
  //      <Loading title={isRTL ? "جاري التحميل ..." : "Loading ..."} />

  //   );
  // }

  if (!payment) {
    return (
      <ViewEmpty
        title={isRTL ? "الدفعة غير موجودة" : "Payment Not Found"}
        description={
          isRTL
            ? "لم يتم العثور على الدفعة المطلوبة. يرجى التحقق من الرابط أو العودة إلى قائمة الدفعات."
            : "The requested payment could not be found. Please check the link or return to the payments list."
        }
      />
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isRTL ? "عرض الدفعة" : "Payment Details"}
            </h1>
            {/* <p className="text-muted-foreground">
              {payment.elementNumber} •{" "}
              {JSON.parse(payment.main).customer.name}
            </p> */}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrintReceipt}>
              <Printer className="h-4 w-4 mr-2" />
              {isRTL ? "طباعة إيصال" : "Print Receipt"}
            </Button>

            {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Purchases?.deletingAndEditingAllPayments !== false ||
              ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
                ?.Purchases?.deletingAndEditingHisPayments === true &&
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user?.id === JSON.parse(payment.createdBy).id)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleEdit(payment, navigate, `/purchase/payments/edit`)
                }
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isRTL ? "تحرير" : "Edit"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Status Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Alert
          className={`${
            payment.status === "Completed"
              ? "border-green-200 bg-green-50 dark:bg-green-950"
              : payment.status === "Failed"
                ? "border-red-200 bg-red-50 dark:bg-red-950"
                : payment.status === "Pending"
                  ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950"
                  : "border-blue-200 bg-blue-50 dark:bg-blue-950"
          }`}
        >
          <MainIcon icon={payment.status} />
          <AlertDescription>
            <span className="font-medium">
              {isRTL ? "حالة الدفعة: " : " Payment Status: "}{" "}
            </span>
            <Badge className={getStatusColor(payment.status)}>
              {getStatusLabel(payment.status, isRTL)}
            </Badge>
            {payment.status === "Completed" && (
              <span className="ml-2">
                {isRTL
                  ? " تم تأكيد استلام الدفعة بنجاح "
                  : " Payment has been successfully confirmed "}
              </span>
            )}
            {payment.status === "Failed" && (
              <span className="ml-2">
                {isRTL
                  ? " فشلت عملية الدفع. يرجى المحاولة مرة أخرى "
                  : " Payment failed. Please try again or contact support "}
              </span>
            )}
            {payment.status === "Processing" && (
              <span className="ml-2">
                {isRTL
                  ? " الدفعة قيد المعالجة "
                  : " Payment is being processed "}
              </span>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Payment Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <UnifiedPaymentTemplate payment={payment} isRTL={isRTL} mode="view" />
        <DisplayImages data={JSON.parse(payment.attachments)?.images} />
      </motion.div>
    </div>
  );
};

export default PurchasesViewPayment;
