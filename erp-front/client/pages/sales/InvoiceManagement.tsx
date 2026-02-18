import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InvoiceCard } from "@/components/sales/invoiceCard";
import { Pagination } from "@/components/dashboard/Pagination";
import { TableView } from "@/components/sales/TableView";
import { EmptyState } from "@/components/common/emptyState";
import { Loading } from "@/components/common/loading";
import { StatsCards } from "@/components/sales/statsCards";
import { Filters } from "@/components/sales/filters";
import { HomeHeader } from "@/components/sales/HomeHeader";
import { commonApi } from "@/lib/api";
import { mainFilter } from "@/lib/function";
import CryptoJS from "crypto-js";

export default function InvoiceManagement() {
  const { isRTL } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;
  const [totalElements, setTotalElements] = useState(0);

  const [sort, setSort] = useState({
    field: "id",
    direction: "desc",
    type: "basic",
    json_path: "$.elementNumber",
  });

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

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewMode(mobile ? "cards" : "table");
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [currentPage, advancedFilters, sort, isRefreshing]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      var filter = await mainFilter(advancedFilters);

      if (
        (JSON.parse(localStorage.getItem("subRole") || "null") as any)?.Sales
          ?.viewHisInvoices === true
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
        "sales_invoices",
      );
      console.log("result", result);

      setTotalElements(result.total);
      setInvoices(result.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
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
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    // setIsRefreshing(true);
    try {
      await loadInvoices();
      Swal.fire({
        icon: "success",
        title: isRTL ? "تم التحديث" : "Refreshed",
        text: isRTL ? "تم تحديث البيانات بنجاح" : "Data refreshed successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      //setIsRefreshing(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const hasActiveFilters = Object.values(advancedFilters).some(
    (value) => value !== "all" && value !== "",
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <HomeHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isMobile={isMobile}
        title={isRTL ? "إدارة الفواتير" : "Invoice Management"}
        description={
          isRTL
            ? "إدارة وتتبع جميع فواتير المبيعات"
            : "Manage and track all sales invoices"
        }
        other={isRTL ? "فاتورة جديدة" : "New Invoice"}
        href={"/sales/invoices/create-invoice"}
        sectionName={"Sales"}
        pageName={"InvoiceManagement"}
      />

      {/* Stats Cards */}
      <StatsCards
        data={[
          {
            title: isRTL ? "إجمالي الفواتير" : "Total Invoices",
            value: totalElements,
            icon: <FileText className="w-8 h-8 text-primary" />,
          },
          {
            title: isRTL ? "الفواتير المدفوعة" : "Paid Invoices",
            value: invoices.filter((inv) => inv.status === "Paid").length,
            icon: <CheckCircle className="w-8 h-8 text-success" />,
          },
          {
            title: isRTL ? "الفواتير المعلقة" : "Pending Invoices",
            value: invoices.filter((inv) => inv?.stockStatus === "stockPending")
              .length,
            icon: <Clock className="w-8 h-8 text-warning" />,
          },
          {
            title: isRTL ? "الفواتير الغير مدفوعة" : "Unpaid Invoices",
            value: invoices.filter((inv) => inv.status === "Unpaid").length,
            icon: <AlertCircle className="w-8 h-8 text-destructive" />,
          },
        ]}
      />

      <Filters
        title={"Invoices"}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        sort={sort}
        setSort={setSort}
      />

      {/* Invoices Display */}
      {loading ? (
        <Loading
          title={isRTL ? "جاري تحميل الفواتير..." : "Loading invoices..."}
        />
      ) : viewMode === "cards" ? (
        /* Cards View */
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <InvoiceCard
                  setIsRefreshing={setIsRefreshing}
                  data={invoice}
                  type="sales"
                  sectionName={"Sales"}
                  pageName={"deletingAndEditingAllInvoices"}
                  pageName2={"deletingAndEditingHisInvoices"}
                />
              </motion.div>
            ))}
          </motion.div>

          <Pagination
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalElements={totalElements}
          />
        </div>
      ) : (
        /* Table View */
        <div className="bg-card border border-border rounded-lg overflow-">
          <TableView
            type="sales"
            setIsRefreshing={setIsRefreshing}
            main={invoices}
            sectionName={"Sales"}
            pageName={"deletingAndEditingAllInvoices"}
            pageName2={"deletingAndEditingHisInvoices"}
          />
          {/* Pagination */}
          <Pagination
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalElements={totalElements}
          />
        </div>
      )}
      {/* Empty State */}
      {invoices.length === 0 && loading == false && (
        <EmptyState
          clearAllFilters={clearAllFilters}
          title={isRTL ? "لا توجد فواتير" : "No invoices found"}
          description={
            isRTL
              ? "لم يتم العثور على فواتير تطابق معايير البحث."
              : "No invoices match your search criteria."
          }
          other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
        />
      )}
    </div>
  );
}
