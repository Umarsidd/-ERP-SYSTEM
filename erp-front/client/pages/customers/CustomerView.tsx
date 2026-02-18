import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import { Copy, Edit, Printer, Trash2, X } from "lucide-react";
import {
  handleCopy,
  handleEdit,
  handlePayment,
  mainFilter, // Added this import
} from "@/lib/function";
import Tabs from "@/components/ui/tab";
import LightweightDialog, {
  LightweightDialogContent,
  LightweightDialogHeader,
} from "@/components/ui/lightweight-dialog";
import { OpeningBalance } from "@/components/customer/openingBalance";
import { Pagination } from "@/components/dashboard/Pagination";
import { EmptyState } from "@/components/common/emptyState";
import { Loading } from "@/components/common/loading";
import { SecondaryList } from "@/components/sales/secondaryList";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { loadUserData } from "@/lib/api_function";
import { AccountStatement } from "@/components/customer/AccountStatement";
import { useCurrency } from "@/contexts/CurrencyContext";
import { authApi } from "@/lib/authApi";
import { commonApi } from "@/lib/api";
import { safeJSONParse } from "@/lib/safe_json_helper";
import CryptoJS from "crypto-js";


export default function CustomerView() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const { formatAmount, convertAmount, currentCurrency } = useCurrency();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [statementData, setStatementData] = useState<any[]>([]);

  const [invoices, setInvoices] = useState([]);
  const [returns, setReturns] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [payments, setPayments] = useState([]);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const [invoiceNum, setInvoiceNum] = useState(0);
  const [returnNum, setReturnNum] = useState(0);
  const [creditNoteNum, setCreditNoteNum] = useState(0);
  const [paymentNum, setPaymentNum] = useState(0);

  // Filter state for Account Statement
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    search: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
    amountFrom: "",
    amountTo: "",
  });
  const [sort, setSort] = useState({
    field: "createdAt",
    direction: "desc",
  });

  const clearAllFilters = () => {
    setAdvancedFilters({
      search: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
    });
  };

  const hasActiveFilters = Object.values(advancedFilters).some(
    (value) => value !== "all" && value !== "",
  );

  var tableNameArray = [
    { name: "sales_invoices", list: setInvoices, list2: setInvoiceNum },
    { name: "sales_return", list: setReturns, list2: setReturnNum },
    {
      name: "sales_credit_notices",
      list: setCreditNotes,
      list2: setCreditNoteNum,
    },
    { name: "sales_payment", list: setPayments, list2: setPaymentNum },
  ];

  useEffect(() => {
    loadUserData(
      setIsLoading2,
      setCustomer,
      location,
      setIsLoading,
      tableNameArray,
      convertAmount,
    );
  }, [showAddModal]);

  // Load statement data with server-side filtering
  useEffect(() => {
    if (customer?.id) {
      loadStatementData();
    }
  }, [customer?.id, advancedFilters, sort]);

  const loadStatementData = async () => {
    try {
      setIsLoading(true);
      const filter = await mainFilter(advancedFilters);

      // Add customer ID filter
      filter.push({
        field: "main",
        operator: "=",
        value: customer.id,
        type: "json",
        andOr: "and",
        json_path: "$.customerId",
      });

      const result = await commonApi.getAll(
        1,
        1000,
        filter,
        {
          field: sort?.field || "createdAt",
          direction: sort?.direction || "asc",
          type: "basic",
        },
        "user_statement",
      );

      // Parse the main field from each statement record
      const parsedStatements = (result.data || []).map((item) => {
        return safeJSONParse(item.main, null);
      }).filter(item => item !== null);

      setStatementData(parsedStatements);
    } catch (error) {
      console.error("Error loading statement data:", error);
      setStatementData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          {isRTL ? "العميل غير موجود" : "Customer Not Found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? "عرض العميل" : "Customer Details"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL
                ? "تفاصيل العميل ومعلومات الاتصال"
                : "Customer full details and contact information"}
            </p>
          </div>
        </div>

        {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
          ?.Customers?.editAndDeleteAllCustomers !== false ||
          ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Customers?.editAndDeleteHisCustomers === true &&
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user?.id === JSON.parse(customer.createdBy).id)) && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setShowAddModal(true);
                }}
              >
                <span className=" sm:inline">
                  {(safeJSONParse(customer.main, {}) as any)?.openingBalance > 0
                    ? isRTL
                      ? "تعديل الرصيد الافتتاحي"
                      : "Edit Opening Balance"
                    : isRTL
                      ? "اضف رصيد افتتاحي"
                      : "Add Opening Balance"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  handlePayment(
                    null,
                    navigate,
                    `/sales/payments/new`,
                    "addPaymentCredit", //  "/${type}/invoices/create-invoice",
                  );
                }}
              >
                <span className=" sm:inline">
                  {isRTL ? "اضف رصيد مدفوعات" : "Add Payment Credit"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  handleCopy(
                    isRTL ? "نسخ " : "Copy ",
                    isRTL
                      ? `هل تريد نسخ ${customer.elementNumber}؟`
                      : `Do you want to copy ${customer.elementNumber}?`,
                    customer,
                    isRTL,
                    navigate,
                    "/customers/new",
                  );
                }}
              >
                <Copy className="h-4 w-4 sm:mr-2" />
                <span className=" sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
                onClick={async () => {
                  setIsSubmitting(true);
                  var res = await authApi.delete(
                    isRTL ? "حذف" : "Delete",
                    isRTL
                      ? `هل أنت متأكد من حذف ${customer.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${customer.elementNumber}? This action cannot be undone.`,
                    customer.id,
                    isRTL,
                  );

                  console.log("res", res);
                  if (res) {
                    navigate("/customers/management");
                  }
                }}
              >
                {isSubmitting && (
                  <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
                )}

                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className=" sm:inline">{isRTL ? "حذف" : "Delete"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleEdit(customer, navigate, `/customers/edit`)
                }
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                <span className=" sm:inline">{isRTL ? "تحرير" : "Edit"}</span>
              </Button>

            </div>
          )}
      </motion.div>

      <Card className="p-4">
        <div className="bg-white border border-border rounded-xl p-4 sm:p-4 mt-">
          <div>
            <Tabs
              tabs={[
                {
                  id: "Details",
                  title: isRTL ? "التفاصيل" : "Details",
                  content: (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "الاسم" : "Name"}
                          </div>
                          <div className="font-medium">{customer.name}</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "الشركة" : "Company"}
                          </div>
                          <div className="font-medium">
                            {" "}
                            {(safeJSONParse(customer.main, {}) as any)?.company ||
                              (isRTL ? "فرد" : "Individual")}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "الهاتف" : "Phone"}
                          </div>
                          <div className="font-medium">{customer.phone}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "البريد الإلكتروني" : "Email"}
                          </div>
                          <div className="font-medium">{customer.email}</div>
                        </div>
                        {/* <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "العملة" : "Currency"}
                  </div>
                  <div className="font-medium">
                    {JSON.parse(customer.main)?.currency}
                  </div>
                </div> */}
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "القيمة الضريبية" : "VAT Number"}
                          </div>
                          <div className="font-medium">
                            {(safeJSONParse(customer.main, {}) as any)?.vatNumber || "-"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "العنوان" : "Address"}
                          </div>
                          <div className="font-medium">
                            {(safeJSONParse(customer.main, {}) as any)?.address}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "الحالة" : "Status"}
                          </div>
                          <div className="font-medium">{customer.status}</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "المدينة" : "City"}
                          </div>
                          <div className="font-medium">
                            {(safeJSONParse(customer.main, {}) as any)?.city}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "المحافظة" : "State"}
                          </div>
                          <div className="font-medium">
                            {(safeJSONParse(customer.main, {}) as any)?.state}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "البلد" : "Country"}
                          </div>
                          <div className="font-medium">
                            {(safeJSONParse(customer.main, {}) as any)?.country}
                          </div>
                        </div>
                      </div>

                      {((safeJSONParse(customer.main, {}) as any)?.contacts?.length ?? 0) >= 1 && (
                        <div className="mt-8 mb-2">
                          <div className="text-xs text-muted-foreground">
                            {isRTL ? "جهات الاتصال" : "Contacts"}
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-1">
                            {((safeJSONParse(customer.main, {}) as any)?.contacts || []).map(
                              (ct, idx) =>
                                ct.name !== "" && (
                                  <div
                                    key={idx}
                                    className="p-3 border m-2  rounded-md"
                                  >
                                    <div className="font-medium">{ct.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {ct.job}
                                    </div>
                                    <div className="text-sm mt-">
                                      {ct.phone}
                                    </div>
                                  </div>
                                ),
                            )}
                          </div>
                        </div>
                      )}
                      <div className="mt-8 mb-2">
                        <DisplayImages
                          data={(safeJSONParse(customer.attachments, {}) as any)?.images}
                        />
                      </div>
                    </motion.div>
                  ),
                },

                {
                  id: "AccountStatement",
                  title: isRTL ? "كشف حساب" : "Account Statement",
                  content: (
                    <AccountStatement
                      customer={customer}
                      invoices={invoices}
                      isLoading={isLoading}
                      invoiceNum={invoiceNum}
                      paymentNum={paymentNum}
                      returns={returns}
                      returnNum={returnNum}
                      creditNotes={creditNotes}
                      creditNoteNum={creditNoteNum}
                      statementData={statementData}
                      advancedFilters={advancedFilters}
                      setAdvancedFilters={setAdvancedFilters}
                      showAdvancedFilters={showAdvancedFilters}
                      setShowAdvancedFilters={setShowAdvancedFilters}
                      sort={sort}
                      setSort={setSort}
                      hasActiveFilters={hasActiveFilters}
                      clearAllFilters={clearAllFilters}
                    />
                  ),
                },

                {
                  id: "AccountStatement",
                  title: isRTL ? "الفواتير" : "Invoices",
                  content: (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                          {isRTL ? " الفواتير " : " Invoices"} (
                          {invoices.length})
                        </h2>
                      </div>

                      {isLoading ? (
                        <Loading
                          title={isRTL ? "جاري تحميل ..." : "Loading..."}
                        />
                      ) : (
                        <SecondaryList
                          type="sales"
                          data={invoices}
                          titleLink={"invoices"}
                          title={null}
                          setIsRefreshing={setIsLoading}
                          sectionName={"Sales"}
                          pageName={"InvoiceManagement"}
                        />
                      )}

                      <Pagination
                        itemsPerPage={itemsPerPage}
                        startIndex={startIndex}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalElements={invoices.length}
                      />

                      {invoices.length === 0 && !isLoading && (
                        <EmptyState
                          clearAllFilters={null}
                          title={
                            isRTL
                              ? "لم يتم العثور على فواتير "
                              : "No Invoices found"
                          }
                          description={isRTL ? "" : ""}
                          other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
                        />
                      )}
                    </motion.div>
                  ),
                },
              ]}
              defaultIndex={activeTab}
              onChange={(i) => setActiveTab(i)}
            />
          </div>
        </div>
      </Card>

      <LightweightDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <LightweightDialogContent className="sm:w-[900px] sm:h-[77vh]">
          <div className="flex items-center justify-between mb-">
            <h3 className="text-lg font-semibold">
              {isRTL ? "إضافة عميل" : "Add Customer"}
            </h3>
            <div className="flex items-center  gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <LightweightDialogHeader>
            <></>
          </LightweightDialogHeader>

          <>
            <OpeningBalance
              isDialog={true}
              setShowAddModal={setShowAddModal}
              data={customer}
              id={customer.id}
            />
          </>
        </LightweightDialogContent>
      </LightweightDialog>
    </div>
  );
}
