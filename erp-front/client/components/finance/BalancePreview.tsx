import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface BalancePreviewProps {
    currentBalance: number;
    amount: number;
    isDeduction: boolean;
    label: string;
}

export const BalancePreview: React.FC<BalancePreviewProps> = ({
    currentBalance,
    amount,
    isDeduction,
    label,
}) => {
    const { isRTL } = useLanguage();
    const { formatAmount } = useCurrency();

    const resultingBalance = isDeduction
        ? currentBalance - amount
        : currentBalance + amount;

    const isNegative = resultingBalance < 0;
    const hasChange = amount > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            <p className="text-sm font-medium text-muted-foreground">{label}</p>

            {/* Current Balance */}
            <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <span className="text-sm text-muted-foreground">
                    {isRTL ? "الرصيد الحالي" : "Current Balance"}
                </span>
                <span className="text-lg font-semibold">
                    {formatAmount(currentBalance)}
                </span>
            </div>

            {/* Change Amount */}
            {hasChange && (
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDeduction
                            ? "bg-destructive/10 border border-destructive/20"
                            : "bg-green-500/10 border border-green-500/20"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {isDeduction ? (
                            <TrendingDown className="w-4 h-4 text-destructive" />
                        ) : (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-sm text-muted-foreground">
                            {isRTL
                                ? isDeduction
                                    ? "المبلغ المخصوم"
                                    : "المبلغ المضاف"
                                : isDeduction
                                    ? "Amount Deducted"
                                    : "Amount Added"}
                        </span>
                    </div>
                    <span
                        className={`text-lg font-semibold ${isDeduction ? "text-destructive" : "text-green-600"
                            }`}
                    >
                        {isDeduction ? "-" : "+"} {formatAmount(amount)}
                    </span>
                </motion.div>
            )}

            {/* Resulting Balance */}
            <div
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${isNegative
                        ? "bg-destructive/10 border-destructive"
                        : "bg-primary/10 border-primary"
                    }`}
            >
                <div className="flex items-center gap-2">
                    {isNegative && <AlertTriangle className="w-5 h-5 text-destructive" />}
                    <span className="text-sm font-medium">
                        {isRTL ? "الرصيد بعد التحويل" : "Balance After Transfer"}
                    </span>
                </div>
                <span
                    className={`text-2xl font-bold ${isNegative ? "text-destructive" : "text-primary"
                        }`}
                >
                    {formatAmount(resultingBalance)}
                </span>
            </div>

            {/* Warning for negative balance */}
            {isNegative && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">
                            {isRTL ? "تحذير: رصيد سالب" : "Warning: Negative Balance"}
                        </p>
                        <p className="text-xs text-destructive/80 mt-1">
                            {isRTL
                                ? "هذا التحويل سيؤدي إلى رصيد سالب. يرجى التحقق من المبلغ."
                                : "This transfer will result in a negative balance. Please verify the amount."}
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
