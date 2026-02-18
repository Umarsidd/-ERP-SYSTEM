import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { UnifiedInvoiceTemplateJson } from "@/components/template/InvoiceTemplateJson";
import { printUnifiedInvoice } from "@/utils/invoicePrintPdf";
import {
  Printer,
  Edit,
  Copy,
  MessageSquareReply,
  MoreHorizontal,
  CircleFadingPlus,
  CreditCard,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  handleCopy,
  handleEdit,
  handlePayment,
  handleView,
} from "@/lib/function";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { commonApi } from "@/lib/api";
import { motion } from "framer-motion";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { generateNumber } from "@/lib/products_function";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";
import { PrintTemplateService } from "@/lib/PrintTemplateService";
import { printDynamicReceipt } from "@/utils/dynamicReceiptPrint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [invoice, setInvoice] = useState(location.state?.viewFrom);
  const [loading, setLoading] = useState(false);
  //const [loading2, setLoading2] = useState(false);

  const { isRTL } = useLanguage();

  useEffect(() => {
    console.log(JSON.parse(invoice.main));
    //setLoading(false);
  }, []);

  const [installments, setInstallments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { formatAmount, convertAmount } = useCurrency();

  const [sort, setSort] = useState({
    field: "id",
    direction: "desc",
    type: "basic",
    json_path: "$.elementNumber",
  });

  useEffect(() => {
    //console.log(JSON.parse(invoice.main));
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    try {
      setLoading(true);

      var result = await commonApi.getAll(
        currentPage,
        itemsPerPage,
        [
          {
            // useFor: "search",
            field: "invoiceID",
            operator: "=",
            value: invoice.id,
            type: "basic",
            andOr: "and",
          },
        ],
        sort,
        "installments",
      );
      console.log("result", result.data);

      if (result.data && result.data.length > 0) {
        setInstallments(result.data[0]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
  //   <Loading title={isRTL ? "جاري التحميل ..." : "Loading invoice..."} />;
  // }

  if (!invoice) {
    return (
      <ViewEmpty
        title={isRTL ? "الفاتورة غير موجودة" : "Invoice not found"}
        description={
          isRTL
            ? "لم يتم العثور على الفاتورة المطلوبة."
            : "The requested invoice could not be found."
        }
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 print:hidden sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isRTL ? "عرض الفاتورة" : "Invoice View"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {invoice.elementNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center space-x-3 rtl:space-x-reverse">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="h-4 w-4 mr-2"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
          ) : Object.keys(installments).length === 0 ? (
            <>
              {invoice.status == "Unpaid" && (
                <Button
                  onClick={() => {
                    invoice["installment"] = true;

                    navigate("/installments/agreements/create", {
                      state: {
                        newData: {
                          invoiceID: invoice.id,
                          invoice: invoice.main,

                          elementNumber: invoice.elementNumber,
                          customerId: "",
                          customer: {
                            id: "",
                            name: "",
                            nameAr: "",
                            email: "",
                            phone: "",
                            address: "",
                            addressAr: "",
                            taxNumber: "",
                          },
                          issueDate: new Date().toISOString().split("T")[0],
                          dueDate: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000,
                          )
                            .toISOString()
                            .split("T")[0],
                          description: "",
                          paymentRate: "",
                          installmentNumber: 0,
                          installmentAmount: 0,
                          amount: invoice.totalAmount,
                          status: "Unpaid",
                          fields: [],
                          currency:
                            JSON.parse(invoice.main)?.currency ||
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
                  className="flex-1 sm:flex-none"
                >
                  <CircleFadingPlus className="w-4 h-4" />
                  <span>
                    {isRTL
                      ? "اضافه اتفاقية اقساط"
                      : "Add Installment Agreement"}
                  </span>
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => {
                handleView(
                  installments,
                  navigate,
                  `/installments/agreements/${invoice.id}/view`,
                );
              }}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {isRTL ? "عرض اتفاقية اقساط" : "View Installment Agreement"}

              <Eye className="w-4 h-4 " />
            </Button>
          )}

          {invoice.status !== "Paid" &&
            invoice.status !== "PaidByExcess" &&
            Object.keys(installments).length === 0 &&
            invoice.status !== "Draft" &&
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Sales?.addPaymentAllInvoices !== false ||
              ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
                ?.Sales?.addPaymentHisInvoices === true &&
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user?.id === JSON.parse(invoice.createdBy).id)) && (
              <Button
                onClick={() =>
                  handlePayment(
                    invoice,
                    navigate,
                    `/sales/payments/new`,
                    "invoices", //  "/${type}/invoices/create-invoice",
                  )
                }
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isRTL ? "دفع" : "Payment"}</span>
              </Button>
            )}

          <Button
            onClick={() => {
              printUnifiedInvoice(
                JSON.parse(invoice.main),
                isRTL,
                invoice.tableName,
                formatAmount,
                convertAmount,
              );
            }}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Printer className="w-4 h-4" />
            <span>{isRTL ? "طباعة" : "Print"}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Printer className="w-4 h-4" />
                <span>{isRTL ? "طباعة نموذج" : "Print Template"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {PrintTemplateService.getTemplates().map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => {
                    const invoiceData = {
                      ...invoice,
                      ...JSON.parse(invoice.main),
                    };
                    printDynamicReceipt(template, invoiceData, isRTL);
                  }}
                >
                  {template.name}
                </DropdownMenuItem>
              ))}
              {PrintTemplateService.getTemplates().length === 0 && (
                <DropdownMenuItem disabled>No templates found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <Button
            onClick={() =>
              handleSendToClient(
                isRTL ? "إرسال للعميل" : "Send to Client",
                isRTL
                  ? `إرسال الفاتورة ${invoice.elementNumber} إلى العميل؟`
                  : `Send invoice ${invoice.elementNumber} to client?`,
                isRTL
                  ? `تم إرسال الفاتورة ${invoice.elementNumber} إلى العميل`
                  : `Invoice ${invoice.elementNumber} sent to client`,
                isRTL,
              )
            }
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Send className="w-4 h-4" />
            <span>{isRTL ? "إرسال" : "Send"}</span>
          </Button> */}

          <Button
            onClick={() =>
              handleCopy(
                isRTL ? "نسخ الفاتورة" : "Copy Invoice",
                isRTL
                  ? `هل تريد نسخ الفاتورة ${invoice.elementNumber}؟`
                  : `Do you want to copy invoice ${invoice.elementNumber}?`,
                invoice,
                isRTL,
                navigate,
                "/sales/invoices/create-invoice",
              )
            }
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Copy className="w-4 h-4" />
            <span>{isRTL ? "نسخ" : "Copy"}</span>
          </Button>
          {Object.keys(installments).length === 0 &&
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Sales?.deletingAndEditingAllInvoices !== false ||
              ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
                ?.Sales?.deletingAndEditingHisInvoices === true &&
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user?.id === JSON.parse(invoice.createdBy).id)) && (
              <Button
                onClick={() =>
                  handleEdit(invoice, navigate, `/sales/invoices/edit`)
                }
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                <span>{isRTL ? "تحرير" : "Edit"}</span>
              </Button>
            )}
          <div className="relative group">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 transform hover:scale-105">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-20">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    var y = JSON.parse(invoice.main);

                    var x = {
                      ...invoice,
                      main: JSON.stringify({
                        ...y,
                        oldItems: y.oldItems ? y.oldItems : y.items,
                        returnId: generateNumber("RET"),
                      }),
                    };
                    console.log("x", x);

                    navigate("/sales/return/create", {
                      state: { newData: x, action: "return" },
                    });
                  }}
                  className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                >
                  <MessageSquareReply className="w-4 h-4" />
                  <span>{isRTL ? "إرجاع جديد" : "New Return"}</span>
                </button>

                <button
                  onClick={() => {
                    var y = JSON.parse(invoice.main);

                    var x = {
                      ...invoice,
                      main: JSON.stringify({
                        ...y,
                        oldItems: y.oldItems ? y.oldItems : y.items,
                        creditNoticeId: generateNumber("RET"),
                      }),
                    };
                    console.log("x", x);
                    navigate("/sales/credit-notices/create", {
                      state: { newData: x, action: "CreditNotice" },
                    });
                  }}
                  className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                >
                  <MessageSquareReply className="w-4 h-4" />
                  <span>{isRTL ? "إشعار دائن جديد" : "New Credit Notice"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <UnifiedInvoiceTemplateJson invoice={invoice} isRTL={isRTL} mode="view" />
      <DisplayImages data={JSON.parse(invoice.attachments)?.images} />
    </div >
  );
}
