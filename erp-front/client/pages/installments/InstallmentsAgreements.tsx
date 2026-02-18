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

const InstallmentsAgreements: React.FC = () => {
  const { isRTL } = useLanguage();
  const [orders, setQuotations] = useState([]);
  //  const [assignedFilter, setAssignedFilter] = useState<string>("all");

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
        "installments",
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}

      <HomeHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        viewMode={null}
        setViewMode={null}
        isMobile={null}
        title={isRTL ? "اتفاقيات الأقساط" : "Installments Agreements"}
        description={
          isRTL
            ? "إدارة وتتبع اتفاقيات الأقساط"
            : "Manage and track Installments Agreements"
        }
        other={
          null
          // isRTL ? "اتفاقية اقساط جديدة" : "New Installments Agreement"
        }
        href={"/installments/agreements/create"}
        sectionName={"Installments"}
        pageName={"InstallmentsAgreements"}
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

      <Filters
        title={"Installments"}
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
            {isRTL ? "اتفاقيات الأقساط" : "Installments"} ({orders.length})
          </h2>
        </div>

        {isLoading ? (
          <Loading title={isRTL ? "جاري تحميل ..." : "Loading..."} />
        ) : (
          <SecondaryList
            type="installments"
            setIsRefreshing={setIsRefreshing}
            data={orders}
            titleLink={"agreements"}
            title={isRTL ? "اتفاقيات الأقساط" : "Installments"}
            sectionName={"Installments"}
            pageName={"InstallmentsAgreements"}
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
            title={
              isRTL ? "لم يتم العثور على سند اقساط" : "No Installments found"
            }
            description={
              isRTL
                ? "ابدأ بإنشاء سند اقساط جديد"
                : "Get started by creating a new installment"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default InstallmentsAgreements;
