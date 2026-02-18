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
  CakeSlice,
  X,
  Check,
  Undo,
  FileAudio2,
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
import { printQuotation } from "@/utils/quotationPrintPdf";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { commonApi } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DisplayImages } from "@/components/invoices/DisplayImages";

import CryptoJS from "crypto-js";

const ViewRequestsPurchase: React.FC = () => {

  const { formatAmount, convertAmount } = useCurrency();

  const navigate = useNavigate();
  const location = useLocation();
  const [quotation, setQuotation] = useState(location.state?.viewFrom);
  const [isLoading, setIsLoading] = useState(false);

  const { isRTL } = useLanguage();

  // useEffect(() => {
  //                 setIsLoading(false);
  // }, []);



  if (!quotation) {
    return (
      <ViewEmpty
        title={isRTL ? "طلب الشراء غير موجود" : "Purchase Request Not Found"}
        description={
          isRTL
            ? "طلب الشراء المطلوب غير متوفر"
            : "The requested purchase request could not be found"
        }
      />
    );
  }

  return isLoading ? (
    <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />
  ) : (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6 sm:mb-8">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isRTL ? "تفاصيل طلب الشراء" : "Purchase Request Details"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {quotation.elementNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* <button
            // onClick={handleExport}
            className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? "تصدير" : "Export"}
            </span>
          </button> */}

          {quotation.status == "Pending" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={async () => {
                  setIsLoading(true);
                  await commonApi.update(
                    quotation.id,
                    {
                      main: JSON.stringify({
                        ...JSON.parse(quotation.main),
                        status: "Approved",
                      }),
                      status: "Approved",
                    },
                    "purchase_requests",
                  );

                  setQuotation({
                    ...quotation,
                    main: JSON.stringify({
                      ...JSON.parse(quotation.main),
                      status: "Approved",
                    }),
                    status: "Approved",
                  });
                  setIsLoading(false);
                }}
              >
                <Check className="h-4 w-4 sm:mr-" />
                <span className="hidden sm:inline">
                  {isRTL ? "موافقة" : "Approve"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={async () => {
                  setIsLoading(true);
                  await commonApi.update(
                    quotation.id,
                    {
                      main: JSON.stringify({
                        ...JSON.parse(quotation.main),
                        status: "Rejected",
                      }),
                      status: "Rejected",
                    },
                    "purchase_requests",
                  );

                  setQuotation({
                    ...quotation,
                    main: JSON.stringify({
                      ...JSON.parse(quotation.main),
                      status: "Rejected",
                    }),
                    status: "Rejected",
                  });
                  setIsLoading(false);
                }}
              >
                <X className="h-4 w-4 sm:mr-" />
                <span className="hidden sm:inline">
                  {isRTL ? "رفض" : "Reject"}
                </span>
              </Button>
            </>
          ) : (
            <>
              {quotation.status == "Approved" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={async () => {
                    quotation["convert"] = true;
                    navigate("/purchase/order-quotations/create", {
                      state: { newData: quotation, action: "copy" },
                    });
                  }}
                >
                  <FileAudio2 className="h-4 w-4 sm:mr-" />
                  <span className="hidden sm:inline">
                    {isRTL
                      ? "تحويل الى طلب عرض اسعار"
                      : "Convert to Quotation Request"}
                  </span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={async () => {
                  setIsLoading(true);
                  await commonApi.update(
                    quotation.id,
                    {
                      main: JSON.stringify({
                        ...JSON.parse(quotation.main),
                        status: "Pending",
                      }),
                      status: "Pending",
                    },
                    "purchase_requests",
                  );

                  setQuotation({
                    ...quotation,
                    main: JSON.stringify({
                      ...JSON.parse(quotation.main),
                      status: "Pending",
                    }),
                    status: "Pending",
                  });
                  setIsLoading(false);
                }}
              >
                <Undo className="h-4 w-4 sm:mr-" />
                <span className="hidden sm:inline">
                  {isRTL ? "تراجع" : "Return"}
                </span>
              </Button>{" "}
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              handleCopy(
                isRTL ? "نسخ طلب الشراء" : "Copy Purchase Request",
                isRTL
                  ? `هل تريد نسخ طلب الشراء ${quotation.elementNumber}؟`
                  : `Do you want to copy purchase request ${quotation.elementNumber}?`,
                quotation,
                isRTL,
                navigate,
                "/purchase/requests/create",
              );
            }}
          >
            <Copy className="h-4 w-4 sm:mr-" />
            <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
          </Button>
          {/* 
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              printQuotation(
                {
                  ...JSON.parse(quotation.main),
                  title: isRTL ? "طلب الشراء " : "Purchase Request",
                  // element: isRTL
                  //   ? "بنود العرض"
                  //   : "Quotation Items",
                },

                isRTL,
                formatAmount,
                convertAmount,
              );
            }}
          >
            <Printer className="h-4 w-4 sm:mr-" />
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
                  ? `إرسال  ${quotation.elementNumber} إلى العميل؟`
                  : `Send  ${quotation.elementNumber} to client?`,
                isRTL
                  ? `تم إرسال  ${quotation.elementNumber} إلى العميل`
                  : ` ${quotation.elementNumber} sent to client`,
                isRTL,
              );
            }}
            className="flex-1 sm:flex-none"
          >
            <Send className="h-4 w-4 sm:mr-" />
            <span className="hidden sm:inline">
              {isRTL ? "إرسال" : "Email"}
            </span>
          </Button> */}

          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Purchases?.deletingAndEditingAllInvoices !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Purchases?.deletingAndEditingHisInvoices === true &&
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
                handleEdit(quotation, navigate, `/purchase/requests/edit`)
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
                {/* {quotation.probability && (
                  // <Badge
                  //   variant="outline"
                  //   className={getProbabilityColor(quotation.probability)}
                  // >
                  //   {quotation.probability}%
                  // </Badge>
                )} */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? " اسم الطلب" : "Request Name"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(quotation.main)?.requestName}
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

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "تاريخ الاستحقاق" : "Due Date"}
                  </span>
                </div>
                <p className="font-semibold">
                  {format(quotation.dueDate, "PPP")}
                </p>
              </div>

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

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <FileText className="h-5 w-5" />
              {isRTL ? "العناصر والخدمات" : "Items & Services"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className=" md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "الاسم" : "Name"}
                    </th>
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "الكمية" : "Quantity"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(quotation.main).items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="p-2 text-start">{item.productName}</td>
                      <td className="p-2 text-start">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            {/* <div className="block md:hidden space-y-3">
              {JSON.parse(quotation.main).items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-3 bg-muted/20"
                >
                  <div className="space-y-2">
                    <div className="font-medium text-sm">
                      {isRTL ? "الاسم" : "Name"}
                    </div>
                    <div className="text-sm">{item.productName}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "الكمية" : "Quantity"}
                      </div>
                      <div className="font-medium text-sm">{item.quantity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div> */}

            <Separator className="my-4" />

            {/* <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                {JSON.parse(quotation.main).amount.totalTax > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>{isRTL ? "الضريبة:" : "Tax:"}</span>
                    <span>{JSON.parse(quotation.main).amount.totalTax}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                  <span>{isRTL ? "المجموع:" : "Total:"}</span>
                  <span>{JSON.parse(quotation.main).amount.total}</span>
                </div>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </motion.div>

      {/* Terms & Conditions */}
      {JSON.parse(quotation.main).terms && (
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
                {JSON.parse(quotation.main).terms}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notes */}
      {JSON.parse(quotation.main).notes && (
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
                {JSON.parse(quotation.main).notes}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <DisplayImages data={JSON.parse(quotation.attachments)?.images} />
    </div>
  );
};

export default ViewRequestsPurchase;
