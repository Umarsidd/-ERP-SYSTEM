import React from "react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Banknote, Building2 } from "lucide-react";

interface Safe {
    id: number;
    name: string;
    type: string;
    currentBalance: number;
    currency: string;
    status: string;
}

interface SafeSelectorProps {
    label: string;
    safes: Safe[];
    selectedSafeId: number | null;
    excludeSafeId?: number | null;
    onSelect: (safe: Safe | null) => void;
    error?: string;
}

export const SafeSelector: React.FC<SafeSelectorProps> = ({
    label,
    safes,
    selectedSafeId,
    excludeSafeId,
    onSelect,
    error,
}) => {
    const { isRTL } = useLanguage();
    const { formatAmount } = useCurrency();

    const filteredSafes = safes.filter(
        (safe) =>
            safe.status === "Active" ||
            (safe.status === "Main" && safe.id !== excludeSafeId)
    );

    const selectedSafe = filteredSafes.find((s) => s.id === selectedSafeId);

    return (
        <div className="space-y-2">
            <Label className="text-base font-semibold">{label}</Label>

            <select
                value={selectedSafeId || ""}
                onChange={(e) => {
                    const safeId = parseInt(e.target.value);
                    const safe = filteredSafes.find((s) => s.id === safeId);
                    onSelect(safe || null);
                }}
                className={`w-full px-4 py-3 bg-background border ${error ? "border-destructive" : "border-border"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
            >
                <option value="">
                    {isRTL ? "اختر الخزينة" : "Select Safe"}
                </option>
                {filteredSafes.map((safe) => (
                    <option key={safe.id} value={safe.id}>
                        {safe.name} - {safe.type} - {formatAmount(safe.currentBalance)}
                    </option>
                ))}
            </select>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {selectedSafe && (
                <div className="mt-3 p-4 bg-accent/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        {selectedSafe.type === "Bank" ? (
                            <Building2 className="w-5 h-5 text-primary" />
                        ) : (
                            <Banknote className="w-5 h-5 text-primary" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                {isRTL ? "الرصيد الحالي" : "Current Balance"}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {formatAmount(selectedSafe.currentBalance)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
