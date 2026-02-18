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
  Trash2,
  Box,
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
  handleView,
} from "@/lib/function";
import { printQuotation } from "@/utils/quotationPrintPdf";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { commonApi } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency } from "@/data/data";

const InventoryView: React.FC = () => {
  const [mainData, setMainData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount, convertAmount } = useCurrency();

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
        title={isRTL ? "غير موجود" : " Not Found "}
        description={
          isRTL ? " الطلب غير متوفر" : "The requested item could not be found"
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
              {isRTL ? "تفاصيل الجرد" : "Inventory Details"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {mainData.elementNumber}
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

          {/* <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              printQuotation(
                {
                  ...JSON.parse(mainData.main),
                  title: isRTL ? " طلب  " : " Stock Order ",
                },

                isRTL,
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
                  ? `إرسال ${mainData.elementNumber} إلى العميل؟`
                  : `Send ${mainData.elementNumber} to client?`,
                isRTL
                  ? `تم إرسال ${mainData.elementNumber} إلى العميل`
                  : `${mainData.elementNumber} sent to client`,
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

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              handleView(mainData, navigate, `/inventory/now`);
            }}
          >
            <Box className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isRTL ? "جرد" : "Inventory"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
            onClick={async () => {
              setIsSubmitting(true);
              var res = await commonApi.delete(
                isRTL ? "حذف" : "Delete",
                isRTL
                  ? `هل أنت متأكد من حذف ${mainData.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete ${mainData.elementNumber}? This action cannot be undone.`,
                mainData.id,
                mainData.tableName,
                isRTL,
                setIsRefreshing,
              );
              console.log(" deleting res:", res);

              setIsSubmitting(false);

              if (res) {
                navigate(-1);
              }
            }}
          >
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
            )}

            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isRTL ? "حذف" : "Delete"}</span>
          </Button>

          {(JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Inventory?.update !== false && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleEdit(mainData, navigate, "/inventory/inventory/edit")
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
                    {isRTL ? "المستودع" : "Warehouse"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
                  {JSON.parse(mainData.main).warehouse}
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
      {JSON.parse(mainData.items)?.items.length > 0 && (
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
              <div className=" md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "الرقم التسلسلي" : "SKU"}
                      </th>

                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "الاسم" : "Name"}
                      </th>

                      {/* <th className="text- p-2 font-semibold">
                      {isRTL ? "الوصف" : "Description"}
                    </th> */}
                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "الكمية بالنظام" : "System Quantity"}
                      </th>

                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "الكمية الفعلية" : "Actual Quantity"}
                      </th>

                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "نقص/زيادة" : "Shortage/Excess"}
                      </th>

                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "سعر" : "Price"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {JSON.parse(mainData.items)?.items.map((item, index) => (
                      <tr
                        key={item.id}
                        className={index % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        <td className="p-2 text-start">{item.sku}</td>
                        <td className="p-2 text-start">{item.elementNumber}</td>

                        <td className="p-2 text-start">
                          {JSON.parse(item.main)?.stockQuantity}
                        </td>
                        <td className="p-2 text-start">
                          {item.currentStockQuantity}
                        </td>
                        <td className="p-2 text-start">
                          {JSON.parse(item.main)?.stockQuantity -
                            item.currentStockQuantity}
                        </td>
                        <td className="p-2 text-start">
                          {" "}
                          {formatAmount(
                            convertAmount(
                              item.totalAmount,
                              localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                            ),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* <div className="block md:hidden space-y-3">
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
                        {item.unitPrice}
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
                      <div className="font-semibold text-sm">{item.total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div> */}
            </CardContent>
          </Card>
        </motion.div>
      )}
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

export default InventoryView;
