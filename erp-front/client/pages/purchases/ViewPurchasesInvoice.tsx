import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UnifiedInvoiceTemplateJson } from "@/components/template/InvoiceTemplateJson";
import { printUnifiedInvoice } from "@/utils/invoicePrintPdf";
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Download,
  Send,
  Edit,
  Copy,
  FileText,
  MessageSquareReply ,
  MoreHorizontal,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import { Loading } from "@/components/common/loading";
import {  handleCopy, handleEdit, handleSendToClient } from "@/lib/function";
import { ViewEmpty } from "@/components/common/ViewEmpty";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { generateNumber } from "@/lib/products_function";
import CryptoJS from "crypto-js";

export default function PurchasesInvoicePurchasesView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount, convertAmount } = useCurrency();
  const viewData = location.state?.viewFrom;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isRTL } = useLanguage();

  useEffect(() => {
    console.log(JSON.parse(viewData.main));
    setInvoice(viewData);
    setLoading(false);
  }, [id]);

  if (loading) {
   return  <Loading title={isRTL ? "جاري التحميل ..." : "Loading invoice..."} />;
  }

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
              {isRTL ? "عرض فاتورة الشراء" : "Invoice Purchase View"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {JSON.parse(invoice.main).elementNumber}
            </p>
          </div>
        </div>

        {/* Desktop Actions - Horizontal */}
        <div className="flex flex-wrap items-center space-x-3 rtl:space-x-reverse">
          <Button
            onClick={() => {
              printUnifiedInvoice(
                JSON.parse(viewData.main),
                isRTL,
                invoice.tableName,
                formatAmount,
                convertAmount,
              );
            }}
            variant="outline"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? "طباعة" : "Print"}
            </span>
          </Button>

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
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "إرسال" : "Send"}</span>
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
                "/purchase/invoices/create-invoice",
              )
            }
            variant="outline"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
          </Button>

          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Purchases?.deletingAndEditingAllInvoices !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Purchases?.deletingAndEditingHisInvoices === true &&
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user?.id === JSON.parse(invoice.createdBy).id)) && (
            <Button
              variant="outline"
              onClick={() =>
                handleEdit(invoice, navigate, `/purchase/invoices/edit`)
              }
              className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isRTL ? "تحرير" : "Edit"}
              </span>
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

                    navigate("/purchase/return/create", {
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

                    navigate("/purchase/credit-notices/create", {
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
    </div>
  );
}
