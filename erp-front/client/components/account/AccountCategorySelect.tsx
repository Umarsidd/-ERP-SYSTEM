import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ACCOUNT_CATEGORIES } from "@/lib/AccountGuideDefaults";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AccountCategorySelectProps {
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

export const AccountCategorySelect: React.FC<AccountCategorySelectProps> = ({
    value,
    onValueChange,
    disabled = false,
    className,
}) => {
    const { isRTL } = useLanguage();

    return (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className={cn("w-full", className)}>
                <SelectValue placeholder={isRTL ? "اختر الفئة" : "Select Category"} />
            </SelectTrigger>
            <SelectContent>
                {ACCOUNT_CATEGORIES.map((category) => (
                    <SelectItem key={category.code} value={category.code}>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={cn(
                                    "w-2 h-2 rounded-full p-0",
                                    category.color
                                )}
                            />
                            <span className="font-medium">
                                {isRTL ? category.nameAr : category.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                ({category.code})
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
