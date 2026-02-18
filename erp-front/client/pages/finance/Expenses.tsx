import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmptyState } from "@/components/common/emptyState";
import { HomeHeader } from "@/components/sales/HomeHeader";
import { SecondaryList } from "@/components/sales/secondaryList";
import Swal from "sweetalert2";
import { Loading } from "@/components/common/loading";
import { Pagination } from "@/components/dashboard/Pagination";
import { Filters } from "@/components/sales/filters";
import { commonApi } from "@/lib/api";
import { mainFilter } from "@/lib/function";
import CryptoJS from "crypto-js";
import { Card } from "@/components/ui/card";
import { TableView } from "@/components/sales/TableView";
import { useBulkSummary } from "@/hooks/useBulkSummary";

const Expenses: React.FC = () => {
  const { isRTL } = useLanguage();
  const [orders, setQuotations] = useState([]);

  const [advancedFilters, setAdvancedFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    paymentMethod: "all",
    salesPerson: "all",
    dateFrom: "",
    dateTo: "",
    amountFrom: "",
    amountTo: "",
    dueDateFrom: "",
    dueDateTo: "",
  });

  const [sort, setSort] = useState({
    field: "id",
    direction: "desc",
    type: "basic",
    json_path: "$.elementNumber",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { summary, loading: summaryLoading } =
  useBulkSummary("expenses", advancedFilters, sort);




  useEffect(() => {
    loadData();
  }, [currentPage, advancedFilters, sort, isRefreshing]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      var filter = await mainFilter(advancedFilters);

      if (
        (
          JSON.parse(
            localStorage.getItem("subRole") || "null",
          ) as any
        )?.Finance?.viewHisExpenses === true
      ) {
        filter.push({
          field: "createdBy",
          operator: "=",
          value: JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user?.id,
          type: "json",
          andOr: "and",
          json_path: "$.id",
        });
      }
      var result = await commonApi.getAll(
        currentPage,
        itemsPerPage,
        filter,
        sort,
        "expenses",
      );
      console.log("result", result);

      setTotalElements(result.total);
      setQuotations(result.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    //  setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      Swal.fire({
        icon: "success",
        title: isRTL ? "تم التحديث" : "Refreshed",
        text: isRTL ? "تم تحديث البيانات بنجاح" : "Data refreshed successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      //  setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setAdvancedFilters({
      search: "",
      status: "all",
      category: "all",
      paymentMethod: "all",
      salesPerson: "all",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
      dueDateFrom: "",
      dueDateTo: "",
    });
  };

  const hasActiveFilters = Object.values(advancedFilters).some(
    (value) => value !== "all" && value !== "",
  );

  //  const assignedOptions = Array.from(new Set(orders.map(q => q.assignedTo).filter(Boolean)));

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}

      <HomeHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        viewMode={null}
        setViewMode={null}
        isMobile={null}
        title={isRTL ? "المصروفات" : "Expenses"}
        description={
          isRTL ? "إدارة وتتبع المصروفات" : "Manage and track expenses"
        }
        other={isRTL ? "سند صرف" : "Expense Voucher"}
        href={"/finance/expenses/create"}
        sectionName={"Finance"}
        pageName={"addingExpenses"}
      />

      {/* Summary Cards اخر ٧ ايام */}

      {/* <StatsCards
        data={[
          {
            title: isRTL ? "المجموع" : "Total",
            value: totalElements,
            icon: <FileText className="w-8 h-8 text-primary" />,
          },
          {
            title: isRTL ? "مرسلة" : "Sent",
            value: orders.filter((q) => q.status === "sent").length,
            icon: <Send className="w-8 h-8 text-success" />,
          },
          {
            title: isRTL ? "مقبولة" : "Accepted",
            value: orders.filter((q) => q.status === "accepted").length,
            icon: <CheckCircle className="w-8 h-8 text-warning" />,
          },

          {
            title: isRTL ? "القيمة الإجمالية" : "Total Value",
            value: orders
              .reduce((sum, q) => sum + q.totalAmount, 0)
              .toLocaleString(),
            icon: <DollarSign className="w-8 h-8 text-destructive" />,
          },
        ]}
      /> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-white border-none p-4">
          <p className="text-sm opacity-90">
            {isRTL ? "آخر 7 أيام" : "Last 7 Days Total"}
          </p>
          <h2 className="text-3xl font-bold mt-2">
<h2 className="text-3xl font-bold mt-2">
  {summary.last7.toLocaleString()}
</h2>
          </h2>
        </Card>

        <Card className="bg-primary text-white border-none p-4">
          <p className="text-sm opacity-90">
            {isRTL ? "آخر 30 يوم" : "Last 30 Days Total"}
          </p>
          <h2 className="text-3xl font-bold mt-2">
            {summary.last30.toLocaleString()}
          </h2>
        </Card>

        <Card className="bg-primary text-white border-none p-4 relative">
          <p className="text-sm opacity-90">
            {isRTL ? "آخر سنة" : "Last 365 Days Total"}
          </p>
          <h2 className="text-3xl font-bold mt-2">
{summary.last365.toLocaleString()}
          </h2>
        </Card>
      </div>


      <Filters
        title={"Expenses"}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearFilters}
        sort={sort}
        setSort={setSort}
      />

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isRTL ? " المصروفات" : "Expenses"} ({orders.length})
          </h2>
        </div>

        {isLoading ? (
          <Loading title={isRTL ? "جاري تحميل ..." : "Loading..."} />
        ) : (
          // <TableView
          //   type="expenses"
          //   setIsRefreshing={setIsRefreshing}
          //   main={orders}
          //   sectionName={"Expense"}
          //   pageName={"editAndDeleteAllExpenses"}
          //   pageName2={"editAndDeleteHisExpenses"}
          // />
          <SecondaryList
            type="finance"
            setIsRefreshing={setIsRefreshing}
            data={orders}
            titleLink={"expenses"}
            title={isRTL ? "المصروفات" : "Expenses"}
            sectionName={"Finance"}
            pageName={"editAndDeleteAllExpenses"}
            pageName2={"editAndDeleteHisExpenses"}
          />
        )}
        <Pagination
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalElements={totalElements}
        />
        {orders.length === 0 && !isLoading && (
          <EmptyState
            clearAllFilters={clearFilters}
            title={isRTL ? "لم يتم العثور على المصروفات" : "No expenses found"}
            description={
              isRTL
                ? "ابدأ بإنشاء امر شراء جديد"
                : "Get started by creating a new expense"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Expenses;
