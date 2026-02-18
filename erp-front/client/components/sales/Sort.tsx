import { motion } from "framer-motion";
import {
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sort(props: { sort: any; setSort: any; title: string }) {
  const { sort, setSort, title } = props;

  const { isRTL } = useLanguage();

  return (
    <div className="">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 "
      >
        {/* Sort Options */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {isRTL ? "ترتيب حسب:" : "Sort by:"}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSort({
                ...sort,
                field: "elementNumber",
                type: "basic",
                direction:
                  sort.field === "elementNumber" && sort.direction === "asc"
                    ? "desc"
                    : "asc",
              });
            }}
            className="flex items-center gap-1"
          >
            {isRTL ? "المعرف" : "ID"}
            {sort.field === "elementNumber" &&
              (sort.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSort({
                ...sort,
                field: "status",
                type: "basic",
                direction:
                  sort.field === "status" && sort.direction === "asc"
                    ? "desc"
                    : "asc",
              });
            }}
            className="flex items-center gap-1"
          >
            {isRTL ? "الحالة" : "Status"}
            {sort.field === "status" &&
              (sort.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSort({
                ...sort,
                field: "createdAt",
                type: "basic",
                direction:
                  sort.field === "createdAt" && sort.direction === "asc"
                    ? "desc"
                    : "asc",
              });
            }}
            className="flex items-center gap-1"
          >
            {isRTL ? "التاريخ" : "Date"}
            {sort.field === "createdAt" &&
              (sort.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
              {title !== "Customers" && <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSort({
                ...sort,
                field: "totalAmount",
                type: "basic",
                direction:
                  sort.field === "totalAmount" && sort.direction === "asc"
                    ? "desc"
                    : "asc",
              });
            }}
            className="flex items-center gap-1"
          >
            {isRTL ? "المبلغ" : "Amount"}
            {sort.field === "totalAmount" &&
              (sort.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSort({
                ...sort,
                field: "main",
                type: "json",
                json_path: "$.customer.name",
                direction:
                  sort.json_path === "$.customer.name" &&
                  sort.direction === "asc"
                    ? "desc"
                    : "asc",
              });
            }}
            className="flex items-center gap-1"
          >
            {isRTL ? "العميل" : "Customer"}
            {sort.json_path === "$.customer.name" &&
              (sort.direction === "asc" ? (
                <SortAsc className="h-3 w-3" />
              ) : (
                <SortDesc className="h-3 w-3" />
              ))}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}


