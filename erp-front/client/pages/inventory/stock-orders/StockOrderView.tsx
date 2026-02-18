import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CryptoJS from "crypto-js";
import {
  Calendar,
  User,
  DollarSign,
  Printer,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainIcon } from "@/components/common/mainIcon";
import { Loading } from "@/components/common/loading";
import { getStatusColor, getStatusLabel, handleEdit } from "@/lib/function";
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
import Swal from "sweetalert2";
import { changeProductData, loadProductData, loadStockOrderData, minusOrAddDeleteProductData } from "@/lib/stock_order_function";

const StockOrderView: React.FC = () => {
  const [mainData, setMainData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    loadStockOrderData(setIsLoading, location, setMainData);
  }, [isReloading]);



  if (isLoading) {
    return <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />;
  }

  if (!mainData) {
    return (
      <ViewEmpty
        title={isRTL ? "غير موجود" : " Not Found"}
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
              {isRTL ? "تفاصيل الطلب" : "Order Details"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {mainData.elementNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {mainData.status !== "stockApproved" &&
            mainData.status !== "stockRejected" &&
            (JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Inventory?.approvalRejectionOrder !== false && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={async () => {
                    setIsLoading(true);

                    loadProductData(mainData).then(async (productsData) => {
                      var resProducts = await minusOrAddDeleteProductData(
                        JSON.parse(mainData.main)?.type === "Add",
                        productsData,
                        mainData,
                      );

                      console.log("products after delete:", resProducts);
                      changeProductData(resProducts);
                    });

                    if (
                      mainData?.invoiceID !== null &&
                      mainData?.invoiceID !== undefined
                    ) {
                      var res2 = await commonApi.update(
                        mainData.invoiceID,
                        {
                          updatedAt: new Date().toISOString(),

                          updatedBy: JSON.stringify(
                            JSON.parse(
                              CryptoJS.AES.decrypt(
                                localStorage.getItem("user"),
                                import.meta.env.VITE_SECRET,
                              ).toString(CryptoJS.enc.Utf8),
                            )?.user,
                          ),
                          stockStatus: "stockApproved",
                        },
                        JSON.parse(mainData.main)?.name,
                      );
                    }

                    await commonApi.update(
                      mainData.id,
                      {
                        main: JSON.stringify({
                          ...JSON.parse(mainData.main),
                          status: "stockApproved",
                        }),
                        status: "stockApproved",
                      },
                      "inventory_stock_order",
                    );

                    // if (JSON.parse(mainData.main)?.type === "Add") {
                    //   addOrEditAccountsEntry(
                    //     location,
                    //     {
                    //       elementNumber: mainData.elementNumber,
                    //       issueDate: mainData.issueDate,
                    //       amount: { total: mainData.totalAmount },
                    //       taxRate: JSON.parse(mainData.main)?.amount?.totalTax,
                    //     },
                    //     mainData.invoiceID,
                    //     "addStorePermission",
                    //     "addStorePermission",
                    //     "main_stock",
                    //   );
                    // } else {
                    //   addOrEditAccountsEntry(
                    //     location,
                    //     {
                    //       elementNumber: mainData.elementNumber,
                    //       issueDate: mainData.issueDate,
                    //       amount: { total: mainData.totalAmount },
                    //       taxRate: JSON.parse(mainData.main)?.amount?.totalTax,
                    //     },
                    //     mainData.invoiceID,
                    //     "StoreDisbursementOrder",
                    //     "main_stock",
                    //     "StoreDisbursementOrder",
                    //   );
                    // }

                    setIsReloading(!isReloading);
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

                    if (
                      mainData?.invoiceID !== null &&
                      mainData?.invoiceID !== undefined
                    ) {
                      var res2 = await commonApi.update(
                        mainData.invoiceID,
                        {
                          updatedAt: new Date().toISOString(),

                          updatedBy: JSON.stringify(
                            JSON.parse(
                              CryptoJS.AES.decrypt(
                                localStorage.getItem("user"),
                                import.meta.env.VITE_SECRET,
                              ).toString(CryptoJS.enc.Utf8),
                            )?.user,
                          ),
                          stockStatus: "stockRejected",
                        },
                        JSON.parse(mainData.main)?.name,
                      );
                    }

                    await commonApi.update(
                      mainData.id,
                      {
                        main: JSON.stringify({
                          ...JSON.parse(mainData.main),
                          status: "stockRejected",
                        }),
                        status: "stockRejected",
                      },
                      "inventory_stock_order",
                    );
                    setIsReloading(!isReloading);
                  }}
                >
                  <X className="h-4 w-4 sm:mr-" />
                  <span className="hidden sm:inline">
                    {isRTL ? "رفض" : "Reject"}
                  </span>
                </Button>
              </>
            )}

          <Button
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

          {(JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Inventory?.updateStockOrder !== false && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
              onClick={async () => {
                const result = await Swal.fire({
                  title: isRTL ? "حذف" : "Delete",
                  text: isRTL
                    ? `هل أنت متأكد من حذف ${mainData.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                    : `Are you sure you want to delete ${mainData.elementNumber}? This action cannot be undone.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: isRTL ? "حذف" : "Delete",
                  cancelButtonText: isRTL ? "إلغاء" : "Cancel",
                  confirmButtonColor: "#d33",
                });

                if (result.isConfirmed) {
                  setIsSubmitting(true);

                  // if (
                  //    JSON.parse(mainData.main)?.name === "addStorePermission" ||
                  //</div>    JSON.parse(mainData.main)?.name === "StoreDisbursementOrder"
                  // ) {

                  //  } else {
                  setIsLoading(true);

                  if (mainData.status === "stockApproved") {
                    loadProductData(mainData).then(async (productsData) => {
                      var resProducts = await minusOrAddDeleteProductData(
                        JSON.parse(mainData.main)?.type !== "Add",
                        productsData,
                        mainData,
                      );

                      console.log("products after delete:", resProducts);
                      changeProductData(resProducts);
                    });
                  }

                  if (
                    mainData?.invoiceID !== null &&
                    mainData?.invoiceID !== undefined
                  ) {
                    var res2 = await commonApi.update(
                      mainData?.invoiceID,
                      {
                        updatedAt: new Date().toISOString(),

                        updatedBy: JSON.stringify(
                          JSON.parse(
                            CryptoJS.AES.decrypt(
                              localStorage.getItem("user"),
                              import.meta.env.VITE_SECRET,
                            ).toString(CryptoJS.enc.Utf8),
                          )?.user,
                        ),
                        stockStatus: "stockPending",
                      },
                      JSON.parse(mainData?.main)?.name,
                    );
                  }

                  //   await commonApi.update(
                  //     mainData.id,
                  //     {
                  //       main: JSON.stringify({
                  //         ...JSON.parse(mainData.main),
                  //         status: "stockPending",
                  //       }),
                  //       status: "stockPending",
                  //     },
                  //     "inventory_stock_order",
                  //   );
                  //  }

                  var res = await commonApi.deleteNoDialog(
                    mainData.id,
                    mainData.tableName,
                  );

                  console.log(" deleting res:", res);

                  setIsSubmitting(false);

                  if (res) {
                    navigate("/inventory/stock-orders");
                  }

                  setIsReloading(!isReloading);
                }
              }}
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
              )}

              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {isRTL ? "حذف" : "Delete"}
              </span>
            </Button>
          )}

          {(JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Inventory?.updateStockOrder !== false && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleEdit(mainData, navigate, "/inventory/stock-orders/edit")
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "مبلغ الطلب" : "Order Amount"}
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
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{isRTL ? "النوع" : "Type"}</span>
                </div>
                <p className="font-semibold text-lg">
                  {getStatusLabel(JSON.parse(mainData.main)?.name, isRTL)}
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
      <NoteAndTerm data={mainData} />
      {mainData.attachments && (
        <div className="mt-8 mb-2">
          <DisplayImages data={JSON.parse(mainData.attachments)?.images} />
        </div>
      )}
    </div>
  );
};

export default StockOrderView;
