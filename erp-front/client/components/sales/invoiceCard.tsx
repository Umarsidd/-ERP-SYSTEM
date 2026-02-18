import { useLanguage } from "@/contexts/LanguageContext";
import {
  getStatusColor,
  getStatusLabel,
  handleCopy,
  handleEdit,
  handlePayment,
  handleSendToClient,
  handleView,
} from "@/lib/function";
import { printUnifiedInvoice } from "@/utils/invoicePrintPdf";
import {
  FileText,
  User,
  Eye,
  Edit,
  Copy,
  Trash2,
  Printer,
  Send,
  CreditCard,
} from "lucide-react";
import { MainIcon } from "../common/mainIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { commonApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { loadBankAccounts, updateBankAccounts } from "@/lib/api_function";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";

export function InvoiceCard(props: {
  data: any;
  setIsRefreshing: any;
  type: any;
  sectionName: string;
  pageName: string;
  pageName2: string;
}) {
  const {
    data,
    setIsRefreshing,
    type,
    sectionName,
    pageName,
    pageName2,
    // setInvoices,
  } = props;

  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();
  const navigate = useNavigate();

  type type2 = {
    [key: string]: any;
  };

  const [bankAccounts, setBankAccounts] = useState<type2>({});
  const [bankAccountsMetaData, setBankAccountsMetaData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBankAccounts(setBankAccounts, setBankAccountsMetaData, setIsLoading);
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary">{data.elementNumber}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div
          className={`flex items-center space-x-1 mx-1  rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.status)}`}
        >
          <MainIcon icon={data.status} />

          <span>{getStatusLabel(data.status, isRTL)}</span>
        </div>

        {JSON.parse(data.main)?.returnStatus && (
          <div
            className={`flex items-center space-x-1 mx-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(JSON.parse(data.main).returnStatus)}`}
          >
            <MainIcon icon={JSON.parse(data.main).returnStatus} />
            <span>
              {getStatusLabel(JSON.parse(data.main).returnStatus, isRTL)}
            </span>
          </div>
        )}

        {data?.stockStatus && (
          <div
            className={`flex items-center space-x-1 mx-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.stockStatus)}`}
          >
            <MainIcon icon={data.stockStatus} />
            <span>{getStatusLabel(data.stockStatus, isRTL)}</span>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">
            {isRTL
              ? JSON.parse(data.main).customer.name
              : JSON.parse(data.main).customer.name}
          </span>
        </div>
        {/* <div className="text-sm text-muted-foreground">
          {isRTL
            ? JSON.parse(data.main).salesRep.name
            : JSON.parse(data.main).salesRep.name}
        </div> */}
      </div>

      {/* Amount */}
      <div className="text-right rtl:text-left">
        <div className="text-2xl font-bold text-foreground">
          {
            formatAmount(
              convertAmount(
                data.totalAmount ?? 0,
                localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              ),
              ((JSON.parse(data.main)?.currency &&
                JSON.parse(JSON.parse(data.main)?.currency)?.symbol) ||
                localStorage.getItem("selectedCurrencySymbol")) ??
                selectedSymbol,
            )

            // formatAmount(
            //   convertAmount(
            //     JSON.parse(data.main).amount?.total,
            //     localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            //   ),
            // )
          }
        </div>
        <div className="text-xs text-muted-foreground">
          {isRTL
            ? JSON.parse(data.main).paymentMethodAr
            : JSON.parse(data.main).paymentMethod}
        </div>
      </div>

      {/* Dates */}
      <div className="flex justify-between text-sm">
        <div>
          <div className="text-muted-foreground">
            {isRTL ? "التاريخ:" : "Date:"}
          </div>
          <div className="text-foreground">
            {new Date(JSON.parse(data.main).issueDate).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">
            {type === "sales"
              ? isRTL
                ? "الاستحقاق:"
                : "Due:"
              : isRTL
                ? "تاريخ الاستلام:"
                : "Delivery Date:"}
          </div>
          <div className="text-foreground">
            {new Date(JSON.parse(data.main).dueDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <button
          onClick={() =>
            handleView(data, navigate, `/${type}/invoices/${data.id}/view`)
          }
          className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all duration-200 transform hover:scale-105"
        >
          <Eye className="w-3 h-3" />
          <span>{isRTL ? "عرض" : "View"}</span>
        </button>
        {((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
          sectionName
        ]?.[pageName] !== false ||
          ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
            sectionName
          ]?.[pageName2] === true &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user?.id === JSON.parse(data.createdBy).id)) && (
          <button
            onClick={() => handleEdit(data, navigate, `/${type}/invoices/edit`)}
            className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-all duration-200 transform hover:scale-105"
          >
            <Edit className="w-3 h-3" />
            <span>{isRTL ? "تحرير" : "Edit"}</span>
          </button>
        )}
        {((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
          sectionName
        ]?.addPaymentAllInvoices !== false ||
          ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
            sectionName
          ]?.addPaymentHisInvoices === true &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user?.id === JSON.parse(data.createdBy).id)) && (
          <button
            onClick={() =>
              handleCopy(
                isRTL ? "نسخ الفاتورة" : "Copy Invoice",
                isRTL
                  ? `هل تريد نسخ الفاتورة ${data.elementNumber}؟`
                  : `Do you want to copy invoice ${data.elementNumber}?`,
                data,
                isRTL,
                navigate,
                `/${type}/invoices/create-invoice`,
              )
            }
            className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-info/10 text-info rounded-lg hover:bg-info/20 transition-all duration-200 transform hover:scale-105"
          >
            <Copy className="w-3 h-3" />
            <span>{isRTL ? "نسخ" : "Copy"}</span>
          </button>
        )}
        {data.status !== "Paid" &&
          data.status !== "PaidByExcess" &&
          data.status !== "Draft" && (
            <button
              onClick={() =>
                handlePayment(
                  data,
                  navigate,
                  `/${type}/payments/new`,
                  "invoices", //  "/${type}/invoices/create-invoice",
                )
              }
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-success/10 text-success rounded-lg hover:bg-success/20 transition-all duration-200 transform hover:scale-105"
            >
              <CreditCard className="w-3 h-3" />
              <span>{isRTL ? "دفع" : "Payment"}</span>
            </button>
          )}
        {((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
          sectionName
        ]?.[pageName] !== false ||
          ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
            sectionName
          ]?.[pageName2] === true &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user?.id === JSON.parse(data.createdBy).id)) && (
          <button
            onClick={() => {
              commonApi.deleteInvoice(
                isRTL ? "حذف" : "Delete",
                isRTL
                  ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء سيتم حذف الفاتوره مع كافة البيانات المرتبطه بها . `
                  : `Are you sure you want to delete ${data.elementNumber}?  This action cannot be undone and will delete the invoice along with all its related data.`,
                data.id,
                type,
                isRTL,
                setIsRefreshing,
                bankAccounts,
                bankAccountsMetaData,
                data,
                convertAmount,
              );
            }}
            className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all duration-200 transform hover:scale-105"
          >
            <Trash2 className="w-3 h-3" />
            <span>{isRTL ? "حذف" : "Delete"}</span>
          </button>
        )}
        {
          <button
            onClick={() =>
              printUnifiedInvoice(
                JSON.parse(data.main),
                isRTL,
                data.tableName,
                formatAmount,
                convertAmount,
              )
            }
            className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200 transform hover:scale-105"
          >
            <Printer className="w-3 h-3" />
            <span>{isRTL ? "طباعة" : "Print"}</span>
          </button>
        }
        {/* <button
          onClick={() =>
            handleSendToClient(
              isRTL ? "إرسال للعميل" : "Send to Client",
              isRTL
                ? `إرسال الفاتورة ${data.elementNumber} إلى العميل؟`
                : `Send invoice ${data.elementNumber} to client?`,
              isRTL
                ? `تم إرسال الفاتورة ${data.elementNumber} إلى العميل`
                : `Invoice ${data.elementNumber} sent to client`,
              isRTL,
            )
          }
          className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-105"
        >
          <Send className="w-3 h-3" />
          <span>{isRTL ? "إرسال" : "Send"}</span>
        </button> */}
        {/* <button
          onClick={() => handleExtractPDF(data)}
          className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:scale-105"
        >
          <FileType className="w-3 h-3" />
          <span>{isRTL ? "PDF" : "PDF"}</span>
        </button> */}
        {/* <button
          onClick={() => handleExtractExcel(data)}
          className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200 transform hover:scale-105"
        >
          <FileSpreadsheet className="w-3 h-3" />
          <span>{isRTL ? "Excel" : "Excel"}</span>
        </button> */}
      </div>
    </div>
  );
}
