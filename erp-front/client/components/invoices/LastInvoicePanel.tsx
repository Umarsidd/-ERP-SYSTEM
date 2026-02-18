import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { FileText, Calendar, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LastInvoice {
    id: string;
    elementNumber: string;
    issueDate: string;
    totalAmount: number;
    paidAmount: number;
    outstanding: number;
    status: string;
}

interface LastInvoicePanelProps {
    lastInvoice: LastInvoice | null;
    isLoading?: boolean;
}

export function LastInvoicePanel({ lastInvoice, isLoading = false }: LastInvoicePanelProps) {
    const { isRTL } = useLanguage();
    const { formatAmount } = useCurrency();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-600">
                        {isRTL ? "جاري تحميل الفاتورة السابقة..." : "Loading last invoice..."}
                    </span>
                </div>
            </div>
        );
    }

    if (!lastInvoice) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">
                        {isRTL ? "لا توجد فواتير سابقة لهذا العميل" : "No previous invoices for this customer"}
                    </span>
                </div>
            </div>
        );
    }

    const handleInvoiceClick = () => {
        // Navigate to view invoice page
        navigate(`/sales/invoices/${lastInvoice.id}`);
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-800 flex items-center">
                    <FileText className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {isRTL ? "الفاتورة السابقة" : "Last Invoice"}
                </h3>
                {lastInvoice.status === "Paid" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="text-gray-600 block mb-1">
                        {isRTL ? "رقم الفاتورة:" : "Invoice No:"}
                    </span>
                    <button
                        onClick={handleInvoiceClick}
                        className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
                    >
                        {lastInvoice.elementNumber}
                    </button>
                </div>

                <div>
                    <span className="text-gray-600 block mb-1">
                        {isRTL ? "التاريخ:" : "Date:"}
                    </span>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="font-medium text-gray-800">
                            {new Date(lastInvoice.issueDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div>
                    <span className="text-gray-600 block mb-1">
                        {isRTL ? "الإجمالي:" : "Total:"}
                    </span>
                    <span className="font-semibold text-gray-800">
                        {formatAmount(lastInvoice.totalAmount)}
                    </span>
                </div>

                <div>
                    <span className="text-gray-600 block mb-1">
                        {isRTL ? "المدفوع:" : "Paid:"}
                    </span>
                    <span className="font-semibold text-green-600">
                        {formatAmount(lastInvoice.paidAmount)}
                    </span>
                </div>

                <div className="col-span-2">
                    <span className="text-gray-600 block mb-1">
                        {isRTL ? "المتبقي / المستحق:" : "Outstanding:"}
                    </span>
                    <span className={`font-bold text-base ${lastInvoice.outstanding > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {formatAmount(lastInvoice.outstanding)}
                    </span>
                </div>
            </div>
        </div>
    );
}
