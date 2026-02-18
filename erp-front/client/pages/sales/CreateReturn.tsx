import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Hash, ChevronDown, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { paymentList } from "@/data/data";
import { BackButton } from "@/components/common/BackButton";
import { loadBankAccounts, loadInvoices } from "@/lib/api_function";
import { Label } from "@/components/ui/label";
import { ChooseProducts } from "@/components/products/ChooseProducts";
import { MainButtons } from "@/components/common/MainButtons";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { CustomFields } from "@/components/common/CustomFields";
import { QuotationPreviewModal } from "@/components/invoices/QuotationPreviewModal";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { ShippingInformation } from "@/components/invoices/ShippingInformation";
import { TotalsSection } from "@/components/invoices/TotalsSection";
import Tabs from "@/components/ui/tab";
import { generateNumber, calculateTotals } from "@/lib/products_function";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import { handleSubmit, returnInitialValues } from "@/lib/return_function";

export default function CreateReturn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState({});
  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );
  type type = {
    [key: string]: any;
  };
    const [warehousesSearch, setWarehousesSearch] = useState({});

  const [bankAccounts, setBankAccounts] = useState<type>({});
  const [bankAccountsMetaData, setBankAccountsMetaData] = useState([]);
  const [invoice, setInvoice] = useState<type>({});
  const [invoiceMain, setInvoiceMain] = useState<type>({});
  useEffect(() => {
    loadBankAccounts(setBankAccounts, setBankAccountsMetaData, setIsLoading);
    loadInvoices(
      location.state?.action == "return"
        ? location.state?.newData?.id
        : location.state?.newData?.invoiceID,
      1,
      20,
      setIsLoading,
      setInvoice,
      setInvoiceMain,
      "sales_invoices",
    );
  }, []);
  const { formatAmount, convertAmount } = useCurrency();
  return (
    <div className="max-w- mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                elementNumber: generateNumber("RET"),
              }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : location.state?.action == "return"
                ? {
                    ...JSON.parse(location.state?.newData.main),
                    elementNumber: generateNumber("RET"),
                  }
                : {
                    ...returnInitialValues,
                    elementNumber: generateNumber("RET"),
                  }
        }
        //    validationSchema={validationSchema}
        onSubmit={(values) =>
          handleSubmit(
            values,
            false,
            isRTL,
            setIsSubmitting,
            setIsDraft,
            location,
            invoiceMain,
            convertAmount,
            bankAccounts,
            bankAccountsMetaData,
            serverImages,
            navigate,
            "sales_return",
            "sales",
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
                          ? "تعديل فاتورة الارجاع"
                          : "Edit Return"
                        : isRTL
                          ? "إنشاء فاتورة ارجاع "
                          : "Create New Return"}
                    </h1>
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
                  invoiceMain={invoiceMain}
                  convertAmount={convertAmount}
                  bankAccounts={bankAccounts}
                  bankAccountsMetaData={bankAccountsMetaData}
                  serverImages={serverImages}
                  tableName="sales_return"
                  pageName="sales"
                />
              </motion.div>

              {/* Return Header */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerSelection
                  values={values}
                  setFieldValue={setFieldValue}
                  addQuery={addQuery}
                  initialValues={returnInitialValues}
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

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    {isRTL ? "معلومات فاتورة الارجاع" : "Return Information"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {" "}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "رقم الفاتورة " : "Invoice Number"}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <div className="h-12 w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                          {location.state?.action == "edit"
                            ? JSON.parse(location.state?.newData.invoice)
                                .elementNumber
                            : JSON.parse(location.state?.newData.main)
                                .elementNumber}{" "}
                        </div>{" "}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "رقم فاتورة الارجاع" : "Return Number"}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          disabled={true}
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
                        {isRTL ? "تاريخ الارجاع" : "Return Date"}
                      </label>
                      <div className="relative">
                        {/* <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <Field
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
                    {location.state?.action != "return" &&
                      location.state?.newData.invoiceID === undefined && (
                        <CurrencyFields
                          values={values}
                          setFieldValue={setFieldValue}
                          setAddQuery={setAddQuery}
                          setProductSearch={setProductSearch}
                        />
                      )}
                    <CustomFields values={values} />
                  </div>
                </motion.div>
              </div>

              {/* Return Items */}
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
              />

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

              {/* Deposit Details */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
                style={{ animationDelay: "450ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "تفاصيل الارجاع" : "Return Details"}
                </h2>

                {JSON.parse(location.state?.newData?.main)?.depositPaid !=
                  true && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Field
                        name="depositPaid"
                        type="checkbox"
                        className="w-5 h-5 text-primary bg-background border border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      />
                      <label className="text-sm font-medium text-foreground">
                        {isRTL
                          ? "تم دفع الفاتورة، وإعادة قيمة المبلغ المرتجع للعميل"
                          : "The invoice has been paid, and the refund amount has been returned to the customer."}
                      </label>
                    </div>
                  </div>
                )}
                {values.depositPaid && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "طريقة الدفع" : "Payment Method"}
                      </label>
                      <div className="relative mt-2">
                        <CreditCard className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          as="select"
                          name="paymentMethod"
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                        >
                          {/* <option value="Select payment method">
                            {isRTL
                              ? "اختر طريقة الدفع"
                              : "Select payment method"}
                          </option> */}
                          {paymentList.map((payment) => (
                            <option value={payment.name}>
                              {isRTL ? payment.nameAr : payment.name}
                            </option>
                          ))}
                        </Field>
                        <ChevronDown className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transactionId">
                        {isRTL ? "معرف المعاملة" : "Transaction ID"}
                      </Label>

                      <div className="relative">
                        <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />

                        <Field
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                          name="transactionId"
                          placeholder={
                            isRTL ? "معرف المعاملة" : "Transaction ID"
                          }
                        />
                      </div>
                      <ErrorMessage
                        name="transactionId"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="h-40"> </div>

              {showPreview && (
                <QuotationPreviewModal
                  title={isRTL ? "معاينة فاتورة الارجاع" : "Return Preview"}
                  title2={isRTL ? "فاتورة ارجاع" : "Return"}
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
