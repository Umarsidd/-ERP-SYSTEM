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
  CreditCard,
  Pause,
  Flag,
  Users,
  Warehouse,
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
  handleSendToClient,
} from "@/lib/function";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { commonApi } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency } from "@/data/data";

const ViewBankAccounts: React.FC = () => {
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
              {isRTL ? "تفاصيل الحسابات البنكية" : "Bank Accounts Details"}
            </h1>
            {/* <p className="text-muted-foreground text-sm sm:text-base">
              {quotation.elementNumber}
            </p> */}
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {quotation.status !== "Active" && quotation.status !== "Main" ? (
            <Button
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                await commonApi.update(
                  quotation.id,
                  {
                    main: JSON.stringify({
                      ...JSON.parse(quotation.main),
                      status: "Active",
                    }),
                    status: "Active",
                  },
                  "bank_accounts",
                );

                setQuotation({
                  ...quotation,
                  main: JSON.stringify({
                    ...JSON.parse(quotation.main),
                    status: "Active",
                  }),
                  status: "Active",
                });

                setIsLoading(false);
              }}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Pause className="w-4 h-4 " />
              <span>{isRTL ? "تنشيط" : "Activate"}</span>
            </Button>
          ) : (
            <Button
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                await commonApi.update(
                  quotation.id,
                  {
                    main: JSON.stringify({
                      ...JSON.parse(quotation.main),
                      status: "Paused",
                    }),
                    status: "Paused",
                  },
                  "bank_accounts",
                );
                setQuotation({
                  ...quotation,
                  main: JSON.stringify({
                    ...JSON.parse(quotation.main),
                    status: "Paused",
                  }),
                  status: "Paused",
                });
                setIsLoading(false);
              }}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Pause className="w-4 h-4 " />
              <span>{isRTL ? "تعطيل" : "Disable"}</span>
            </Button>
          )}

          {quotation.status !== "Main" && (
            <Button
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                await commonApi.update(
                  quotation.id,
                  {
                    main: JSON.stringify({
                      ...JSON.parse(quotation.main),
                      status: "Main",
                    }),
                    status: "Main",
                  },
                  "bank_accounts",
                );
                setQuotation({
                  ...quotation,
                  main: JSON.stringify({
                    ...JSON.parse(quotation.main),
                    status: "Main",
                  }),
                  status: "Main",
                });
                setIsLoading(false);
              }}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Flag className="w-4 h-4 " />
              <span>{isRTL ? "رئيسي" : "Main"}</span>
            </Button>
          )}

          {(JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Finance?.update !== false && (
            <Button
              disabled={isLoading}
              variant="outline"
              size="sm"
              onClick={() =>
                handleEdit(quotation, navigate, `/finance/bank-accounts/edit`)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{isRTL ? "النوع" : "Type"}</span>
                </div>
                <p className="font-semibold text-lg">
                  {/* {quotation.currency} */}{" "}
                  {getStatusLabel(quotation.type, isRTL)}
                </p>
              </div>

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

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{isRTL ? "الاسم" : "Name"}</span>
                </div>
                <p className="font-semibold">{quotation.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">
                    {isRTL ? "رقم الحساب" : "Account Number"}
                  </span>
                </div>
                <p className="font-semibold">{quotation.accountNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {JSON.parse(quotation.main)?.depositChoice?.length >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {JSON.parse(quotation.main)?.deposit === "Specific Branch" ? (
                    <>
                      <Warehouse className="h-5 w-5" />
                      <span>{isRTL ? "الفروع" : "Branches"}</span>{" "}
                    </>
                  ) : JSON.parse(quotation.main)?.deposit ===
                    "Specific Employee" ? (
                    <>
                      {" "}
                      <Users className="h-5 w-5" />
                      <span>{isRTL ? "مستخدمون" : "Users"}</span>
                    </>
                  ) : (
                    <></>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {JSON.parse(quotation.main)?.depositChoice?.length >= 1 && (
                <div className="mt- mb-">
                  <div className="text-xs text-muted-foreground"></div>
                  <div className="mt- grid grid-cols-1 sm:grid-cols-4 gap-1">
                    {JSON.parse(quotation.main)?.depositChoice.map(
                      (ct, idx) =>
                        ct.name !== "" && (
                          <div key={idx} className="p-3 border m-2  rounded-md">
                            <div className="font-medium">{ct.name}</div>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notes */}
      {quotation.description && (
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
                {quotation.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ViewBankAccounts;
