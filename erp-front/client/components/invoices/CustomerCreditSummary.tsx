import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DollarSign, TrendingUp, AlertTriangle, Calculator } from "lucide-react";

interface CustomerCreditSummaryProps {
    outstandingAmount: number;
    currentInvoiceTotal: number;
    isLoading?: boolean;
}

export function CustomerCreditSummary({
    outstandingAmount,
    currentInvoiceTotal,
    isLoading = false,
}: CustomerCreditSummaryProps) {
    const { isRTL } = useLanguage();
    const { formatAmount } = useCurrency();

    const projectedTotal = outstandingAmount + currentInvoiceTotal;

    // Warning levels
    const isHigh = projectedTotal > 10000;
    const isMedium = projectedTotal > 5000 && projectedTotal <= 10000;

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">
                        {isRTL ? "جاري حساب الرصيد..." : "Calculating credit..."}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={`border rounded-lg p-4 mb-4 ${isHigh ? 'bg-red-50 border-red-200' : isMedium ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
            }`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center">
                    <Calculator className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {isRTL ? "ملخص مالي للعميل" : "Customer Financial Summary"}
                </h3>
                {isHigh && <AlertTriangle className="w-5 h-5 text-red-600" />}
            </div>

            <div className="space-y-3">
                {/* Outstanding Before */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                            {isRTL ? "المستحق الحالي:" : "Current Outstanding:"}
                        </span>
                    </div>
                    <span className={`font-semibold ${outstandingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {formatAmount(outstandingAmount)}
                    </span>
                </div>

                {/* Current Invoice */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">
                            {isRTL ? "الفاتورة الجديدة:" : "New Invoice Total:"}
                        </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                        {formatAmount(currentInvoiceTotal)}
                    </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300"></div>

                {/* Projected Total */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800">
                        {isRTL ? "الإجمالي المتوقع:" : "Projected Total:"}
                    </span>
                    <span className={`text-lg font-bold ${isHigh ? 'text-red-600' : isMedium ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {formatAmount(projectedTotal)}
                    </span>
                </div>

                {/* Warning Message */}
                {isHigh && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                        {isRTL
                            ? "⚠️ تنبيه: الرصيد المتوقع مرتفع. يرجى المتابعة مع العميل."
                            : "⚠️ Warning: Projected credit is high. Please follow up with customer."}
                    </div>
                )}
                {isMedium && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                        {isRTL
                            ? "⚠️ تنبيه: الرصيد المتوقع متوسط. يُنصح بالمتابعة."
                            : "⚠️ Caution: Projected credit is moderate. Follow-up recommended."}
                    </div>
                )}
            </div>
        </div>
    );
}
