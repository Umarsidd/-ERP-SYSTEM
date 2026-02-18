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
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/authApi";

const UserManagement: React.FC = () => {
  const { isRTL } = useLanguage();
  const [users, setUsers] = useState([]);
  //  const [assignedFilter, setAssignedFilter] = useState<string>("all");
  const navigate = useNavigate();

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
      //role: "customer"
      var result = await authApi.getAll(
        currentPage,
        itemsPerPage,
        filter,
        sort,
        "users",
        "Editor",
      );
      console.log("result", result);

      setTotalElements(result.total);
      setUsers(result.data);
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
      //setIsRefreshing(false);
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
        title={isRTL ? "قائمة المستخدمون" : "Users"}
        description={
          isRTL
            ? "عرض وإدارة سجلات المستخدمون "
            : "View and manage user records"
        }
        other={isRTL ? " مستخدم جديد" : "New User"}
        href={"/users/new"}
        sectionName={"Users"}
        pageName={"addNewUser"}
      />

      <Filters
        title={"Customers"}
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
            {isRTL ? "المستخدمون" : "Users"} ({users.length})
          </h2>
        </div>

        {isLoading ? (
          <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {c.company || (isRTL ? "فرد" : "Individual")}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="text-sm">
                          <div className="font-medium">{c.phone}</div>
                          <div className="text-muted-foreground text-xs">
                            {c.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          c.status === "Active"
                            ? "default"
                            : c.status === "prospect"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {isRTL
                          ? c.status === "Active"
                            ? "نشط"
                            : c.status === "prospect"
                              ? "مرشح"
                              : "غير نشط"
                          : c.status}
                      </Badge>
                      <Button
                        variant="link"
                        onClick={() => {
                          handleView(c, navigate, `/users/contacts/${c.id}`);
                        }}
                        //  to={`/users/view/${c.id}`}
                        className="text-sm text-primary"
                      >
                        {isRTL ? "جهات الاتصال" : "Contacts"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 border-t pt-3 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {c.city}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        onClick={() => {
                          handleView(c, navigate, `/users/view/${c.id}`);
                        }}
                        //  to={`/users/view/${c.id}`}
                        className="text-sm text-primary"
                      >
                        {isRTL ? "عرض" : "View"}
                      </Button>
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
        {users.length === 0 && !isLoading && (
          <EmptyState
            clearAllFilters={clearFilters}
            title={isRTL ? "لم يتم العثور على مستخدمين" : "No users found"}
            description={
              isRTL
                ? "ابدأ بإنشاء مستخدم جديد"
                : "Get started by creating a new user"
            }
            other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
          />
        )}
      </motion.div>
    </div>
  );
};
export default UserManagement;
