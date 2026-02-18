import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Filters } from "@/components/sales/filters";
import { HomeHeader } from "@/components/sales/HomeHeader";
import { EmptyState } from "@/components/common/emptyState";
import { SecondaryList } from "@/components/sales/secondaryList";
import Swal from "sweetalert2";
import { Pagination } from "@/components/dashboard/Pagination";
import { Loading } from "@/components/common/loading";
import { commonApi } from "@/lib/api";
import { mainFilter } from "@/lib/function";
import { useCurrency } from "@/contexts/CurrencyContext";
import CryptoJS from "crypto-js";

const PurchasesCreditNotices: React.FC = () => {
  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();
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
      if (
        (JSON.parse(localStorage.getItem("subRole") || "null") as any)
          ?.Purchases?.viewingHisCreditNotices === true
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
        "purchase_credit_notices",
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}

      <HomeHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        viewMode={null}
        setViewMode={null}
        isMobile={null}
        title={isRTL ? "اشعارات المشتريات الدائنة" : "Purchase Credit Notices"}
        description={
          isRTL
            ? "إدارة وتتبع إشعارات الائتمان والمبالغ المستردة"
            : "Manage and track credit notices and refunds"
        }
        other={isRTL ? "إشعار دائن جديد" : "New Credit Notice"}
        href={"/purchase/credit-notices/create"}
        sectionName={"Purchases"}
        pageName={"PurchaseCreditNotices"}
      />

      {/* Stats Cards */}
      {/* <StatsCards
        data={[
          {
            title: isRTL ? "المجموع" : "Total",
            value: totalElements,
            icon: <FileText className="w-8 h-8 text-primary" />,
          },
          {
            title: isRTL ? "صادرة" : "Issued",
            value: mainData.filter((cn) => cn.status === "issued").length,
            icon: <CheckCircle className="w-8 h-8 text-success" />,
          },
          {
            title: isRTL ? "مطبقة" : "Applied",
            value: mainData.filter((cn) => cn.status === "applied").length,
            icon: <DollarSign className="w-8 h-8 text-warning" />,
          },
          {
            title: isRTL ? "القيمة الإجمالية" : "Total Value",
            value: mainData
              .reduce((sum, cn) => sum + cn.totalAmount, 0)
              .toFixed(2),
            icon: <CreditCard className="w-8 h-8 text-destructive" />,
          },
        ]}
      /> */}

      <Filters
        title={"Credit Notice"}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearFilters}
        sort={sort}
        setSort={setSort}
      />

      {/* Credit Notices List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isRTL ? "اشعارات المشتريات الدائنة" : "Purchase Credit Notices"} (
            {mainData.length})
          </h2>
        </div>
        {isLoading ? (
          <Loading title={isRTL ? "جاري تحميل ..." : "Loading..."} />
        ) : (
          <SecondaryList
            type="purchase"
            data={mainData}
            titleLink={"credit-notices"}
            title={isRTL ? "اشعار دائن" : "CREDIT NOTICE"}
            setIsRefreshing={setIsRefreshing}
            sectionName={"Purchases"}
            pageName={"deletingAndEditingAllCreditNotices"}
            pageName2={"deletingAndEditingHisCreditNotices"}
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
            title={
              isRTL
                ? "لم يتم العثور على إشعارات دائنة"
                : "No credit notices found"
            }
            description={
              isRTL
                ? "ابدأ بإنشاء إشعار دائن جديد"
                : "Get started by creating a new credit notice"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default PurchasesCreditNotices;
