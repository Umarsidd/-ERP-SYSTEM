import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { Hash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import { loadBankAccounts } from "@/lib/api_function";
import { ChooseProducts } from "@/components/products/ChooseProducts";
import { MainButtons } from "@/components/common/MainButtons";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { CustomFields } from "@/components/common/CustomFields";
import { InvoicePreviewModal } from "@/components/invoices/InvoicePreviewModal";
import Tabs from "@/components/ui/tab";
import { DepositDetails } from "@/components/invoices/DepositDetails";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { ShippingInformation } from "@/components/invoices/ShippingInformation";
import { TotalsSection } from "@/components/invoices/TotalsSection";
import { generateNumber, calculateTotals } from "@/lib/products_function";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import { useCurrency } from "@/contexts/CurrencyContext";
import { handleSubmit, invoicesInitialValues } from "@/lib/invoices_function";
import { loadPriceLists, handlePriceListChange } from "@/lib/price_list_function";
import { fetchLastInvoice, calculateCustomerOutstanding } from "@/lib/invoice_helpers";
import { LastInvoicePanel } from "@/components/invoices/LastInvoicePanel";
import { CustomerCreditSummary } from "@/components/invoices/CustomerCreditSummary";
import { AccountGuideDropdown } from "@/components/account/AccountGuideDropdown";
import { AccountNode, loadCostCenterOrTreeAccountsData } from "@/lib/accounts_function";

export default function CreateInvoice() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );
  const { formatAmount, convertAmount } = useCurrency();

  type BankAccountsType = {
    [key: string]: any;
  };

  const [bankAccounts, setBankAccounts] = useState<BankAccountsType>({});
  const [bankAccountsMetaData, setBankAccountsMetaData] = useState([]);
  const [productSearch, setProductSearch] = useState({});
  const [warehousesSearch, setWarehousesSearch] = useState({});
  const [priceLists, setPriceLists] = useState([]);

  // New state for customer financial data
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [customerOutstanding, setCustomerOutstanding] = useState(0);
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState(false);

  const [accounts, setAccounts] = useState<AccountNode[]>([]);
  const [costCenters, setCostCenters] = useState<AccountNode[]>([]);

  useEffect(() => {
    loadBankAccounts(setBankAccounts, setBankAccountsMetaData, setIsLoading);
    loadPriceLists(setIsLoading, setPriceLists);
    loadCostCenterOrTreeAccountsData(setIsLoading, setAccounts, null, "accounts_guide");
    loadCostCenterOrTreeAccountsData(setIsLoading, setCostCenters, null, "cost_centers");
  }, []);

  // Add function to load customer financial data
  const loadCustomerData = async (customerId: string) => {
    if (!customerId) {
      setLastInvoice(null);
      setCustomerOutstanding(0);
      return;
    }

    setIsLoadingCustomerData(true);
    try {
      const [lastInv, outstanding] = await Promise.all([
        fetchLastInvoice(customerId, "sales_invoices"),
        calculateCustomerOutstanding(customerId, "sales_invoices"),
      ]);

      setLastInvoice(lastInv);
      setCustomerOutstanding(outstanding);
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setIsLoadingCustomerData(false);
    }
  };

  return (
    <div className="max-w- mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
              ...JSON.parse(location.state?.newData.main),
              elementNumber: generateNumber("INV"),
            }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : {
                ...invoicesInitialValues,
                elementNumber: generateNumber("INV"),
              }
        }
        // validationSchema={validationSchema}
        onSubmit={(values) =>
          handleSubmit(
            values,
            false,
            isRTL,
            setIsSubmitting,
            setIsDraft,
            location,
            convertAmount,
            bankAccounts,
            bankAccountsMetaData,
            serverImages,
            navigate,
            "sales_invoices",
            "sales",
          )
        }
      >
        {({ values, setFieldValue, errors, touched }) => {
          const totals = calculateTotals(values || invoicesInitialValues);

          return (
            <Form className="space-y-8">
              {/* Header */}
              <motion.div
                // initial={{ opacity: 0, y: -20 }}
                // animate={{ opacity: 1, y: 0 }}
                // transition={{ duration: 0.5 }}
                className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center space-x-4 rtl:space-x-reverse mt-12 sm:mt-0">
                  <BackButton />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل الفاتورة"
                          : "Edit Invoice"
                        : isRTL
                          ? "إنشاء فاتورة جديدة"
                          : "Create New Invoice"}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل فاتورة مبيعات احترافية"
                          : "Edit a professional sales invoice"
                        : isRTL
                          ? "إنشاء فاتورة مبيعات احترافية"
                          : "Create a professional sales invoice"}
                    </p>
                  </div>
                </div>
                <MainButtons
                  values={values}
                  setShowPreview={setShowPreview}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDraft={true}
                  location={location}
                  setIsSubmitting={setIsSubmitting}
                  setIsDraft={setIsDraft}
                  convertAmount={convertAmount}
                  bankAccounts={bankAccounts}
                  bankAccountsMetaData={bankAccountsMetaData}
                  serverImages={serverImages}
                  tableName="sales_invoices"
                  pageName="sales"
                  position="static"
                />
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                  <CustomerSelection
                    values={values}
                    setFieldValue={setFieldValue}
                    addQuery={addQuery}
                    initialValues={invoicesInitialValues}
                    setIsLoading={setIsLoading}
                    setAddQuery={setAddQuery}
                    tableName="customer"
                    title={
                      isRTL
                        ? "العميل ومندوب المبيعات"
                        : "Customer & Sales Representative"
                    }
                    title2={isRTL ? "اختيار العميل" : "Customer Selection"}
                    titleAdd={isRTL ? "إضافة عميل جديد" : "Add Customer"}
                    titleList={
                      isRTL ? "اختر عميل من القائمة" : "Choose from customer list"
                    }
                    titleSearch={
                      isRTL ? "البحث عن عميل..." : "Search for customer..."
                    }
                    condition={"createInvoicesHisCustomers"}
                    section={"Sales"}
                  />

                  {/* Invoice Information */}


                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border rounded-xl p-4 sm:p-6"
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      {isRTL ? "معلومات الفاتورة" : "Invoice Information"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "رقم الفاتورة" : "Invoice Number"}
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Field
                            disabled
                            name="elementNumber"
                            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder={
                              isRTL ? "INV-2024-0001" : "INV-2024-0001"
                            }
                          />
                        </div>
                        <ErrorMessage
                          name="elementNumber"
                          component="div"
                          className="text-destructive text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "تاريخ الإصدار" : "Issue Date"}
                        </label>
                        <div className="relative">
                          <Field
                            disabled={
                              location.state?.action == "edit" &&
                                (
                                  JSON.parse(
                                    localStorage.getItem("subRole") || "null",
                                  ) as any
                                )?.Sales?.invoiceDateModification === true
                                ? true
                                : false
                            }
                            name="issueDate"
                            type="date"
                            className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>
                        <ErrorMessage
                          name="issueDate"
                          component="div"
                          className="text-destructive text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "تاريخ الاستحقاق" : "Due Date"}
                        </label>
                        <div className="relative">
                          <Field
                            disabled={
                              location.state?.action == "edit" &&
                                (
                                  JSON.parse(
                                    localStorage.getItem("subRole") || "null",
                                  ) as any
                                )?.Sales?.invoiceDateModification === true
                                ? true
                                : false
                            }
                            name="dueDate"
                            type="date"
                            className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>
                        <ErrorMessage
                          name="dueDate"
                          component="div"
                          className="text-destructive text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "شروط الدفع (أيام) " : "Payment Terms (Days)"}
                        </label>
                        <div className="relative">
                          <Field
                            name="paymentTerm"
                            type="number"
                            min="0"
                            className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>
                        <ErrorMessage
                          name="paymentTerm"
                          component="div"
                          className="text-destructive text-sm"
                        />
                      </div>
                      <CurrencyFields
                        values={values}
                        setFieldValue={setFieldValue}
                        setAddQuery={setAddQuery}
                        setProductSearch={setProductSearch}
                      />

                      {/* Price List Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "قائمة الأسعار" : "Price List"}
                        </label>
                        <Field
                          as="select"
                          name="priceListId"
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            setFieldValue("priceListId", selectedId);

                            if (selectedId) {
                              const selectedPriceList = priceLists.find(pl => pl.id === selectedId);
                              setFieldValue("priceListName", selectedPriceList?.name || "Default");

                              // Update all item prices
                              if (selectedPriceList) {
                                handlePriceListChange(selectedPriceList, values, setFieldValue, false);
                              }
                            } else {
                              setFieldValue("priceListName", "Default");
                            }
                          }}
                        >
                          <option value="">{isRTL ? "افتراضي" : "Default"}</option>
                          {priceLists.map((priceList) => (
                            <option key={priceList.id} value={priceList.id}>
                              {priceList.name}
                            </option>
                          ))}
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AccountGuideDropdown
                          accounts={accounts}
                          selectedAccountId={values.revenueAccountId}
                          onSelect={(account) => setFieldValue("revenueAccountId", account?.id || "")}
                          label={isRTL ? "حساب الإيرادات" : "Revenue Account"}
                          placeholder={isRTL ? "اختر حساب..." : "Select account..."}
                          filterByCategory="4" // Revenue
                        />
                        <AccountGuideDropdown
                          accounts={costCenters}
                          selectedAccountId={values.costCenterId}
                          onSelect={(node) => setFieldValue("costCenterId", node?.id || "")}
                          label={isRTL ? "مركز التكلفة" : "Cost Center"}
                          placeholder={isRTL ? "اختر مركز تكلفة..." : "Select cost center..."}
                        />
                      </div>

                      <CustomFields values={values} />
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-full overflow-hidden">
                      {/* Financial Summary Header */}
                      <div className="mb-6">
                        {values.customerId ? (
                          <CustomerCreditSummary
                            outstandingAmount={customerOutstanding}
                            currentInvoiceTotal={totals.total || 0}
                            isLoading={isLoadingCustomerData}
                          />
                        ) : (
                          <div className="p-4 bg-muted/20 rounded-lg text-center text-muted-foreground text-sm">
                            {isRTL ? "الرجاء اختيار عميل لعرض الملخص المالي" : "Please select a customer to view financial summary"}
                          </div>
                        )}
                      </div>

                      {/* Integrated Tabs */}
                      <Tabs
                        defaultIndex={activeTab}
                        onChange={(i) => setActiveTab(i)}
                        tabs={[
                          // Last Invoice (Conditional)
                          ...(values.customerId ? [{
                            id: "LastInvoice",
                            title: isRTL ? "آخر فاتورة" : "Last Invoice",
                            content: (
                              <LastInvoicePanel
                                lastInvoice={lastInvoice}
                                isLoading={isLoadingCustomerData}
                              />
                            )
                          }] : []),
                          {
                            id: "Totals",
                            title: isRTL ? "الإجمالي والخصومات" : "Invoice Totals",
                            content: (
                              <TotalsSection values={values} totals={totals} />
                            ),
                          },
                          {
                            id: "Shipping",
                            title: isRTL ? "معلومات الشحن" : "Shipping Information",
                            content: <ShippingInformation />,
                          },
                          {
                            id: "Notes",
                            title: isRTL ? "ملاحظات" : "Notes",
                            content: (
                              <NoteswithRichTextEditor
                                values={values}
                                setFieldValue={setFieldValue}
                              />
                            ),
                          },
                          {
                            id: "Attachments",
                            title: isRTL ? "مرفقات الملفات" : "File Attachments",
                            content: (
                              <FileAttachments
                                values={values}
                                setFieldValue={setFieldValue}
                                setServerImages={setServerImages}
                                serverImages={serverImages}
                                location={location}
                              />
                            ),
                          },
                        ]}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Trigger customer data fetch when customerId changes */}
              {(() => {
                const customerId = values.customerId;
                useEffect(() => {
                  loadCustomerData(customerId);
                }, [customerId]);
                return null;
              })()}

              {/* Invoice Items */}
              <ChooseProducts
                location={location}
                values={values}
                setFieldValue={setFieldValue}
                setAddQuery={setAddQuery}
                setIsLoading={setIsLoading}
                addQuery={addQuery}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                warehousesSearch={warehousesSearch}
                setWarehousesSearch={setWarehousesSearch}
                priceLists={priceLists}
              />

              {/* Tabs */}



              <DepositDetails
                values={values}
                totals={totals}
                location={location}
              />

              <div className="h-40"> </div>

              {/* Invoice Preview Modal */}
              {showPreview && (
                <InvoicePreviewModal
                  values={values}
                  setShowPreview={setShowPreview}
                />
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

{
  /* <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger
                    value="PaymentTerms"
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:block">
                      {isRTL ? "شروط الدفع" : "Payment Terms"}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="TotalsSection"
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:block">
                      {isRTL ? "إجمالي الفاتورة" : "Invoice Totals"}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ShippingInformation"
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:block">
                      {isRTL ? "معلومات الشحن" : "Shipping Information"}
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="DepositDetails"
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:block">
                      {isRTL ? "ايداع" : "Deposit Details"}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="Notes"
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:block">
                      {isRTL ? "ملاحظات" : "Notes"}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="FileAttachments"
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:block">
                      {isRTL ? "مرفقات الملفات" : "File Attachments"}
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="PaymentTerms" className="space-y-4">
                  <PaymentTerms
                    values={values}
                    setFieldValue={setFieldValue}
                    paymentTerms={paymentTerms}
                  />
                </TabsContent>

                <TabsContent value="TotalsSection" className="space-y-4">
                  {" "}
                  <TotalsSection values={values} totals={totals} />
                </TabsContent>

                <TabsContent value="ShippingInformation" className="space-y-4">
                  {" "}
                  <ShippingInformation />
                </TabsContent>
                <TabsContent value="DepositDetails" className="space-y-4">
                  {" "}
                  <DepositDetails
                    values={values}
                    totals={totals}
                    location={location}
                  />
                </TabsContent>

                <TabsContent value="Notes" className="space-y-4">
                  {" "}
                  <NoteswithRichTextEditor
                    values={values}
                    setFieldValue={setFieldValue}
                  />
                </TabsContent>

                <TabsContent value="FileAttachments" className="space-y-4">
                  <FileAttachments
                    values={values}
                    setFieldValue={setFieldValue}
                    setServerImages={setServerImages}
                    serverImages={serverImages}
                    location={location}
                  />
                </TabsContent>
              </Tabs>  */
}
