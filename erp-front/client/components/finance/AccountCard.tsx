import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  getStatusColor,
  getStatusLabel,
  handleEdit,
  handleView,
} from "@/lib/function";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightLeft,
  Banknote,
  Edit,
  Eye,
  Flag,
  MoreHorizontal,
  Pause,
  Send,
  Trash2,
} from "lucide-react";
import { commonApi } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency } from "@/data/data";

export default function AccountCard({
  data,
  setIsRefreshing,
  loadData,
  setIsLoading,
  totalAccounts,
  //name, accountNumber, currency, balance, type,status, onEdit, onDelete
}) {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { formatAmount, convertAmount } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className=""
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-6 h-6 " />

                    <h3 className="font-semibold text-lg text-foreground">
                      {getStatusLabel(data.type, isRTL)}
                    </h3>
                    <Badge className={getStatusColor(data.status)}>
                      {getStatusLabel(data.status, isRTL)}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <button
                    onClick={() => {
                      handleView(
                        data,
                        navigate,
                        `/finance/bank-accounts/${data?.id}/view`,
                      );
                    }}
                    className="w-full flex items-center space-x-2 rtl:space-x-reverse px-2 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                  >
                    <Eye className="w-4 h-4 " />
                  </button>

                  <div className="relative group">
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 transform hover:scale-105">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-20">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            handleEdit(
                              data,
                              navigate,
                              `/finance/bank-accounts/edit`,
                            );
                          }}
                          className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                        >
                          <Edit className="w-4 h-4 " />
                          <span>{isRTL ? "تعديل" : "Edit"}</span>
                        </button>

                        {/* Transfer Money Button */}
                        {totalAccounts > 1 && (
                          <button
                            onClick={() => {
                              navigate(`/finance/treasury-conversion`, {
                                state: { fromSafeId: data.id }
                              });
                            }}
                            className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                          >
                            <ArrowRightLeft className="w-4 h-4 " />
                            <span>{isRTL ? "تحويل" : "Transfer"}</span>
                          </button>
                        )}

                        {data.status !== "Active" && data.status !== "Main" ? (
                          <button
                            onClick={async () => {
                              setIsLoading(true);
                              await commonApi.update(
                                data.id,
                                {
                                  main: JSON.stringify({
                                    ...JSON.parse(data.main),
                                    status: "Active",
                                  }),
                                  status: "Active",
                                },
                                "bank_accounts",
                              );
                              loadData();
                              // setIsRefreshing(false);
                            }}
                            className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                          >
                            <Pause className="w-4 h-4 " />
                            <span>{isRTL ? "تنشيط" : "Activate"}</span>
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              setIsLoading(true);
                              await commonApi.update(
                                data.id,
                                {
                                  main: JSON.stringify({
                                    ...JSON.parse(data.main),
                                    status: "Paused",
                                  }),
                                  status: "Paused",
                                },
                                "bank_accounts",
                              );
                              loadData();
                              //  setIsRefreshing(false);
                            }}
                            className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                          >
                            <Pause className="w-4 h-4 " />
                            <span>{isRTL ? "تعطيل" : "Disable"}</span>
                          </button>
                        )}
                        {data.status !== "Main" && (
                          <button
                            onClick={async () => {
                              setIsLoading(true);

                              await commonApi.updateOtherFields(
                                "bank_accounts",
                                "status",
                                "Main",
                                {
                                  main: JSON.stringify({
                                    ...JSON.parse(data.main),
                                    status: "Active",
                                  }),
                                  status: "Active",
                                },
                              );

                              await commonApi.update(
                                data.id,
                                {
                                  main: JSON.stringify({
                                    ...JSON.parse(data.main),
                                    status: "Main",
                                  }),
                                  status: "Main",
                                },
                                "bank_accounts",
                              );
                              loadData();
                              //   setIsRefreshing(false);
                            }}
                            className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                          >
                            <Flag className="w-4 h-4 " />
                            <span>{isRTL ? "رئيسي" : "Main"}</span>
                          </button>
                        )}
                        <div className="border-t border-border my-1"></div>
                        <button
                          onClick={() =>
                            commonApi.delete(
                              isRTL ? "حذف" : "Delete",
                              isRTL
                                ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                                : `Are you sure you want to delete ${data.elementNumber}? This action cannot be undone.`,
                              data.id,
                              data.tableName,
                              isRTL,
                              setIsRefreshing,
                            )
                          }
                          className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{isRTL ? "حذف" : "Delete"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "الرصيد الحالي" : "Current Balance"}
                    </p>
                    <p className="font-semibold text-lg">
                      {" "}
                      {formatAmount(
                        convertAmount(
                          data.currentBalance ?? data.totalAmount ?? 0,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "الاسم" : "Name"}
                    </p>
                    <p className="font-medium">{data.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "رقم الحساب" : "Account Number"}
                    </p>
                    <p className="font-medium">{data.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "العملة" : "Currency"}
                    </p>
                    <p className="font-medium">{data.currency}</p>
                  </div>
                </>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
