import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import {
  FilterX,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import {
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import {
  activeList,
  invoicesStatus,
  invoicesType,
  purchaseRequestsStatus,
  sortBy,
} from "@/data/data";
import { loadBranches, loadWarehouse } from "@/lib/api_function";
import { useState, useEffect } from "react";
import MultiSelect from "../ui/MultiSelect";
import SingleSelect from "../ui/SingleSelect";
import { Field } from "formik";

export function FiltersReports(props: {
  hasActiveFilters: any;
  clearAllFilters: any;
  advancedFilters: any;
  setAdvancedFilters: any;
  title?: string;
  sort: any;
  setSort: any;
  reportType?: string;
  sectionTitle?: string;
  customers?: any[];
  employees?: any[];
}) {
  const {
    hasActiveFilters,
    clearAllFilters,
    advancedFilters,
    setAdvancedFilters,
    title,
    sort,
    setSort,
    reportType,
    sectionTitle,
    customers = [],
    employees = [],
  } = props;
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const { isRTL } = useLanguage();
  const [dateRangeType, setDateRangeType] = useState("custom");

  const handleDateRangeChange = (type: string) => {
    setDateRangeType(type);
    const today = new Date();
    let from = "";
    let to = "";

    switch (type) {
      case "today":
        from = format(today, "yyyy-MM-dd");
        to = format(today, "yyyy-MM-dd");
        break;
      case "yesterday":
        const yest = subDays(today, 1);
        from = format(yest, "yyyy-MM-dd");
        to = format(yest, "yyyy-MM-dd");
        break;
      case "thisWeek":
        from = format(startOfWeek(today, { weekStartsOn: 6 }), "yyyy-MM-dd");
        to = format(endOfWeek(today, { weekStartsOn: 6 }), "yyyy-MM-dd");
        break;
      case "lastWeek":
        const lastWeek = subDays(today, 7);
        from = format(startOfWeek(lastWeek, { weekStartsOn: 6 }), "yyyy-MM-dd");
        to = format(endOfWeek(lastWeek, { weekStartsOn: 6 }), "yyyy-MM-dd");
        break;
      case "thisMonth":
        from = format(startOfMonth(today), "yyyy-MM-dd");
        to = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        from = format(startOfMonth(lastMonth), "yyyy-MM-dd");
        to = format(endOfMonth(lastMonth), "yyyy-MM-dd");
        break;
      case "thisYear":
        from = format(startOfYear(today), "yyyy-MM-dd");
        to = format(endOfYear(today), "yyyy-MM-dd");
        break;
      case "lastYear":
        const lastYear = subDays(startOfYear(today), 1);
        from = format(startOfYear(lastYear), "yyyy-MM-dd");
        to = format(endOfYear(lastYear), "yyyy-MM-dd");
        break;
      case "custom":
        from = "";
        to = "";
        break;
      default:
        return;
    }

    if (type !== "custom") {
      setAdvancedFilters((prev) => ({
        ...prev,
        dateFrom: from,
        dateTo: to,
      }));
    }
  };


  useEffect(() => {
    loadBranches(setBranches);
    loadWarehouse(setWarehouses);

  }, []);
  return (
    <div className="">
      {/* Basic Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-lg p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4 ">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 mb-4 rtl:space-x-reverse px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
            >
              <FilterX className="w-4 h-4" />
              <span>{isRTL ? "مسح الفلاتر" : "Clear Filters"}</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}

        <div className="mt- pt- border- border-border animate-in slide-in-from-top-2 duration-200">
          {title == "Inventory Sheet" || title == "Inventory Movement" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {isRTL ? "ترتيب حسب" : "Sort By"}
                </label>
                <div className="relative">
                  <select
                    value={sort.field}
                    onChange={(e) =>
                      setSort({
                        field:
                          e.target.value === "stockQuantityAsc"
                            ? "stockQuantity"
                            : e.target.value,
                        direction:
                          e.target.value === "stockQuantityAsc"
                            ? "asc"
                            : "desc",
                        type: "basic",
                        json_path: "$.elementNumber",
                      })
                    }
                    className="w-full px-2 py-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {sortBy.map((option) => (
                      <option key={option.name} value={option.field}>
                        {isRTL ? option.nameAr : option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>{" "}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {isRTL ? " المستودع" : "Warehouse"}
                </label>
                <div className="relative">
                  <select
                    value={advancedFilters.warehouse}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        warehouse: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse.elementNumber}
                        value={warehouse.elementNumber}
                      >
                        {isRTL
                          ? warehouse.elementNumber
                          : warehouse.elementNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mt-4">
                <input
                  type="checkbox"
                  checked={advancedFilters.hideZeroBalance}
                  onChange={(e) => {
                    setAdvancedFilters({
                      ...advancedFilters,
                      hideZeroBalance: e.target.checked,
                    });
                  }}
                  className="w-4 h-4 rounded accent-primary"
                />
                <label className="text-sm font-medium text-foreground">
                  {isRTL ? "إخفاء الرصيد الصفري" : "Hide Zero Balance"}
                </label>
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${title !== "Customer Statements" &&
              title !== "Supplier Statements" ? "lg:grid-cols-7 " : "lg:grid-cols-4"} gap-4`}>
              {/* Status Filter */}

              {title !== "Customer Statements" &&
                title !== "Supplier Statements" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {isRTL ? "النوع" : "Type"}
                    </label>
                    <div className="relative">
                      <select
                        value={advancedFilters.type}
                        onChange={(e) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {sectionTitle === "Purchase Reports" ? (
                          <option value="Customer">
                            {isRTL ? "مورد" : "Supplier"}
                          </option>
                        ) : (
                          <option value="Customer">
                            {isRTL ? "عميل" : "Customer"}
                          </option>
                        )}

                        {invoicesType.map((payment) => (
                          <option key={payment.name} value={payment.name}>
                            {isRTL ? payment.nameAr : payment.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

              {title !== "Customer Statements" &&
                title !== "Supplier Statements" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {isRTL ? "الفرع" : "Branch"}
                    </label>
                    <MultiSelect
                      list={branches}
                      // selectedList={values.depositChoice}
                      //  setFieldValue={setFieldValue}
                      fieldName={setAdvancedFilters}
                      fieldName2={advancedFilters}
                      type="reportBranch"
                    />
                    {/* <div className="relative">
                <select
                  value={advancedFilters.branch}
                  onChange={(e) =>
                    setAdvancedFilters({
                      ...advancedFilters,
                      branch: e.target.value,
                    })
                  }
                  className="w-full px-2 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">
                    {isRTL ? "جميع الفروع" : "All Branches"}
                  </option>

                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {isRTL ? branch.name : branch.name}
                    </option>
                  ))}
                </select>
              </div> */}
                  </div>
                )}

              {title !== "Customer Statements" &&
                title !== "Supplier Statements" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {isRTL ? "الحالات" : "Status"}
                    </label>
                    <div className="relative">
                      <select
                        value={advancedFilters.status}
                        onChange={(e) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="all">
                          {isRTL ? "جميع الحالات" : "All Status"}
                        </option>

                        {title === "PurchaseInvoices" ||
                          title === "Invoice Reports"
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
                            : purchaseRequestsStatus.map((payment) => (
                              <option key={payment.name} value={payment.name}>
                                {isRTL ? payment.nameAr : payment.name}
                              </option>
                            ))}
                      </select>
                    </div>
                  </div>
                )}

              {/* Enhanced Filters for Customer/Supplier Statements */}
              {(title === "Customer Statements" || title === "Supplier Statements") && (
                <>
                  {/* Customer Filter (Single Select) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {title === "Supplier Statements"
                        ? (isRTL ? "المورد" : "Supplier")
                        : (isRTL ? "العميل" : "Customer")
                      }
                    </label>
                    <SingleSelect
                      list={customers}
                      selectedItem={advancedFilters.customer}
                      setFieldValue={setAdvancedFilters}
                      fieldName="customer"
                      fieldName2={advancedFilters}
                      type="reportCustomer"
                      placeholder={isRTL ? "اختر..." : "Select..."}
                    />
                  </div>

                  {/* Employee Filter (Multi Select) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {isRTL ? "الموظف" : "Employee"}
                    </label>
                    <MultiSelect
                      list={employees}
                      selectedList={advancedFilters.employees}
                      setFieldValue={setAdvancedFilters}
                      fieldName={setAdvancedFilters}
                      fieldName2={advancedFilters}
                      type="reportEmployee"
                    />
                  </div>

                  {/* Transaction Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {isRTL ? "نوع المعاملة" : "Transaction Type"}
                    </label>
                    <div className="relative">
                      <select
                        value={advancedFilters.transactionType}
                        onChange={(e) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            transactionType: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="all">
                          {isRTL ? "جميع المعاملات" : "All Transactions"}
                        </option>
                        <option value="invoices">
                          {isRTL ? "الفواتير" : "Invoices"}
                        </option>
                        <option value="payments">
                          {isRTL ? "المدفوعات" : "Payments"}
                        </option>
                        <option value="returns">
                          {isRTL ? "المرتجعات" : "Returns"}
                        </option>
                        <option value="credit_notes">
                          {isRTL ? "إشعارات دائنة" : "Credit Notes"}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {isRTL ? "حالة الدفع" : "Payment Status"}
                    </label>
                    <div className="relative">
                      <select
                        value={advancedFilters.paymentStatus}
                        onChange={(e) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            paymentStatus: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="all">
                          {isRTL ? "جميع الحالات" : "All Status"}
                        </option>
                        <option value="paid">
                          {isRTL ? "مدفوع" : "Paid"}
                        </option>
                        <option value="unpaid">
                          {isRTL ? "غير مدفوع" : "Unpaid"}
                        </option>
                        <option value="partially_paid">
                          {isRTL ? "مدفوع جزئياً" : "Partially Paid"}
                        </option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Sales Person Filter */}
              {/* <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {isRTL ? "مندوب المبيعات" : "Sales Person"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={advancedFilters.salesPerson}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        salesPerson: e.target.value,
                      })
                    }
                    className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">
                      {isRTL ? "جميع المندوبين" : "All Sales Persons"}
                    </option>
                    {salesPersons.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}

              {/* Date Range Dropdown */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {isRTL ? "الفترة الزمنية" : "Date Range"}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={dateRangeType}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="custom">{isRTL ? "مخصص" : "Custom"}</option>
                    <option value="today">{isRTL ? "اليوم" : "Today"}</option>
                    <option value="yesterday">
                      {isRTL ? "أمس" : "Yesterday"}
                    </option>
                    <option value="thisWeek">
                      {isRTL ? "هذا الأسبوع" : "This Week"}
                    </option>
                    <option value="lastWeek">
                      {isRTL ? "الأسبوع الماضي" : "Last Week"}
                    </option>
                    <option value="thisMonth">
                      {isRTL ? "هذا الشهر" : "This Month"}
                    </option>
                    <option value="lastMonth">
                      {isRTL ? "الشهر الماضي" : "Last Month"}
                    </option>
                    <option value="thisYear">
                      {isRTL ? "هذه السنة" : "This Year"}
                    </option>
                    <option value="lastYear">
                      {isRTL ? "السنة الماضية" : "Last Year"}
                    </option>
                  </select>
                </div>
              </div>

              {/* Date From */}
              {dateRangeType === "custom" && (
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
              )}

              {/* Date To */}
              {dateRangeType === "custom" && (
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
              )}

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
          )}
        </div>
      </motion.div>
    </div>
  );
}
