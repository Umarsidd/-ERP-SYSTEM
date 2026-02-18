import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { X, Hash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuotationTemplate } from "@/components/template/QuotationTemplate";
import { BackButton } from "@/components/common/BackButton";
import { loadInvoices } from "@/lib/api_function";
import { ChooseProducts } from "@/components/products/ChooseProducts";
import { MainButtons } from "@/components/common/MainButtons";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { CustomFields } from "@/components/common/CustomFields";
import Tabs from "@/components/ui/tab";
import { TotalsSection } from "@/components/invoices/TotalsSection";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { ShippingInformation } from "@/components/invoices/ShippingInformation";
import { generateNumber, calculateTotals } from "@/lib/products_function";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import {
  handleSubmitCreditNotice,
  returnInitialValues,
} from "@/lib/return_function";

export default function PurchasesCreateCreditNotices() {
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

  const [invoice, setInvoice] = useState<type>({});
  const [invoiceMain, setInvoiceMain] = useState<type>({});

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
      "purchase_invoices",
    );
  }, []);

  return (
    <div className="max-w- mx-auto space-y-6 p-4 sm:p-6">
      {" "}
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
                : {
                    ...returnInitialValues,
                    elementNumber: generateNumber("CRE"),
                  }
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
            "purchase_credit_notices",
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
                          ? "تعديل الاشعار الدائن"
                          : "Edit Purchase Credit Notice"
                        : isRTL
                          ? "إنشاء اشعار مشتريات دائن جديد"
                          : "Create New Purchase Credit Notice"}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل اشعار مشتريات دائن احترافي"
                          : "Edit a professional purchase credit notice"
                        : isRTL
                          ? "إنشاء اشعار مشتريات دائن احترافي"
                          : "Create a professional purchase credit notice"}
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
                    handleSubmit={handleSubmitCreditNotice}
                    isSubmitting={isSubmitting}
                    isDraft={true}
                    location={location}
                    setIsSubmitting={setIsSubmitting}
                    setIsDraft={setIsDraft}
                    invoiceMain={invoiceMain}
                    serverImages={serverImages}
                    tableName="purchase_credit_notices"
                    pageName="purchase"
                  />
                </motion.div>
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
                  condition={"addingCreditNoticeForHisCustomers"}
                  section={"Purchases"}
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

                    {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "تاريخ الاستحقاق" : "Due Date"}
                    </label>
                    <div className="relative">
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
                  </div> */}
                  </div>
                </motion.div>{" "}
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

              <div className="h-40"> </div>

              {/* Credit Notice Preview Modal */}
              {showPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {isRTL
                          ? "معاينة الاشعار الدائن"
                          : "Credit Notice Preview"}
                      </h2>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Credit Notice Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                      <QuotationTemplate
                        data={{
                          ...values,
                          title: isRTL ? "اشعار دائن" : "CREDIT NOTICE",
                          //  element: isRTL ? "بنود الاشعار الدائن" : "Credit Notice Items",
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
