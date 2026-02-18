import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  FileText,
  Clock,
  TrendingDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Filters } from "@/components/sales/filters";
import { StatsCards } from "@/components/sales/statsCards";
import { HomeHeader } from "@/components/sales/HomeHeader";
import { EmptyState } from "@/components/common/emptyState";
import Swal from "sweetalert2";
import { Pagination } from "@/components/dashboard/Pagination";
import { Loading } from "@/components/common/loading";
import { commonApi } from "@/lib/api";
import { mainFilter } from "@/lib/function";
import { SecondaryList } from "@/components/sales/secondaryList";

const RecurringInvoices: React.FC = () => {
  const { isRTL } = useLanguage();
  const [mainData, setMainData] = useState([]);
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

  useEffect(() => {
    loadData();
  }, [currentPage, advancedFilters, sort, isRefreshing]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      var filter = await mainFilter(advancedFilters);

      var result = await commonApi.getAll(
        currentPage,
        itemsPerPage,
        filter,
        sort,
        "sales_recurring",
      );
      console.log("result", result);

      setTotalElements(result.total);
      setMainData(result.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    // setIsRefreshing(true);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}

      <HomeHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        viewMode={null}
        setViewMode={null}
        isMobile={null}
        title={isRTL ? "الفواتير الدورية" : "Recurring Invoices"}
        description={
          isRTL
            ? "إدارة وتتبع الفواتير الدورية والاشتراكات"
            : "Manage and track recurring invoices and subscriptions"
        }
        other={isRTL ? "اشتراك جديد" : "New Subscription"}
        href={"/sales/recurring-invoices/new-subscription"}
        sectionName={"Sales"}
        pageName={"RecurringInvoices"}
      />

      <Filters
        title={"Recurring Invoices"}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearFilters}
        sort={sort}
        setSort={setSort}
      />

      {/* Returned Invoices List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isRTL ? "الفواتير الدورية" : "Recurring Invoices"} (
            {mainData.length})
          </h2>
        </div>

        {isLoading ? (
          <Loading title={isRTL ? "جاري تحميل ..." : "Loading..."} />
        ) : (
          <SecondaryList
            type="sales"
            data={mainData}
            titleLink={"recurring-invoices"}
            title={isRTL ? "فاتورة دورية" : "Recurring Invoice"}
            setIsRefreshing={setIsRefreshing}
            sectionName={"Sales"}
            pageName={"RecurringInvoices"}
          />
        )}

        <Pagination
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalElements={totalElements}
        />

        {mainData.length === 0 && !isLoading && (
          <EmptyState
            clearAllFilters={clearFilters}
            title={isRTL ? "لا توجد اشتراكات" : "No Subscriptions Found"}
            description={
              isRTL
                ? "لم يتم العثور على اشتراكات تطابق معايير البحث الخاصة بك"
                : "No subscriptions match your search criteria"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default RecurringInvoices;
