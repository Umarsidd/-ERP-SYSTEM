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
  Trash2,
  Eye,
  CreditCard,
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
  handlePayment,
  handleSendToClient,
  handleView,
} from "@/lib/function";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { commonApi } from "@/lib/api";
import { generateTransactionId } from "@/lib/products_function";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import { useCurrency } from "@/contexts/CurrencyContext";

const ViewInstallmentAgreements: React.FC = () => {
  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const viewData = location.state?.viewFrom;
  const { formatAmount, convertAmount } = useCurrency();

  const { isRTL } = useLanguage();

  useEffect(() => {
    console.log(JSON.parse(viewData.installmentsList));
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
              {isRTL ? "تفاصيل اتفاقيات الاقساط " : "Installments Details"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {quotation.elementNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() =>
        { 
          
          handleView(
                data,
                navigate,
                `/${type}/${titleLink}/${data?.id}/view`,
              );
            
            }
            }
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isRTL ? "حذف" : "Delete"}</span>
          </Button> */}

          {quotation.status == "Unpaid" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
              onClick={
                async () => {
                  setIsSubmitting(true);
                  var res = await commonApi.delete(
                    isRTL ? "حذف" : "Delete",
                    isRTL
                      ? `هل أنت متأكد من حذف ${quotation.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${quotation.elementNumber}? This action cannot be undone.`,
                    quotation.id,
                    quotation.tableName,
                    isRTL,
                    setIsRefreshing,
                  );
                  console.log(" deleting res:", res);

                  setIsSubmitting(false);

                  if (res) {
                    navigate(-1);
                  }
                }
                // commonApi.delete(
                //   isRTL ? "حذف" : "Delete",
                //   isRTL
                //     ? `هل أنت متأكد من حذف ${quotation.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                //     : `Are you sure you want to delete ${quotation.elementNumber}? This action cannot be undone.`,
                //   quotation.id,
                //   quotation.tableName,
                //   isRTL,
                //   setIsRefreshing,
                // )
              }
            >
              {" "}
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
              )}
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {isRTL ? "حذف" : "Delete"}
              </span>
            </Button>
          )}

          {quotation.status == "Unpaid" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleEdit(quotation, navigate, `/installments/agreements/edit`)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL
                      ? "مبلغ اتفاقية التقسيط"
                      : "Installment Agreement Amount"}
                  </span>
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
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "مبلغ القسط" : "Installment Amount"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
                  {formatAmount(
                    convertAmount(
                      quotation.installmentAmount ?? 0,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    ((JSON.parse(quotation.main)?.currency &&
                      JSON.parse(JSON.parse(quotation.main)?.currency)
                        ?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                  )}{" "}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "المبلغ المدفوع" : "Paid Amount"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
                  {formatAmount(
                    convertAmount(
                      quotation.installmentAmountPaid ?? 0,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    ((JSON.parse(quotation.main)?.currency &&
                      JSON.parse(JSON.parse(quotation.main)?.currency)
                        ?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                  )}{" "}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "المبلغ المتبقي" : "Remaining Amount"}
                  </span>
                </div>
                <p className="font-semibold text-lg">
                  {/* {quotation.currency} */}{" "}
                  {formatAmount(
                    convertAmount(
                      Math.ceil(
                        Number(
                          quotation.totalAmount -
                            quotation.installmentAmountPaid,
                        ),
                      ) ?? 0,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                    ),
                    ((JSON.parse(quotation.main)?.currency &&
                      JSON.parse(JSON.parse(quotation.main)?.currency)
                        ?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                  )}{" "}
                  {
                    // Math.ceil(
                    //   Number(
                    //     quotation.totalAmount - quotation.installmentAmountPaid,
                    //   ),
                    // ) //.toFixed(2)
                  }
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "تاريخ بدء الأقساط" : "Issue Date"}
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
                    {isRTL ? "تاريخ استحقاق القسط" : "Due Date"}
                  </span>
                </div>
                <p className="font-semibold">
                  {quotation?.dueDate ? format(quotation.dueDate, "PPP") : "-"}
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

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "عدل بواسطة" : "Edited By"}
                  </span>
                </div>
                <p className="font-semibold">
                  {JSON.parse(quotation.updatedBy)?.name}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {JSON.parse(quotation.installmentsList)?.data?.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {p.elementNumber}
                  </div>
                  {/* <div className="font-semibold">{p.elementNumber}</div> */}
                  <div className="font-bold">
                    {" "}
                    <span className="text-xs ">
                      {isRTL ? " القسط: " : " Amount: "}
                      {Number(p.installmentAmount).toFixed(2)}
                    </span>
                  </div>

                  <div className="font-">
                    {" "}
                    <span className="text-xs text-success ">
                      {isRTL ? "المدفوع: " : " Amount: "}{" "}
                      {Number(p.installmentAmountPaid).toFixed(2)}
                    </span>
                  </div>

                  <div className="font-">
                    {" "}
                    <span className="text-xs text-warning ">
                      {isRTL ? " المتبقي: " : " Remaining: "}{" "}
                      {Number(p.remainingAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-left ">
                  <div className="text-sm ">
                    {" "}
                    <Badge className={getStatusColor(p.status)}>
                      {getStatusLabel(p.status, isRTL)}
                    </Badge>
                  </div>
                  <div className="text-sm mt-2">{p.customer?.name}</div>

                  <div className="text-sm">{format(p.issueDate, "PPP")}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between h-5">
                {p.status != "Paid" && (
                  <Button
                    onClick={() => {
                      navigate(`/sales/payments/new`, {
                        state: {
                          newData: {
                            PartiallyPaid:
                              p.status == "PartiallyPaid" ? true : false,
                            installmentsMainId: quotation.id,
                            invoiceID: quotation.invoiceID,
                            invoice: quotation.invoice,
                            main: quotation.main,
                            installmentsOtherId: p.id,
                            installmentsList: quotation.installmentsList,
                            paymentMethod: "Cash",

                            installmentNumber: quotation.installmentNumber,
                            installmentAmount: p.installmentAmount,
                            installmentAmountPaid:
                              quotation.installmentAmountPaid,
                            remainingAmount: p.remainingAmount,

                            customerId: p.customerId,
                            customer: p.customer,
                            attachments: [],
                            status: "Completed",
                            amount:
                              p.status == "PartiallyPaid"
                                ? p.remainingAmount
                                : p.installmentAmount,
                            // ? Number(p.remainingAmount).toFixed(2)
                            // : Number(p.installmentAmount).toFixed(2),
                            issueDate: new Date(p.issueDate)
                              .toISOString()
                              .split("T")[0],
                            transactionId: generateTransactionId(),
                            notes: "",
                            elementNumber: generateTransactionId(),
                            currency:
                              JSON.parse(quotation.main)?.currency ||
                              JSON.stringify({
                                code:
                                  localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                                symbol:
                                  localStorage.getItem(
                                    "selectedCurrencySymbol",
                                  ) ?? selectedSymbol,
                              }),
                          },
                          action: "installments",
                        },
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center  py-2 bg- text-primary- rounded-lg hover:bg-secondary transition-colors text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isRTL ? "دفع" : "Payment"}</span>
                  </Button>
                )}

                {/* <div
                  onClick={() => {
                    handleView(
                      p,
                      navigate,
                      `/inventory/inventory/view/${p.id}`,
                    );
                  }}
                  //  to={`/customers/view/${c.id}`}
                  className="text-sm text-primary cursor-pointer hover:underline"
                >
                  {isRTL ? "عرض" : "View"}
                </div> */}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ViewInstallmentAgreements;
