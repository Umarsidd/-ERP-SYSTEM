import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency, selectedSymbol } from "@/data/data";

interface StatsCardProps {
  title: string;
  titleAr: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  color: string;
  isRTL?: boolean;
  delay?: number;
  isLoading?: boolean;
  isLoading2?: boolean;
  isLoading3?: boolean;
  isLoading4?: boolean;
}

export function StatsCard({
  title,
  titleAr,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  isRTL = false,
  delay = 0,
  isLoading,
  isLoading2,
  isLoading3,
  isLoading4,
}: StatsCardProps) {
  const animationDelay = `${delay}ms`;
  const { formatAmount, convertAmount } = useCurrency();
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-sidebar-border p-6 shadow-sm",
        "hover:shadow-md transition-all duration-300 animate-slide-up",
      )}
      style={{ animationDelay }}
    >
      {/* Background pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {isRTL ? titleAr : title}
            </p>
            <div className="text-2xl font-bold text-foreground mt-1">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
              ) : (
                <span>
                  {title === "Total Sales"
                    ? formatAmount(
                      convertAmount(
                        Number(value) || 0,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      )
                    )
                    : value}
                </span>
              )}
            </div>
          </div>
          <div className={cn("p-3 rounded-lg", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "increase" && "text-success",
              changeType === "decrease" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground",
            )}
          ></span>
          <span className="text-sm text-muted-foreground ml-2 rtl:ml-0 rtl:mr-2"></span>
        </div>
      </div>
    </div>
  );
}
