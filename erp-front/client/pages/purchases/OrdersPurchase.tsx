import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle, FileText, Send } from "lucide-react";
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
import { selectedCurrency } from "@/data/data";
import CryptoJS from "crypto-js";

const OrdersPurchase: React.FC = () => {
  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();
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
        "purchase_orders",
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
    //setIsRefreshing(true);
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
        title={isRTL ? "اوامر الشراء" : "Purchase Orders"}
        description={
          isRTL
            ? "إدارة وتتبع أوامر الشراء"
            : "Manage and track purchase orders"
        }
        other={isRTL ? "أمر شراء جديد" : "New Order"}
        href={"/purchase/orders/create"}
        sectionName={"Purchases"}
        pageName={"PurchaseOrders"}
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
            value: orders.filter((q) => q.status === "sent").length,
            icon: <Send className="w-8 h-8 text-info" />,
          },
          {
            title: isRTL ? "مقبولة" : "Accepted",
            value: orders.filter((q) => q.status === "Approved").length,
            icon: <CheckCircle className="w-8 h-8 text-success" />,
          },

          {
            title: isRTL ? "القيمة الإجمالية" : "Total Value",
            value: formatAmount(
              convertAmount(
                orders.reduce(
                  (sum, q) =>
                    sum +
                    convertAmount(
                      parseFloat(q.totalAmount) || 0,
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ((JSON.parse(q.main)?.currency &&
                        JSON.parse(JSON.parse(q.main)?.currency)?.code) ||
                        localStorage.getItem("selectedCurrency")) ??
                        selectedCurrency,
                    ),
                  0,
                ),
                localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              ),
            ),
            icon: <DollarSign className="w-8 h-8 text-destructive" />,
          },
        ]}
      />

      <Filters
        title={"PurchaseOrders"}
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
            {isRTL ? " أوامر الشراء" : "Purchase Orders"} ({orders.length})
          </h2>
        </div>

        {isLoading ? (
          <Loading title={isRTL ? "جاري تحميل ..." : "Loading..."} />
        ) : (
          <SecondaryList
            type="purchase"
            setIsRefreshing={setIsRefreshing}
            data={orders}
            titleLink={"orders"}
            title={isRTL ? "أوامر الشراء" : "Purchase Orders"}
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
        {orders.length === 0 && !isLoading && (
          <EmptyState
            clearAllFilters={clearFilters}
            title={isRTL ? "لم يتم العثور على أوامر الشراء" : "No orders found"}
            description={
              isRTL
                ? "ابدأ بإنشاء امر شراء جديد"
                : "Get started by creating a new order"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default OrdersPurchase;
