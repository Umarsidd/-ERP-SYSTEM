import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  Building,
  DollarSign,
  FileText,
  Mail,
  Printer,
  Edit,
  Copy,
  Send,
  Podcast,
  Repeat,
  Repeat2,
  Pause,
  Play,
  AlertCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainIcon } from "@/components/common/mainIcon";
import { Loading } from "@/components/common/loading";
import {
  getStatusColor,
  getStatusLabel,
  handleCopy,
  handleEdit,
  handleSendToClient,
} from "@/lib/function";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { commonApi } from "@/lib/api";

const ViewRecurringInvoice: React.FC = () => {
  const [mainData, setMainData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const viewData = location.state?.viewFrom;

  const { isRTL } = useLanguage();
  const handleToggleStatus = async () => {
    try {
      var res = await commonApi.update(
        viewData.id,
        {
          updatedAt: new Date().toISOString(),
          status: mainData.status === "Active" ? "Paused" : "Active",
        },
        "sales_recurring",
      );

      // if (mainData) {
      const newStatus = mainData.status === "Active" ? "Paused" : "Active";
      setMainData({ ...mainData, status: newStatus });
      //    }

      console.error("res", res);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    console.log(JSON.parse(viewData.main));
    setMainData(viewData);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />;
  }

  if (!mainData) {
    return (
      <ViewEmpty
        title={isRTL ? "الفاتورة الدورية غير موجود" : "Recurring Not Found"}
        description={
          isRTL
            ? "الفاتورة الدورية المطلوب غير متوفر"
            : "The requested Recurring  could not be found"
        }
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
              {isRTL ? "تفاصيل الفاتورة الدورية" : "Recurring Details"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {mainData.quoteNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className={
              mainData.status === "Active"
                ? "text-yellow-600"
                : "text-green-600"
            }
          >
            {mainData.status === "Active" ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {mainData.status === "Active"
              ? isRTL
                ? "إيقاف"
                : "Pause"
              : isRTL
                ? "تفعيل"
                : "Activate"}
          </Button>

          {(JSON.parse(localStorage.getItem("subRole") || "null") as any)?.Sales
            ?.update !== false && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleEdit(mainData, navigate, `/sales/recurring-invoices/edit`)
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

      {mainData.status === "Paused" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isRTL
                ? "هذا الاشتراك متوقف مؤقتاً. لن يتم إنشاء فواتير جديدة حتى يتم تفعيله مرة أخرى."
                : "This subscription is paused. No new invoices will be generated until it is activated again."}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

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
                <MainIcon icon={mainData.status} />

                {isRTL ? "معلومات عامة" : "General Information"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(mainData.status)}>
                  {getStatusLabel(mainData.status, isRTL)}
                </Badge>
                {/* {mainData.probability && (
                    // <Badge
                    //   variant="outline"
                    //   className={getProbabilityColor(mainData.probability)}
                    // >
                    //   {mainData.probability}%
                    // </Badge>
                  )} */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL
                      ? "مبلغ الفاتورة الدورية"
                      : "Recurring Invoice Amount"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
                  {/* {mainData.currency} */}{" "}
                  {JSON.parse(mainData.main).amount.total}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "إجمالي الفواتير" : "Total Invoices"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(mainData.main).amount.total *
                    JSON.parse(mainData.main).repetitionNumber}
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
                  {format(mainData.issueDate, "PPP")}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Podcast className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "الاشتراك" : "Subscription"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(mainData.main).subscription}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Repeat className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL
                      ? " إصدار فاتورة كل"
                      : "Issue an invoice every (days)"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(mainData.main).repetitionEvery}{" "}
                  {isRTL ? "يوم" : "day"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Repeat2 className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "عدد مرات التكرار" : "Number of repetitions"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(mainData.main).repetitionNumber}
                </p>
              </div>

              {/* <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? "صالح حتى" : "Valid Until"}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {format(mainData.validUntil, "PPP")}
                  </p>
                </div> */}
              {/* 
              {mainData.createdAt && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Send className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? "تاريخ الإرسال" : "Sent Date"}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {format(mainData.createdAt, "PPP")}
                  </p>
                </div>
              )} */}

              {/* {mainData.responseDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {isRTL ? "تاريخ الرد" : "Response Date"}
                      </span>
                    </div>
                    <p className="font-semibold">
                      {format(mainData.responseDate, "PPP")}
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
                  {JSON.parse(mainData.createdBy)?.name}
                </p>
              </div>

              {/* {JSON.parse(mainData.main).customer && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {isRTL ? "مكلف إلى" : "Assigned To"}
                      </span>
                    </div>
                    <p className="font-semibold">
                      {" "}
                      {isRTL
                        ? JSON.parse(mainData.main).customer.name
                        : JSON.parse(mainData.main).customer.name}
                    </p>
                  </div>
                )} */}

              {/* {mainData.followUpDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">
                        {isRTL ? "متابعة في" : "Follow Up"}
                      </span>
                    </div>
                    <p className="font-semibold">
                      {format(mainData.followUpDate, "PPP")}
                    </p>
                  </div>
                )} */}
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
                    ? JSON.parse(mainData.main).customer.name
                    : JSON.parse(mainData.main).customer.name}
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
                  {JSON.parse(mainData.main).customer.email}
                </p>
              </div>
              {/* <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "العنوان " : "Address"}
                  </span>
                </div>
                <p className="font-semibold">
                  {" "}
                  {isRTL
                    ? JSON.parse(mainData.main).customer.addressAr
                    : JSON.parse(mainData.main).customer.address}
                </p>
              </div> */}
              {/* <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? "جهة الاتصال" : "Contact Person"}
                    </span>
                  </div>
                  <p className="font-semibold">{"mainData.contactPerson"}</p>
                </div> */}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isRTL ? "العناصر والخدمات" : "Items & Services"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">
                      {isRTL ? "الوصف" : "Description"}
                    </th>
                    <th className="text-center p-2 font-semibold">
                      {isRTL ? "الكمية" : "Quantity"}
                    </th>
                    <th className="text-right p-2 font-semibold">
                      {isRTL ? "سعر الوحدة" : "Unit Price"}
                    </th>
                    {JSON.parse(mainData.main).items.some(
                      (item) => item.discount,
                    ) && (
                      <th className="text-right p-2 font-semibold">
                        {isRTL ? "الخصم" : "Discount"}
                      </th>
                    )}
                    <th className="text-right p-2 font-semibold">
                      {isRTL ? "الإجمالي" : "Total"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(mainData.main).items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">
                        {item.unitPrice.toFixed(2)}
                      </td>
                      {JSON.parse(mainData.main).items.some(
                        (i) => i.discount,
                      ) && (
                        <td className="p-2 text-right">
                          {item.discount ? `${item.discount}%` : "-"}
                        </td>
                      )}
                      <td className="p-2 text-right font-semibold">
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {JSON.parse(mainData.main).items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-3 bg-muted/20"
                >
                  <div className="space-y-2">
                    <div className="font-medium text-sm">
                      {isRTL ? "الوصف:" : "Description:"}
                    </div>
                    <div className="text-sm">{item.description}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "الكمية" : "Quantity"}
                      </div>
                      <div className="font-medium text-sm">{item.quantity}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "سعر الوحدة" : "Unit Price"}
                      </div>
                      <div className="font-medium text-sm">
                        {item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    {item.discount ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? "الخصم" : "Discount"}
                        </div>
                        <div className="font-medium text-sm text-green-600">
                          {item.discount}%
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "الإجمالي" : "Total"}
                      </div>
                      <div className="font-semibold text-sm">
                        {item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                {JSON.parse(mainData.main).amount.totalTax > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>{isRTL ? "الضريبة:" : "Tax:"}</span>
                    <span>
                      {JSON.parse(mainData.main).amount.totalTax.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                  <span>{isRTL ? "المجموع:" : "Total:"}</span>
                  <span>
                    {JSON.parse(mainData.main).amount.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Terms & Conditions */}
      {JSON.parse(mainData.main).terms && (
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
                {JSON.parse(mainData.main).terms}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notes */}
      {JSON.parse(mainData.main).notes && (
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
                {JSON.parse(mainData.main).notes}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ViewRecurringInvoice;
