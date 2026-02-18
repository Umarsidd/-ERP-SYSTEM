import { useEffect, useState } from "react";
import { commonApi } from "@/lib/api";
import { mainFilter } from "@/lib/function";

type Summary = {
  last7: number;
  last30: number;
  last365: number;
};

export const useBulkSummary = (
    resource: "expenses" | "receivables",
  advancedFilters: any,
  sort: any
) => {
  const [summary, setSummary] = useState<Summary>({
    last7: 0,
    last30: 0,
    last365: 0,
  });

  const [loading, setLoading] = useState(false);

  const getTotalForLastDays = (orders: any[], days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.reduce((total, order) => {
      if (!order.issueDate) return total;

      const amount = Number(order.totalAmount) || 0;
      const [y, m, d] = order.issueDate.split("-").map(Number);
      const issueDate = new Date(y, m - 1, d);

      const diff =
        (today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24);

      return diff >= 0 && diff <= days ? total + amount : total;
    }, 0);
  };

  const loadSummary = async () => {
    try {
      setLoading(true);

      const filter = await mainFilter(advancedFilters);

      const result = await commonApi.getAll(
        1,
        100000, // bulk
        filter,
        sort,
        resource        
      );

      const data = result?.data || [];

      setSummary({
        last7: getTotalForLastDays(data, 7),
        last30: getTotalForLastDays(data, 30),
        last365: getTotalForLastDays(data, 365),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [advancedFilters]);

  return { summary, loading, reload: loadSummary };
};
