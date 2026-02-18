import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle, FileText, Send, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmptyState } from "@/components/common/emptyState";
import { HomeHeader } from "@/components/sales/HomeHeader";
import { StatsCards } from "@/components/sales/statsCards";
import { SecondaryList } from "@/components/sales/secondaryList";
import Swal from "sweetalert2";
import { Loading } from "@/components/common/loading";
import { Pagination } from "@/components/dashboard/Pagination";
import { Filters } from "@/components/sales/filters";
import { commonApi } from "@/lib/api";
import { mainFilter } from "@/lib/function";
import { useCurrency } from "@/contexts/CurrencyContext";
import CryptoJS from "crypto-js";

const RequestsPurchase: React.FC = () => {
  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();
  const [quotations, setQuotations] = useState([]);
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
      if (
        (JSON.parse(localStorage.getItem("subRole") || "null") as any)
          ?.Purchases?.viewHisInvoices === true
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
        "purchase_requests",
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
      // setIsRefreshing(false);
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

  //  const assignedOptions = Array.from(new Set(quotations.map(q => q.assignedTo).filter(Boolean)));

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}

      <HomeHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        viewMode={null}
        setViewMode={null}
        isMobile={null}
        title={isRTL ? "طلبات الشراء" : "Purchase Requests"}
        description={
          isRTL
            ? "إدارة وتتبع طلبات الشراء والاقتراحات التجارية"
            : "Manage and track Requests and business proposals"
        }
        other={isRTL ? "طلب شراء جديد" : "New Purchase Request"}
        href={"/purchase/requests/create"}
        sectionName={"Purchases"}
        pageName={"PurchaseRequests"}
      />

      {/* Summary Cards */}

      <StatsCards
        data={[
          {
            title: isRTL ? "المجموع" : "Total",
            value: totalElements,
            icon: <FileText className="w-8 h-8 text-primary" />,
          },
          {
            title: isRTL ? "مرسلة" : "Sent",
            value: quotations.filter((q) => q.status === "sent").length,
            icon: <Send className="w-8 h-8 text-info" />,
          },
          {
            title: isRTL ? "مقبولة" : "Accepted",
            value: quotations.filter((q) => q.status === "Approved").length,
            icon: <CheckCircle className="w-8 h-8 text-success" />,
          },

          {
            title: isRTL ? "مرفوض" : "Rejected",
            value: quotations.filter((q) => q.status === "Rejected").length,
            icon: <XCircle className="w-8 h-8 text-destructive" />,
          },
        ]}
      />

      <Filters
        title={"Purchase Requests"}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearFilters}
        sort={sort}
        setSort={setSort}
      />

      {/* Quotations List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isRTL ? " طلبات شراء  " : "Purchase Requests"} ({quotations.length}
            )
          </h2>
        </div>

        {isLoading ? (
          <Loading title={isRTL ? "جاري تحميل ..." : "Loading..."} />
        ) : (
          <SecondaryList
            type="purchase"
            setIsRefreshing={setIsRefreshing}
            data={quotations}
            titleLink={"requests"}
            title={isRTL ? " طلب شراء " : "Purchase Request"}
            sectionName={"Purchases"}
            pageName={"deletingAndEditingAllInvoices"}
            pageName2={"deletingAndEditingHisInvoices"}
          />
        )}
        <Pagination
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalElements={totalElements}
        />
        {quotations.length === 0 && !isLoading && (
          <EmptyState
            clearAllFilters={clearFilters}
            title={
              isRTL
                ? "لم يتم العثور على طلبات شراء"
                : "No purchase requests found"
            }
            description={
              isRTL
                ? "ابدأ بإنشاء طلب جديد"
                : "Get started by creating a new requests"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default RequestsPurchase;
