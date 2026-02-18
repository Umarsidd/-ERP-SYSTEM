import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  DollarSign,
  FileText,
  Printer,
  Edit,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainIcon } from "@/components/common/mainIcon";
import { Loading } from "@/components/common/loading";
import {
  getStatusLabel,
  handleEdit,
} from "@/lib/function";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { printEntry } from "@/utils/entryPrintPdf";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";

const ViewEntry: React.FC = () => {
  const [mainData, setMainData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatAmount, convertAmount } = useCurrency();

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const viewData = location.state?.viewFrom;

  const { isRTL } = useLanguage();

  useEffect(() => {    console.log(viewData);

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
        title={isRTL ? "غير موجود" : " Not Found"}
        description={
          isRTL
            ? ""
            : ""
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
              {isRTL ? "تفاصيل القيد " : "Entry Details"}
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
              printEntry(
                {
                  ...JSON.parse(mainData.main),
                  title: isRTL ? "الحسابات" : "Accounts",
                  totalAmount: formatAmount(
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
                  ),
                  // element: isRTL
                  //   ? "بنود الفاتورة المرتجعة"
                  //   : "Return Items",
                },
                isRTL,
              );
            }}
          >
            <Printer className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isRTL ? "طباعة" : "Print"}
            </span>
          </Button>


          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Accounts?.editAndDeleteAllEntry !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Accounts?.editAndDeleteHisEntry === true &&
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
                handleEdit(mainData, navigate, `/accounts/daily-entries/edit`)
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
                {/* <Badge className={getStatusColor(mainData.status)}>
                  {getStatusLabel(mainData.status, isRTL)}
                </Badge> */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "مبلغ القيد " : "Entry Amount"}
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
            <div className="block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "الاسم" : "Name"}
                    </th>
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "مركز التكلفة" : "Cost Center"}
                    </th>
                    {/* <th className="text-start p-2 font-semibold">
                      {isRTL ? "الوصف" : "Description"}
                    </th> */}
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "ضريبة %" : "Tax %"}
                    </th>{" "}
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "مدين" : "Debit"}
                    </th>
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "دائن" : "Credit"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(mainData.main).items.map((item, index) => (
                    <tr
                      key={item?.id}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="p-2">
                        {getStatusLabel(item.guideName, isRTL)}
                      </td>
                      <td className="p-2">
                        {getStatusLabel(item.costCenterName, isRTL)}
                      </td>
                      <td className="p-2">{item.taxRate}</td>{" "}
                      <td className="p-2">
                        {" "}
                        {formatAmount(
                          convertAmount(
                            item.debit ?? 0,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          ((JSON.parse(mainData.main)?.currency &&
                            JSON.parse(JSON.parse(mainData.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                        )}
                      </td>
                      <td className="p-2">
                        {" "}
                        {formatAmount(
                          convertAmount(
                            item.credit ?? 0,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          ((JSON.parse(mainData.main)?.currency &&
                            JSON.parse(JSON.parse(mainData.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-full sm:w-40 space-y-2">
                <div className="flex justify-between font-bold text-base sm:text-lg border- pt-2">
                  <span>{isRTL ? "المجموع:" : "Total:"}</span>
                  <span>
                    {" "}
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

      {mainData.attachments && (
        <div className="mt-8 mb-2">
          <DisplayImages data={JSON.parse(mainData.attachments)?.images} />
        </div>
      )}
    </div>
  );
};

export default ViewEntry;
