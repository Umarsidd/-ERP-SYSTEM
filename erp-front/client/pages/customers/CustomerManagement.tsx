import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmptyState } from "@/components/common/emptyState";
import { HomeHeader } from "@/components/sales/HomeHeader";
import Swal from "sweetalert2";
import { Loading } from "@/components/common/loading";
import { Pagination } from "@/components/dashboard/Pagination";
import { Filters } from "@/components/sales/filters";
import { handleView, mainFilter } from "@/lib/function";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/authApi";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { SecondaryList } from "@/components/sales/secondaryList";
import { TertiaryList } from "@/components/sales/tertiaryList";

const CustomerManagement: React.FC = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
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

  const startIndex = (currentPage - 1) * itemsPerPage;

  /* ---------- Responsive view mode (same as InvoiceManagement) ---------- */
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewMode(mobile ? "cards" : "table");
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ---------- Load data ---------- */
  useEffect(() => {
    loadCustomers();
  }, [currentPage, advancedFilters, sort, isRefreshing]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const filter = await mainFilter(advancedFilters);

      if (
        (JSON.parse(localStorage.getItem("subRole") || "null") as any)
          ?.Customers?.viewHisCustomers === true
      ) {
        filter.push({
          field: "createdBy",
          operator: "=",
          value: JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user")!,
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user?.id,
          type: "json",
          andOr: "and",
          json_path: "$.id",
        });
      }

      const result = await authApi.getAll(
        currentPage,
        itemsPerPage,
        filter,
        sort,
        "users",
        "customer",
      );

      setCustomers(result.data);
      setTotalElements(result.total);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await loadCustomers();
      Swal.fire({
        icon: "success",
        title: isRTL ? "تم التحديث" : "Refreshed",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch { }
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
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(advancedFilters).some(
    (v) => v !== "" && v !== "all",
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <HomeHeader
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isMobile={isMobile}
        title={isRTL ? "قائمة العملاء" : "Customers"}
        description={
          isRTL
            ? "عرض وإدارة سجلات العملاء"
            : "View and manage customer records"
        }
        other={isRTL ? "عميل جديد" : "New Customer"}
        href="/customers/new"
        sectionName="Customers"
        pageName="CustomerManagement"
      />

      <Filters
        title="Customers"
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearFilters}
        sort={sort}
        setSort={setSort}
      />

      {/* ---------- CONTENT (same structure as InvoiceManagement) ---------- */}
      {loading ? (
        <Loading title={isRTL ? "جاري التحميل..." : "Loading customers..."} />
      ) : viewMode === "cards" ? (
        /* CARDS VIEW */
        <div className="bg-card border rounded-lg overflow-hidden">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customers.map((c, idx) => {
              let imageUrl = "";
              try {
                imageUrl =
                  JSON.parse(c.attachments || "{}")?.images?.[0]?.url || "";
              } catch {}

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="p-3 hover:shadow-md transition-shadow m-2">
                    <div className="flex items-center gap-3">
                      {/* Image */}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-contain flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                          N/A
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {c.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.email}
                        </p>
                      </div>

                      {/* Status */}
                      <Badge variant="outline" className="text-xs">
                        {c.status}
                      </Badge>

                      {/* Action */}
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          handleView(c, navigate, `/customers/view/${c.id}`)
                        }
                      >
                        {isRTL ? "عرض" : "View"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
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
        /* TABLE VIEW */

        <TertiaryList
          type="Customer"
          setIsRefreshing={setIsRefreshing}
          data={customers}
          titleLink={"customers"}
          title={isRTL ? "سندات القبض" : "customers"}
          sectionName={"Finance"}
          pageName={"editAndDeleteAllCustomers"}
          pageName2={"editAndDeleteCustomers"}
        />
        // <div className="bg-card border rounded-lg overflow-hidden">
        //   <table className="w-full text-sm">
        //     <thead className="bg-muted">
        //       <tr>
        //         <th className="p-3 text-left"></th>
        //         <th className="p-3 text-left">Name</th>
        //         <th className="p-3 text-left">Email</th>
        //         <th className="p-3 text-left">Phone</th>
        //         <th className="p-3 text-left">Status</th>
        //         <th className="p-3 text-right">Actions</th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {customers.map((c) => (
        //         <tr key={c.id} className="border-t">
        //           <td className="p-3">
        //             <div className="flex items-center">
        //               {(() => {
        //                 let imageUrl = "";
        //                 try {
        //                   imageUrl =
        //                     JSON.parse(c.attachments || "{}")?.images?.[0]?.url || "";
        //                 } catch { }

        //                 return imageUrl ? (
        //                   <img
        //                     src={imageUrl}
        //                     alt={c.name}
        //                     className="w-10 h-10 rounded-full object-contain border bg-muted"
        //                   />
        //                 ) : (
        //                   <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border">
        //                     {c.name?.charAt(0)?.toUpperCase() || "?"}
        //                   </div>
        //                 );
        //               })()}
        //             </div>
        //           </td>

        //           <td className="p-3">{c.name}</td>
        //           <td className="p-3">{c.email}</td>
        //           <td className="p-3">{c.phone}</td>
        //           <td className="p-3">
        //             <Badge>{c.status}</Badge>
        //           </td>
        //           <td className="p-3 text-right">
        //             <Button
        //               variant="link"
        //               onClick={() =>
        //                 handleView(c, navigate, `/customers/view/${c.id}`)
        //               }
        //             >
        //               {isRTL ? "عرض" : "View"}
        //             </Button>
        //           </td>
        //         </tr>
        //       ))}
        //     </tbody>
        //   </table>

        //   <Pagination
        //     itemsPerPage={itemsPerPage}
        //     startIndex={startIndex}
        //     currentPage={currentPage}
        //     setCurrentPage={setCurrentPage}
        //     totalElements={totalElements}
        //   />
        // </div>
      )}

      {customers.length === 0 && !loading && (
        <EmptyState
          clearAllFilters={clearFilters}
          title={isRTL ? "لا يوجد عملاء" : "No customers found"}
          description={
            isRTL ? "ابدأ بإنشاء عميل جديد" : "Start by creating a new customer"
          }
          other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
