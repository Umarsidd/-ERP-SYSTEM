import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { X, Hash, CakeSlice } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuotationTemplate } from "@/components/template/QuotationTemplate";
import { commonApi } from "@/lib/api";
import { BackButton } from "@/components/common/BackButton";
import { ChooseProducts } from "@/components/products/ChooseProducts";
import { MainButtons } from "@/components/common/MainButtons";
import { CustomFields } from "@/components/common/CustomFields";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import Tabs from "@/components/ui/tab";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { ShippingInformation } from "@/components/invoices/ShippingInformation";
import { TotalsSection } from "@/components/invoices/TotalsSection";
import { generateNumber, calculateTotals } from "@/lib/products_function";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import { selectedCurrency, selectedSymbol } from "@/data/data";

export default function CreatePurchaseOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  //  const { formatAmount, convertAmount, currentCurrency } = useCurrency();
  const { isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [productSearch, setProductSearch] = useState({});

  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );
  const [activeTab, setActiveTab] = useState(0);

  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("ORD"),
    customerId: "",
    customer: {
      id: "",
      name: "",
      nameAr: "",
      email: "",
      phone: "",
      address: "",
      addressAr: "",
      taxNumber: "",
    },
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [
      {
        productId: "",
        productName: "",
        oldQuantity: 0,
        stockQuantity: 0,
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        discountType: "percentage",
        taxRate: 0,
        total: 0,
        unitList: [],
        unit: "",
        originalUnitPrice: 0,
        unitName: "",
        warehouses: "main",
        unitPrice2: 0,
        originalUnitPrice2: 0,
      },
    ],
    notes: "",
    validUntil: 30,
    discountType: "percentage",
    discountValue: 0,
    shippingCost: 0,
    shippingAddress: "",
    shippingAddressAr: "",
    shippingMethod: "Standard Delivery",
    attachments: [],
    amount: null,
    status: "Draft",
    fields: [],
    currency: JSON.stringify({
      code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
    }),

    paymentTermId: "1", // Default to Net 30
    transactionId: "",
    paymentTerm: null,

    depositAmount: 0,

    remainAmount: 0,
    raisedAmount: 0,
    paidAmount: 0,
    numberOfPayments: 0,
    returnAmount: 0,
    returnOnlyAmount: 0,

    depositPaid: false,

    stockStatus: "stockPending",

    paymentMethod: "Cash",
  });

  const handleSubmit = async (values, isDraftSubmission = false) => {
    setIsSubmitting(true);
    setIsDraft(isDraftSubmission);

    try {
      // Validate required fields for non-draft submissions
      // if (!isDraftSubmission) {
      if (!values.customerId || !values.customer.name) {
        throw new Error(
          isRTL
            ? "يرجى اختيار المورد من القائمة"
            : "Please select a supplier from the list",
        );
      }
      // else if (!values.salesRepId || !values.salesRep.name) {
      //   throw new Error(
      //     isRTL
      //       ? "يرجى اختيار مندوب المبيعات"
      //       : "Please select a purchase representative",
      //   );
      // }
      else if (
        values.items.length === 0 ||
        values.items.some((item) => item.quantity <= 0 || item.unitPrice <= 0)
      ) {
        throw new Error(
          isRTL
            ? "يرجى إضافة بنود صحيحة للفاتورة مع وصف وكمية وسعر صحيح"
            : "Please add valid quotation items with description, quantity, and unit price",
        );
      }
      //}

      var res = await commonApi.upload(values.attachments); // uploadedAttachments
      console.log("attachments", res);
      if (res.result === false) {
        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text:
            //     res.error.message ||
            isRTL
              ? "صيغة المرفق غير مدعومة او حجمة كبير جدا"
              : "Attachment format is not supported or its size is too large",
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      } else {
        var submitData = {
          ...values,
          amount: calculateTotals(values),
          status: isDraftSubmission ? "Draft" : "Pending",
          attachments: [],
        };

        if (location.state?.action == "edit") {
          await commonApi.update(
            location.state?.newData.id,
            {
              //  createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              issueDate: submitData.issueDate,
              //  dueDate: submitData.dueDate,
              //   isActive: isDraftSubmission,
              main: JSON.stringify(submitData),
              elementNumber: submitData.elementNumber,
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              totalAmount: submitData.amount?.total,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "purchase_orders",
          );
        } else {
          await commonApi.create(
            {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              issueDate: submitData.issueDate,
              //  dueDate: submitData.dueDate,
              //   isActive: isDraftSubmission,
              main: JSON.stringify(submitData),
              elementNumber: submitData.elementNumber,
              totalAmount: submitData.amount?.total,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "purchase_orders",
          );

          if (location.state?.newData.convert == true) {
            await commonApi.update(
              location.state?.newData.id,
              {
                status: "Completed",
              },
              "purchase_quotations",
            );
          }
        }

        // Show success message
        await Swal.fire({
          icon: "success",
          title: isDraftSubmission
            ? isRTL
              ? "تم حفظ المسودة بنجاح"
              : "Draft Saved Successfully"
            : isRTL
              ? "تم إنشاء امر شراء بنجاح"
              : "Order Created Successfully",
          text: isDraftSubmission
            ? isRTL
              ? "تم حفظ امر شراء كمسودة"
              : "Order has been saved as draft"
            : isRTL
              ? "تم إنشاء أمر شراء وإرسالها"
              : "Order has been created and sent",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/purchase/orders");
      }
    } catch (error: any) {
      console.error("Error:", error);
      await Swal.fire({
        icon: "error",
        title: isRTL ? "خطأ" : "Error",
        text:
          error.message ||
          (isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred"),
        confirmButtonText: isRTL ? "حسناً" : "OK",
      });
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  // const filteredCustomers = customers.filter(
  //   (customer) =>
  //     customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     customer.name.includes(searchTerm) ||
  //     customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  // );

  return (
    <div className="max-w- mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                elementNumber: generateNumber("ORD"),
              }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : initialValues
        }
        //    validationSchema={validationSchema}
        onSubmit={(values) => handleSubmit(values, false)}
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
                          ? "تعديل امر شراء"
                          : "Edit Order"
                        : isRTL
                          ? "إنشاء امر شراء جديد"
                          : "Create New Purchase Order"}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل امر شراء احترافي"
                          : "Edit a professional purchase order"
                        : isRTL
                          ? "إنشاء امر شراء احترافي"
                          : "Create a professional purchase order"}
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
                  />
                </motion.div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerSelection
                  values={values}
                  setFieldValue={setFieldValue}
                  addQuery={addQuery}
                  initialValues={initialValues}
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
                {/* Quotation Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    {isRTL ? "معلومات امر شراء" : "Order Information"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "رقم الامر" : "Order Number"}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          disabled
                          name="elementNumber"
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder={
                            isRTL ? "QUO-2024-0001" : "QUO-2024-0001"
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
                        {isRTL ? "صالح حتى (ايام)" : "Valid Until (Days)"}
                      </label>
                      <div className="relative">
                        <CakeSlice className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          //   disabled
                          name="validUntil"
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder={
                            isRTL ? "صالح حتى (ايام)" : "Valid Until (Days)"
                          }
                        />
                      </div>
                      <ErrorMessage
                        name="validUntil"
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

                    <CustomFields values={values} />
                  </div>
                </motion.div>{" "}
              </div>

              {/* Quotation Items */}
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

              {/* Quotation Preview Modal */}
              {showPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {isRTL ? "معاينة العرض" : "Quotation Preview"}
                      </h2>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quotation Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                      <QuotationTemplate
                        data={{
                          ...values,
                          title: isRTL ? "امر شراء" : "Purchase Order",
                          //   element: isRTL ? "بنود العرض" : "Quotation Items",
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
