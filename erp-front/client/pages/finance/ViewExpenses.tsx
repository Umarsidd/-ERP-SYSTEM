import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Building,
  DollarSign,
  FileText,
  Mail,
  Edit,
  Copy,
  Printer,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainIcon } from "@/components/common/mainIcon";
import { Loading } from "@/components/common/loading";
import {
  getStatusColor,
  getStatusLabel,
  handleCopy,
  handleEdit,
} from "@/lib/function";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { selectedCurrency } from "@/data/data";
import CryptoJS from "crypto-js";
import { printUnifiedPaymentReceipt } from "@/utils/paymentPrintPdf";
import { printUnifiedExpenseReceipt } from "@/utils/expensePrintPdf";

const ViewExpenses: React.FC = () => {
  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatAmount, convertAmount } = useCurrency();

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [payment, setPayment] = useState(location.state?.viewFrom);

  const viewData = location.state?.viewFrom;

  const { isRTL } = useLanguage();

  const handlePrintReceipt = () => {
    if (!payment) return;
    printUnifiedExpenseReceipt(
      JSON.parse(payment.main),
      isRTL,
      formatAmount,
      convertAmount,
      quotation,
    );
  };

  useEffect(() => {
    console.log(JSON.parse(viewData.main));
    setQuotation(viewData);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />;
  }

  if (!quotation) {
    return (
      <ViewEmpty
        title={isRTL ? " غير موجود" : " Not Found"}
        description={isRTL ? "غير متوفر" : "not found"}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6 sm:mb-8">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isRTL ? "تفاصيل المصروفات " : "Expenses Details"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {quotation.elementNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Button variant="outline" onClick={handlePrintReceipt}>
            <Printer className="h-4 w-4 mr-2" />
            {isRTL ? "طباعة إيصال" : "Print Receipt"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              handleCopy(
                isRTL ? "نسخ أمر الشراء" : "Copy Order",
                isRTL
                  ? `هل تريد نسخ أمر الشراء ${quotation.elementNumber}؟`
                  : `Do you want to copy order ${quotation.elementNumber}?`,
                quotation,
                isRTL,
                navigate,
                "/finance/expenses/create",
              );
            }}
          >
            <Copy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
          </Button>

          {/* <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              printQuotation(
                {
                  ...JSON.parse(quotation.main),
                  title: isRTL ? "أوامر الشراء" : "Purchase Orders",
                },

                isRTL,
                formatAmount,
                convertAmount,
              );
            }}
          >
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isRTL ? "طباعة" : "Print"}
            </span>
          </Button> */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleSendToClient(
                isRTL ? "إرسال للعميل" : "Send to Client",
                isRTL
                  ? `إرسال أمر الشراء ${quotation.elementNumber} إلى العميل؟`
                  : `Send Order ${quotation.elementNumber} to client?`,
                isRTL
                  ? `تم إرسال أمر الشراء ${quotation.elementNumber} إلى العميل`
                  : `Order ${quotation.elementNumber} sent to client`,
                isRTL,
              );
            }}
            className="flex-1 sm:flex-none"
          >
            <Send className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isRTL ? "إرسال" : "Email"}
            </span>
          </Button> */}

          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Finance?.editAndDeleteAllExpenses !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Finance?.editAndDeleteHisExpenses === true &&
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user?.id === JSON.parse(quotation.createdBy).id)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleEdit(quotation, navigate, `/finance/expenses/edit`)
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

      {/* Status and Main Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MainIcon icon={quotation.status} />

                {isRTL ? "معلومات عامة" : "General Information"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(quotation.status)}>
                  {getStatusLabel(quotation.status, isRTL)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{isRTL ? "المبلغ" : "Amount"}</span>
                </div>
                <p className="font-semibold text-lg">
                  {formatAmount(
                    convertAmount(
                      quotation.totalAmount ?? 0,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "تاريخ الإصدار" : "Issue Date"}
                  </span>
                </div>
                <p className="font-semibold">
                  {format(quotation.issueDate, "PPP")}
                </p>
              </div>
              {/* <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "التكرار" : "Recurring"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
        
                  {JSON.parse(quotation.main).recurring
                    ? isRTL
                      ? "نعم"
                      : "Yes"
                    : isRTL
                      ? "لا"
                      : "No"}
                </p>
              </div> */}
              {/* {JSON.parse(quotation.main)?.recurring && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? "تاريخ الانتهاء" : "End Date"}
                    </span>
                  </div>
                  <p className="font-semibold text-lg">
                    {JSON.parse(quotation.main)?.dueDate}
                  </p>
                </div>
              )}

              {JSON.parse(quotation.main)?.recurring && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? " مدة التكرار" : "Recurring Interval"}
                    </span>
                  </div>
                  <p className="font-semibold text-lg">
                    {JSON.parse(quotation.main)?.recurrence}
                  </p>
                </div>
              )} */}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "أنشأ بواسطة" : "Created By"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(quotation.createdBy)?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                    ? JSON.parse(quotation.main).customer.name
                    : JSON.parse(quotation.main).customer.name}
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
                  {JSON.parse(quotation.main).customer.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      {JSON.parse(quotation.main).description && (
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
                {JSON.parse(quotation.main).description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {quotation.attachments && (
        <div className="mt-8 mb-2">
          <DisplayImages data={JSON.parse(quotation.attachments)?.images} />
        </div>
      )}
    </div>
  );
};

export default ViewExpenses;
