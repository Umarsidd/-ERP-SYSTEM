import { useLanguage } from "@/contexts/LanguageContext";

import { motion } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  FilterX,
  Tag,
  DollarSign,
  User,
  Calendar,
  X,
} from "lucide-react";
import { Sort } from "../sales/Sort";
import { getStatusLabel } from "@/lib/function";
import {
  activeList,
  invoicesStatus,
  paymentList,
  purchaseRequestsStatus,
  statusList,
  stockRequestsStatus,
  warehouseStatuses,
} from "@/data/data";

export function Filters(props: {
  setShowAdvancedFilters: any;
  showAdvancedFilters: any;
  hasActiveFilters: any;
  clearAllFilters: any;
  sort: any;
  setSort: any;
  advancedFilters: any;
  setAdvancedFilters: any;
  title?: string;
}) {
  const {
    setShowAdvancedFilters,
    showAdvancedFilters,
    hasActiveFilters,
    clearAllFilters,
    sort,
    setSort,
    advancedFilters,
    setAdvancedFilters,
    title,
  } = props;

  const { isRTL } = useLanguage();

  return (
    <div className="">
      {/* Basic Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-lg p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder={isRTL ? "البحث..." : "Search..."}
              value={advancedFilters.search}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  search: e.target.value,
                })
              }
              className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          {title !== "Accounts" &&
            title !== "Receivables" &&
            title !== "Expenses" && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={advancedFilters.status}
                  onChange={(e) =>
                    setAdvancedFilters({
                      ...advancedFilters,
                      status: e.target.value,
                    })
                  }
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">
                    {isRTL ? "جميع الحالات" : "All Status"}
                  </option>

                  {title === "PurchaseInvoices" ||
                  title === "Invoices" ||
                  title === "Installments"
                    ? invoicesStatus.map((payment) => (
                        <option key={payment.name} value={payment.name}>
                          {isRTL ? payment.nameAr : payment.name}
                        </option>
                      ))
                    : title === "Bank Accounts"
                      ? activeList.map((payment) => (
                          <option key={payment.name} value={payment.name}>
                            {isRTL ? payment.nameAr : payment.name}
                          </option>
                        ))
                      : title === "Customers" ||
                          title === "Suppliers" ||
                          title === "Products"
                        ? activeList.map((payment) => (
                            <option key={payment.name} value={payment.name}>
                              {isRTL ? payment.nameAr : payment.name}
                            </option>
                          ))
                        : title === "Warehouses"
                          ? warehouseStatuses.map((payment) => (
                              <option key={payment.value} value={payment.value}>
                                {isRTL ? payment.labelAr : payment.label}
                              </option>
                            ))
                          : title === "stockOrders"
                            ? stockRequestsStatus.map((payment) => (
                                <option key={payment.name} value={payment.name}>
                                  {isRTL ? payment.nameAr : payment.name}
                                </option>
                              ))
                            : purchaseRequestsStatus.map((payment) => (
                                <option key={payment.name} value={payment.name}>
                                  {isRTL ? payment.nameAr : payment.name}
                                </option>
                              ))}
                </select>
              </div>
            )}

            {title === "Products" && (
  <div className="flex-1 relative">
    <Tag className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
    <input
      type="text"
      placeholder={isRTL ? "بحث بالباركود" : "Search by barcode"}
      value={advancedFilters.barcode}
      onChange={(e) =>
        setAdvancedFilters({
          ...advancedFilters,
          barcode: e.target.value,
        })
      }
      className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  </div>
)}


          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-colors ${
              showAdvancedFilters
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isRTL ? "فلاتر متقدمة" : "Advanced Filters"}</span>
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
            >
              <FilterX className="w-4 h-4" />
              <span>{isRTL ? "مسح الفلاتر" : "Clear Filters"}</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {isRTL ? "من تاريخ" : "Date From"}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        dateFrom: e.target.value,
                      })
                    }
                    className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {isRTL ? "إلى تاريخ" : "Date To"}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        dateTo: e.target.value,
                      })
                    }
                    className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Amount From */}
              {title !== "Customers" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {isRTL ? "من مبلغ" : "Amount From"}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={advancedFilters.amountFrom}
                      onChange={(e) =>
                        setAdvancedFilters({
                          ...advancedFilters,
                          amountFrom: e.target.value,
                        })
                      }
                      className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Amount To */}
              {title !== "Customers" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {isRTL ? "إلى مبلغ" : "Amount To"}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={advancedFilters.amountTo}
                      onChange={(e) =>
                        setAdvancedFilters({
                          ...advancedFilters,
                          amountTo: e.target.value,
                        })
                      }
                      className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
            <Sort sort={sort} setSort={setSort} title={title} />
          </div>
        )}
      </motion.div>
      {/* Active Filters Display */}
      {/* {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {advancedFilters.search && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              <span>
                {isRTL ? "البحث:" : "Search:"} {advancedFilters.search}
              </span>
              <button
                onClick={() =>
                  setAdvancedFilters({ ...advancedFilters, search: "" })
                }
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {advancedFilters.status !== "all" && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              <span>
                {isRTL ? "الحالة:" : "Status:"}{" "}
                {getStatusLabel(advancedFilters.status, isRTL)}
              </span>
              <button
                onClick={() =>
                  setAdvancedFilters({ ...advancedFilters, status: "all" })
                }
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {advancedFilters.category !== "all" && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              <span>
                {isRTL ? "الفئة:" : "Category:"} {advancedFilters.category}
              </span>
              <button
                onClick={() =>
                  setAdvancedFilters({ ...advancedFilters, category: "all" })
                }
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}
