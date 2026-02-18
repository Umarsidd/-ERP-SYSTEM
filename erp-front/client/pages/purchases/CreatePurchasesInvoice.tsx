import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { X, Hash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UnifiedInvoiceTemplate } from "@/components/template/InvoiceTemplate";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import { BackButton } from "@/components/common/BackButton";
import { loadBankAccounts } from "@/lib/api_function";
import { ChooseProducts } from "@/components/products/ChooseProducts";
import { MainButtons } from "@/components/common/MainButtons";
import { DepositDetails } from "@/components/invoices/DepositDetails";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { ShippingInformation } from "@/components/invoices/ShippingInformation";
import { TotalsSection } from "@/components/invoices/TotalsSection";
import Tabs from "@/components/ui/tab";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { CustomFields } from "@/components/common/CustomFields";
import { calculateTotals, generateNumber } from "@/lib/products_function";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import { handleSubmit, invoicesInitialValues } from "@/lib/invoices_function";
import { loadPriceLists, handlePriceListChange } from "@/lib/price_list_function";

export default function PurchasesCreatePurchasesInvoice() {
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
  type BankAccountsType = {
    [key: string]: any;
  };
  const [warehousesSearch, setWarehousesSearch] = useState({});

  const [productSearch, setProductSearch] = useState({});
  const { formatAmount, convertAmount } = useCurrency();

  const [bankAccounts, setBankAccounts] = useState<BankAccountsType>({});
  const [bankAccountsMetaData, setBankAccountsMetaData] = useState([]);
  const [priceLists, setPriceLists] = useState([]);

  useEffect(() => {
    loadBankAccounts(setBankAccounts, setBankAccountsMetaData, setIsLoading);
    loadPriceLists(setIsLoading, setPriceLists);
  }, []);

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
              : { ...invoicesInitialValues, elementNumber: generateNumber("INV") }
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
            "purchase_invoices",
            "purchase",
          )
        }
      >
        {({ values, setFieldValue, errors, touched }) => {
          const totals = calculateTotals(values);

          return (
            <Form className="space-y-8">
              {/* Header */}
              <motion.div
                // initial={{ opacity: 0, y: -20 }}
                // animate={{ opacity: 1, y: 0 }}
                // transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center space-x-4 rtl:space-x-reverse   mt-12 sm:mt-0">
                  <BackButton />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل فاتورة الشراء"
                          : "Edit Purchase Invoice"
                        : isRTL
                          ? "إنشاء فاتورة شراء جديدة"
                          : "Create New Purchase Invoice"}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل فاتورة شراء احترافية"
                          : "Edit a professional purchase invoice"
                        : isRTL
                          ? "إنشاء فاتورة شراء احترافية"
                          : "Create a professional purchase invoice"}
                    </p>
                  </div>
                </div>
                <motion.div
                  // initial={{ opacity: 0, x: 20 }}
                  // animate={{ opacity: 1, x: 0 }}
                  // transition={{ delay: 0.1 }}
                  className="flex items-center space-x-3 rtl:space-x-reverse"
                >
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
                    tableName="purchase_invoices"
                    pageName="purchase"
                  />
                </motion.div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerSelection
                  values={values}
                  setFieldValue={setFieldValue}
                  addQuery={addQuery}
                  initialValues={invoicesInitialValues}
                  setIsLoading={setIsLoading}
                  setAddQuery={setAddQuery}
                  tableName="supplier"
                  title={isRTL ? "المورد" : "Supplier"}
                  title2={isRTL ? "اختيار المورد" : "Supplier Selection"}
                  titleAdd={isRTL ? "إضافة مورد جديد" : "Add Supplier"}
                  titleList={
                    isRTL ? "اختر مورد من القائمة" : "Choose from supplier list"
                  }
                  titleSearch={
                    isRTL ? "البحث عن مورد..." : "Search for supplier..."
                  }
                  condition={"createInvoicesHisCustomers"}
                  section={"Purchases"}
                />
                {/* Invoice Header */}
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
                        {/* <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <Field
                          name="issueDate"
                          disabled={
                            location.state?.action == "edit" &&
                              (
                                JSON.parse(
                                  localStorage.getItem("subRole") || "null",
                                ) as any
                              )?.Purchases?.invoiceDateModification === true
                              ? true
                              : false
                          }
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
                        {isRTL ? "تاريخ الاستلام" : "Receiving Date"}
                      </label>
                      <div className="relative">
                        {/* <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <Field
                          disabled={
                            location.state?.action == "edit" &&
                              (
                                JSON.parse(
                                  localStorage.getItem("subRole") || "null",
                                ) as any
                              )?.Purchases?.invoiceDateModification === true
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

                            // Update all item prices (isPurchase = true for purchase invoices)
                            if (selectedPriceList) {
                              handlePriceListChange(selectedPriceList, values, setFieldValue, true);
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

                    <CustomFields values={values} />
                  </div>
                </motion.div>{" "}
              </div>

              {/* Invoice Items */}
              <ChooseProducts
                location={location}
                values={values}
                setFieldValue={setFieldValue}
                setAddQuery={setAddQuery}
                setIsLoading={setIsLoading}
                addQuery={addQuery}
                isPurchase={true}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                warehousesSearch={warehousesSearch}
                setWarehousesSearch={setWarehousesSearch}
                priceLists={priceLists}
              />

              {/* Tabs */}

              <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
                <div>
                  <Tabs
                    tabs={[
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

                      // {
                      //   id: "Payment",
                      //   title: isRTL ? "شروط الدفع" : "Payment Terms",
                      //   content: (
                      //     <PaymentTerms
                      //       values={values}
                      //       setFieldValue={setFieldValue}
                      //       paymentTerms={paymentTerms}
                      //     />
                      //   ),
                      // },
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
                    defaultIndex={activeTab}
                    onChange={(i) => setActiveTab(i)}
                  />
                </div>
              </div>

              <DepositDetails
                values={values}
                totals={totals}
                location={location}
              />

              <div className="h-40"> </div>

              {/* Invoice Preview Modal */}
              {showPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {isRTL ? "معاينة الفاتورة" : "Invoice Preview"}
                      </h2>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Invoice Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                      <UnifiedInvoiceTemplate
                        invoice={{
                          saleOrPurchase: "purchase",
                          elementNumber: values.elementNumber,
                          customer: values.customer || {
                            name: isRTL
                              ? "مورد غير محدد"
                              : "Supplier Not Selected",
                            nameAr: "مورد غير محدد",
                            email: "",
                            phone: "",
                            address: "",
                            addressAr: "",
                            taxNumber: "",
                          },
                          salesRep: values.salesRep,
                          paymentTerm: values.paymentTerm,
                          amount: calculateTotals(values).total,
                          status: "Draft",
                          issueDate: values.issueDate,
                          dueDate: values.dueDate,
                          items:
                            values.items.length > 0
                              ? values.items
                              : [
                                {
                                  description: isRTL
                                    ? "بند تجريبي للمعاينة"
                                    : "Sample item for preview",
                                  quantity: 1,
                                  unitPrice: 100,
                                  taxRate: 0,
                                },
                              ],
                          notes: values.notes,
                          //   notesAr: values.notesAr,
                          //   terms: values.terms,
                          //  termsAr: values.termsAr,
                          discountType: values.discountType,
                          discountValue: values.discountValue,
                          shippingCost: values.shippingCost,
                          shippingAddress: values.shippingAddress,
                          shippingAddressAr: values.shippingAddressAr,
                          shippingMethod: values.shippingMethod,
                          depositAmount: values.depositAmount,
                          depositPaid: values.depositPaid,

                          remainAmount: 0,
                          raisedAmount: 0,
                          paidAmount: 0,
                          numberOfPayments: 0,
                          returnAmount: 0,
                          returnOnlyAmount: 0,

                          attachments: values.attachments || [],

                          stockStatus: values.stockStatus,

                          paymentMethod: values.paymentMethod,
                          fields: values.fields || [],
                          currency:
                            values.currency ||
                            JSON.stringify({
                              code:
                                localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                              symbol:
                                localStorage.getItem(
                                  "selectedCurrencySymbol",
                                ) ?? selectedSymbol,
                            }),
                        }}
                        isRTL={isRTL}
                        mode="preview"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
