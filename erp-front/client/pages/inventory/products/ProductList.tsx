import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Filters } from "@/components/sales/filters";
import { HomeHeader } from "@/components/sales/HomeHeader";
import { EmptyState } from "@/components/common/emptyState";
import Swal from "sweetalert2";
import { Pagination } from "@/components/dashboard/Pagination";
import { Loading } from "@/components/common/loading";
import { commonApi } from "@/lib/api";
import {
  getStatusColor,
  getStatusLabel,
  handleCopy,
  handleView,
  mainFilter,
} from "@/lib/function";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency } from "@/data/data";
import CryptoJS from "crypto-js";

const ProductList: React.FC = () => {
  const { isRTL } = useLanguage();
  const [mainData, setMainData] = useState([]);
  const { formatAmount, convertAmount } = useCurrency();

  const [advancedFilters, setAdvancedFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    barcode: "",
    paymentMethod: "all",
    salesPerson: "all",
    dateFrom: "",
    dateTo: "",
    amountFrom: "",
    amountTo: "",
    dueDateFrom: "",
    dueDateTo: "",
  });
  const navigate = useNavigate();

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
          ?.Inventory?.viewHisProducts === true
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
        "inventory_products",
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
      barcode: "",
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
        title={isRTL ? "إدارة المنتجات" : "Product Management"}
        description={
          isRTL ? "إدارة ومتابعة المنتجات" : "Manage and track products"
        }
        other={isRTL ? "منتج جديد" : "New Product"}
        href="/inventory/products/new"
        setIsRefreshing={setIsRefreshing}
        sectionName={"Inventory"}
        pageName={"addNewProduct"}
      />
      <Filters
        title={"Products"}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearFilters}
        sort={sort}
        setSort={setSort}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isRTL ? "المنتجات" : "Products"} ({mainData.length})
          </h2>
        </div>

        {isLoading ? (
          <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainData.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {p.sku}
                      </div>
                      <h3 className="text-lg font-semibold">
                        {JSON.parse(p.main)?.name}
                      </h3>
                      <div className="font-medium">
                        {" "}
                        {formatAmount(
                          convertAmount(
                            p.totalAmount ?? 0,
                            localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                          ),
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm mb-1">
                        {" "}
                        <Badge className={getStatusColor(p.status)}>
                          {getStatusLabel(p.status, isRTL)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "المخزون" : "Stock"}: {p?.stockQuantity || 0}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {/* Images - not clickable */}
                    <div className="flex gap-2 mb-3 h-[70px]">
                      {(() => {
                        if (!p.attachments) return null;

                        try {
                          const images = JSON.parse(p.attachments)?.images || [];
                          if (!images.length) return null;

                          return images.slice(0, 3).map((img, index) => (
                            <img
                              key={index}
                              src={img.url}
                              alt={img.original_name}
                              className="h-[80px] w-[80px] object-contain rounded border bg-white"
                            />
                          ));
                        } catch {
                          return null;
                        }
                      })()}
                    </div>

                    {/* Buttons row */}
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => {
                          handleView(
                            p,
                            navigate,
                            `/inventory/products/view/${p.id}`,
                          );
                        }}
                        className="text-sm text-primary cursor-pointer hover:underline"
                      >
                        {isRTL ? "عرض" : "View"}
                      </div>

                      <div
                        onClick={() => {
                          handleCopy(
                            isRTL ? "نسخ " : "Copy ",
                            isRTL
                              ? `هل تريد نسخ ${p.elementNumber}؟`
                              : `Do you want to copy ${p.elementNumber}?`,
                            p,
                            isRTL,
                            navigate,
                            "/inventory/products/new",
                          );
                        }}
                        className="text-sm text-muted-foreground cursor-pointer hover:underline"
                      >
                        {isRTL ? "نسخ" : "Duplicate"}
                      </div>
                    </div>
                  </div>

                </Card>
              </motion.div>
            ))}
          </div>
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
            title={isRTL ? "لم يتم العثور على منتجات" : "No products found"}
            description={
              isRTL
                ? "ابدأ بإنشاء منتج جديد"
                : "Get started by creating a new product"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};
export default ProductList;
