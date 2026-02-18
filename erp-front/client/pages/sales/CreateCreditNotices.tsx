import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Hash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import {
  loadInvoices,
} from "@/lib/api_function";
import { ChooseProducts } from "@/components/products/ChooseProducts";
import { MainButtons } from "@/components/common/MainButtons";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { CustomFields } from "@/components/common/CustomFields";
import Tabs from "@/components/ui/tab";
import { TotalsSection } from "@/components/invoices/TotalsSection";
import { ShippingInformation } from "@/components/invoices/ShippingInformation";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { QuotationPreviewModal } from "@/components/invoices/QuotationPreviewModal";
import { generateNumber, calculateTotals } from "@/lib/products_function";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import {
  handleSubmitCreditNotice,
  returnInitialValues,
} from "@/lib/return_function";

export default function CreateCreditNotices() {
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

  type type = {
    [key: string]: any;
  };

  const [invoice, setInvoice] = useState<type>({});
  const [invoiceMain, setInvoiceMain] = useState<type>({});
  const [activeTab, setActiveTab] = useState(0);
  const [productSearch, setProductSearch] = useState({});
  const [warehousesSearch, setWarehousesSearch] = useState({});

  useEffect(() => {
    loadInvoices(
      location.state?.action == "CreditNotice"
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

  return (
    <div className="max-w- mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                elementNumber: generateNumber("CRE"),
              }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : location.state?.action == "CreditNotice"
                ? {
                    ...JSON.parse(location.state?.newData.main),
                    elementNumber: generateNumber("CRE"),
                  }
                : {...returnInitialValues, elementNumber: generateNumber("CRE")}
        }
        //    validationSchema={validationSchema}
        onSubmit={(values) =>
          handleSubmitCreditNotice(
            values,
            false,
            isRTL,
            setIsSubmitting,
            setIsDraft,
            location,
            invoiceMain,
            serverImages,
            navigate,
            "sales_credit_notices",
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
                          ? "تعديل الاشعار الدائن"
                          : "Edit Credit Notice"
                        : isRTL
                          ? "إنشاء اشعار دائن جديد"
                          : "Create New Credit Notice"}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل اشعار دائن احترافي"
                          : "Edit a professional credit notice"
                        : isRTL
                          ? "إنشاء اشعار دائن احترافي"
                          : "Create a professional credit notice"}
                    </p>
                  </div>
                </div>
                <MainButtons
                  values={values}
                  setShowPreview={setShowPreview}
                  handleSubmit={handleSubmitCreditNotice}
                  isSubmitting={isSubmitting}
                  isDraft={true}
                  location={location}
                  setIsSubmitting={setIsSubmitting}
                  setIsDraft={setIsDraft}
                  invoiceMain={invoiceMain}
                  serverImages={serverImages}
                  tableName="sales_credit_notices"
                  pageName="sales"
                />
              </motion.div>

              {/* Credit Notice Header */}

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
                  condition={"addingCreditNoticeForHisCustomers"}
                  section={"Sales"}
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    {isRTL
                      ? "معلومات الاشعار الدائن"
                      : "Credit Notice Information"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "رقم الاشعار الدائن" : "Credit Notice Number"}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          disabled
                          name="elementNumber"
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder={
                            isRTL ? "CRE-2024-0001" : "CRE-2024-0001"
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
                        {isRTL ? "تاريخ الاستحقاق" : "Due Date"}
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
                    {location.state?.action != "CreditNotice" &&
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

              {/* Credit Notice Items */}

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

              <div className="h-40"> </div>

              {showPreview && (
                <QuotationPreviewModal
                  title={
                    isRTL ? "معاينة الاشعار الدائن" : "Credit Notice Preview"
                  }
                  title2={isRTL ? "اشعار دائن" : "CREDIT NOTICE"}
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
