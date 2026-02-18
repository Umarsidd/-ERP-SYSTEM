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
  Check,
  FileAudio2,
  Undo,
  X,
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
import { CustomerInformation } from "@/components/customer/CustomerInformation";
import { Items } from "@/components/commonView/Items";
import { NoteAndTerm } from "@/components/commonView/NoteAndTerm";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";

const ViewPurchaseOrders: React.FC = () => {
  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatAmount, convertAmount } = useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const viewData = location.state?.viewFrom;

  const { isRTL } = useLanguage();

  useEffect(() => {
    console.log(JSON.parse(viewData.main));
    setQuotation(viewData);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return  <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />;
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
              {isRTL ? "تفاصيل أمر الشراء" : "Purchase Order Details"}
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
                    "purchase_orders",
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
                    "purchase_orders",
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

                    navigate("/purchase/invoices/create", {
                      state: { newData: quotation, action: "copy" },
                    });
                  }}
                >
                  <FileAudio2 className="h-4 w-4 sm:mr-" />
                  <span className="hidden sm:inline">
                    {isRTL
                      ? "تحويل الى فاتورة شراء"
                      : "Convert to Purchase Invoice"}
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
                    "purchase_orders",
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
                isRTL ? "نسخ أمر الشراء" : "Copy Order",
                isRTL
                  ? `هل تريد نسخ أمر الشراء ${quotation.elementNumber}؟`
                  : `Do you want to copy order ${quotation.elementNumber}?`,
                quotation,
                isRTL,
                navigate,
                "/purchase/orders/create",
              );
            }}
          >
            <Copy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              printQuotation(
                {
                  ...JSON.parse(quotation.main),
                  title: isRTL ? "أوامر الشراء" : "Purchase Orders",
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
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isRTL ? "طباعة" : "Print"}
            </span>
          </Button>
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
                handleEdit(quotation, navigate, `/purchase/orders/edit`)
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
                    ((JSON.parse(quotation.main)?.currency &&
                      JSON.parse(JSON.parse(quotation.main)?.currency)
                        ?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CakeSlice className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "صالح حتى" : "Valid Until"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
                  {/* {quotation.currency} */}{" "}
                  {JSON.parse(quotation.main).validUntil}{" "}
                  {isRTL ? "يوم" : "days"}
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
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "صالح حتى" : "Valid Until"}
                  </span>
                </div>
                <p className="font-semibold">
                  {format(quotation.validUntil, "PPP")}
                </p>
              </div> */}

              {/* {quotation.createdAt && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Send className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? "تاريخ الإرسال" : "Sent Date"}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {format(quotation.createdAt, "PPP")}
                  </p>
                </div>
              )} */}

              {/* {quotation.responseDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? "تاريخ الرد" : "Response Date"}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {format(quotation.responseDate, "PPP")}
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

              {/* {JSON.parse(quotation.main).customer && (
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
                      ? JSON.parse(quotation.main).customer.name
                      : JSON.parse(quotation.main).customer.name}
                  </p>
                </div>
              )} */}

              {/* {quotation.followUpDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">
                      {isRTL ? "متابعة في" : "Follow Up"}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {format(quotation.followUpDate, "PPP")}
                  </p>
                </div>
              )} */}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CustomerInformation data={quotation} />
      <Items data={quotation} />
      <NoteAndTerm data={quotation} />
      <DisplayImages data={JSON.parse(quotation.attachments)?.images} />
    </div>
  );
};

export default ViewPurchaseOrders;
