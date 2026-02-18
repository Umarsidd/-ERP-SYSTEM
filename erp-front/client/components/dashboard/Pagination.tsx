import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";



export function Pagination(props: {
  itemsPerPage: any;
  startIndex: any;
  currentPage: any;
  setCurrentPage: any;
  totalElements: any;
}) {
  const {
    itemsPerPage,
    startIndex,
    currentPage,
    setCurrentPage,
    totalElements,
  } = props;

  const { isRTL } = useLanguage();

  return (
    <div className="flex items-center justify-between px-2 py-2 border-t border-border">
      <div className="text-sm text-muted-foreground">
        {isRTL
          ? `عرض ${startIndex + 1} إلى ${Math.min(startIndex + itemsPerPage, totalElements)} من ${totalElements} فاتورة`
          : `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, totalElements)} of ${totalElements} invoices`}
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          {isRTL ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
        <span className="px-3 py-1 text-sm font-medium">
          {currentPage} {isRTL ? "من" : "of"}{" "}
          {Math.ceil(totalElements / itemsPerPage)}
        </span>
        <button
          onClick={() =>
            setCurrentPage(
              Math.min(
                Math.ceil(totalElements / itemsPerPage),
                currentPage + 1,
              ),
            )
          }
          disabled={currentPage === Math.ceil(totalElements / itemsPerPage)}
          className="p-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          {isRTL ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
