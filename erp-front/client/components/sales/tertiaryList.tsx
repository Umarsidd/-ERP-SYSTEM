import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye,
  User,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getReasonLabel,
  getStatusColor,
  getStatusLabel,
  handleView,
} from "@/lib/function";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { MainIcon } from "../common/mainIcon";
import { MainDropDown } from "./MainDropDown";
import { selectedCurrency, selectedSymbol } from "@/data/data";

export function TertiaryList(props: {
  data: any;
  title: any;
  titleLink: any;
  setIsRefreshing: any;
  type: any;
  sectionName: any;
  pageName?: any;
  pageName2?: any;

  // handleView: any;
}) {
  const {
    data,
    title,
    setIsRefreshing,
    titleLink,
    type,
    sectionName,
    pageName,
    pageName2,
  } = props;
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { formatAmount, convertAmount } = useCurrency();


  return (
    <AnimatePresence>
      {data?.map((data, index) => (
        <motion.div
          key={data.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MainIcon icon={data.status} />

                        <h3 className="font-semibold text-lg text-foreground">
                          {data.elementNumber}
                        </h3>
                        {titleLink != "payments" &&
                          titleLink != "recurring-invoices" && (
                            <Badge className={getStatusColor(data.status)}>
                              {getStatusLabel(data.status, isRTL)}
                            </Badge>
                          )}

                        {data?.stockStatus && (
                          <Badge className={getStatusColor(data.stockStatus)}>
                            {getStatusLabel(data.stockStatus, isRTL)}
                          </Badge>
                        )}

                        {/* { (
                          <Badge
                            variant="outline"
                            className={getProbabilityColor(data.probability)}
                          >
                            {data.probability}%
                          </Badge>
                        )} */}
                      </div>
                      {data.invoice && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Hash className="h-4 w-4" />
                            <span>
                              {isRTL
                                ? "الفاتورة الأصلية:"
                                : "Original Invoice:"}{" "}
                              {JSON.parse(data.invoice)?.elementNumber || data.invoice || "-"}


                            </span>
                          </div>
                          {/* <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{data.customer}</span>
                        </div> */}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      {(titleLink == "payments" ||
                        titleLink == "recurring-invoices") && (
                          <Badge className={getStatusColor(data.status)}>
                            {getStatusLabel(data.status, isRTL)}
                          </Badge>
                        )}
                      <button
                        onClick={() => {
                          handleView(
                            data,
                            navigate,
                            `/${titleLink}/view/${data?.id}`,
                          );
                        }}
                        className="w-full flex items-center space-x-2 rtl:space-x-reverse px-2 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                      >
                        <Eye className="w-4 h-4 " />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {titleLink == "recurring-invoices" && (
                      <>
                        {" "}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "المبلغ" : "Amount"}
                            </p>
                            <p className="font-semibold">
                              {/* {formatAmount(
                                convertAmount(
                                  data.totalAmount ?? 0,
                                  localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                                ),
                                ((JSON.parse(data.main)?.currency &&
                                  JSON.parse(JSON.parse(data.main)?.currency)
                                    ?.symbol) ||
                                  localStorage.getItem(
                                    "selectedCurrencySymbol",
                                  )) ??
                                selectedSymbol,
                              )} */}


                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "التكرار" : "Frequency"}
                            </p>
                            <p className="font-semibold">
                              {getStatusLabel(
                                JSON.parse(data.main)?.repetitionNumber,
                                isRTL,
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "تاريخ الاصدار" : "Issued Invoice"}
                            </p>
                            <p className="font-semibold">
                              {format(data.issueDate, "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {formatAmount(
                                convertAmount(
                                  data.totalAmount ?? 0,
                                  localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                                ),
                                ((JSON.parse(data.main)?.currency &&
                                  JSON.parse(JSON.parse(data.main)?.currency)
                                    ?.symbol) ||
                                  localStorage.getItem(
                                    "selectedCurrencySymbol",
                                  )) ??
                                selectedSymbol,
                              )}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "إجمالي الفواتير" : "Total Invoices"}
                            </p>
                            <p className="font-semibold">
                              {JSON.parse(data.main)?.amount.total *
                                JSON.parse(data.main)?.repetitionNumber}
                            </p>
                          </div>
                        </div>{" "}
                      </>
                    )}
                    {titleLink == "payments" && (
                      <>
                        {" "}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "المبلغ" : "Amount"}
                            </p>
                            <p className="font-semibold text-lg">
                              {formatAmount(
                                convertAmount(
                                  data.totalAmount ?? 0,
                                  localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                                ),
                                ((JSON.parse(data.main)?.currency &&
                                  JSON.parse(JSON.parse(data.main)?.currency)
                                    ?.symbol) ||
                                  localStorage.getItem(
                                    "selectedCurrencySymbol",
                                  )) ??
                                selectedSymbol,
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />

                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "طريقة الدفع" : "Method"}
                            </p>
                            <p className="font-semibold">
                              {getStatusLabel(
                                JSON.parse(data.main)?.paymentMethod,
                                isRTL,
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "تاريخ الدفع" : "Payment Date"}
                            </p>
                            <p className="font-semibold">
                              {format(data.issueDate, "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "العميل" : "Customer"}
                            </p>
                            <p className="font-medium">
                              {isRTL
                                ? JSON.parse(data.main)?.customer.name
                                : JSON.parse(data.main)?.customer.name}
                            </p>
                          </div>
                        </div>
                      </>
                    )}{" "}
                    {titleLink != "payments" &&
                      titleLink != "recurring-invoices" && (
                        <>

                          {titleLink === "requests" && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {isRTL ? "اسم الطلب" : "Request Name"}
                              </p>
                              <p className="font-semibold text-lg">
                                {JSON.parse(data.main)?.requestName}
                              </p>
                            </div>
                          )}

                          <>
                            <div className="w-[900px] flex justify-between items-start">
                              <div className="flex items-center justify-between gap-3">
                                {(() => {
                                  let imageUrl = "";
                                  try {
                                    imageUrl =
                                      JSON.parse(data?.attachments || "{}")?.images?.[0]?.url || "";
                                  } catch { }

                                  return imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={data?.name}
                                      className="w-10 h-10 rounded-full object-contain border bg-muted"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border">
                                      {data?.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                  );
                                })()}
                                {`${data?.name}`}
                              </div>
                              <div>
                                {data?.email}
                                <br />
                                {data?.phone}
                              </div>
                              <div>
                                {data?.gender}
                                <br />
                                {data?.role}
                              </div>
                            </div>

                          </>


                        </>
                      )}
                  </div>

                  {JSON.parse(data.main)?.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? "ملاحظات" : "Notes"}
                        </p>
                        <p className="text-sm">{JSON.parse(data.main).notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
