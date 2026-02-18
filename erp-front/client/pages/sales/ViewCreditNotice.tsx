import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  DollarSign,
  Printer,
  Edit,
  Copy,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { printUnifiedInvoice } from "@/utils/invoicePrintPdf";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { CustomerInformation } from "@/components/customer/CustomerInformation";
import { Items } from "@/components/commonView/Items";
import { NoteAndTerm } from "@/components/commonView/NoteAndTerm";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";

const ViewCreditNotice: React.FC = () => {
  const [mainData, setMainData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatAmount, convertAmount } = useCurrency();

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const viewData = location.state?.viewFrom;

  const { isRTL } = useLanguage();

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
        title={isRTL ? "الاشعار الدائن غير موجود" : "Credit Notice Not Found"}
        description={
          isRTL
            ? "الاشعار الدائن المطلوب غير متوفر"
            : "The requested credit notices could not be found"
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
              {isRTL ? "تفاصيل الاشعار الدائن" : "Credit Notice Details"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {mainData.elementNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              handleCopy(
                isRTL ? "نسخ الاشعار الدائن" : "Copy Credit Notice",
                isRTL
                  ? `هل تريد نسخ الاشعار الدائن ${mainData.elementNumber}؟`
                  : `Do you want to copy credit notice ${mainData.elementNumber}?`,
                mainData,
                isRTL,
                navigate,
                "/sales/credit-notices/create",
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
              printUnifiedInvoice(
                {
                  ...JSON.parse(mainData.main),
                },
                isRTL,
                "credit_notices", // tableName
                formatAmount,
                convertAmount,
                isRTL ? "اشعار دائن" : "CREDIT NOTICE" // title
              );
            }}
          >
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isRTL ? "طباعة" : "Print"}
            </span>
          </Button>

          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Sales?.deletingAndEditingAllCreditNotices !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Sales?.deletingAndEditingHisCreditNotices === true &&
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user?.id === JSON.parse(mainData.createdBy).id)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleEdit(mainData, navigate, `/sales/credit-notices/edit`)
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
                    {isRTL ? "مبلغ الاشعار الدائن" : "Credit Notices Amount"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
                  {formatAmount(
                    convertAmount(
                      mainData.totalAmount ?? 0,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                    ((JSON.parse(mainData.main)?.currency &&
                      JSON.parse(JSON.parse(mainData.main)?.currency)
                        ?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                    selectedSymbol,
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
                  {format(mainData.issueDate, "PPP")}
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
                  {JSON.parse(mainData.createdBy)?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CustomerInformation data={mainData} />
      <Items data={mainData} />
      {/* Notes and Terms */}
      <NoteAndTerm data={mainData} />
      <DisplayImages data={JSON.parse(mainData.attachments)?.images} />
    </div>
  );
};

export default ViewCreditNotice;
