import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import CryptoJS from "crypto-js";
import { useCurrency } from "@/contexts/CurrencyContext";
import ReliableRichTextEditor from "@/components/editor/ReliableRichTextEditor";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Plus,
  Minus,
  Upload,
  X,
  Calendar,
  Building,
  MapPin,
  Hash,
  DollarSign,
  Percent,
  Calculator,
  Paperclip,
  Eye,
  Package,
  Truck,
  ChevronDown,
  Search,
  AlertCircle,
  PiggyBank,
  CreditCard,
  RectangleEllipsis,
  Repeat2,
  Repeat1,
  Repeat,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuotationTemplate } from "@/components/template/QuotationTemplate";
import { commonApi } from "@/lib/api";
import {
  mockCustomers,
  mockPaymentTerms,
  mockProducts,
  selectedCurrency,
} from "@/data/data";

import { BackButton } from "@/components/common/BackButton";
import { ChooseProducts } from "@/components/products/ChooseProducts";
import { MainButtons } from "@/components/common/MainButtons";
import { mainFilter } from "@/lib/function";
import {
  generateNumber,
  calculateTotals,
  handleCustomerSelect,
  handlePaymentTermSelect,
  handleFileUpload,
  removeAttachment,
} from "@/lib/products_function";

export default function NewSubscription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount, convertAmount, currentCurrency } = useCurrency();
  const { isRTL } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState(mockPaymentTerms);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState({
    field: "id",
    direction: "desc",
    type: "basic",
    json_path: "$.elementNumber",
  });

  const [productSearch, setProductSearch] = useState<Record<number, string>>(
    {},
  );
  const [showProductDropdown, setShowProductDropdown] = useState<
    Record<number, boolean>
  >({});

  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );



  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("REC"),
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
    paymentTermId: "1", // Default to Net 30
    paymentTerm: paymentTerms[0],
    issueDate: new Date().toISOString().split("T")[0],
    // dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    //   .toISOString()
    //   .split("T")[0],
    items: [
      {
        productId: "",
        productName: "",
        description: "",
        quantity: 1,
        stockQuantity: 0,
        unitPrice: 0,
        oldQuantity: 0,
        discount: 0,
        discountType: "percentage",
        taxRate: 0,
        total: 0,
        unitList: [],
        unit: "",
        originalUnitPrice: 0,
        unitName: "",
        unitPrice2: 0,
        originalUnitPrice2: 0,
      },
    ],
    notes: "",
    //  depositPaid: false,

    subscription: "",
    repetitionEvery: 1,
    repetitionNumber: 1,
    active: true,
    autoPayment: false,
    sendCopyToMe: false,

    // repetitionbefore: "",
    discountType: "percentage",
    discountValue: 0,
    shippingCost: 0,
    shippingAddress: "",
    shippingAddressAr: "",
    shippingMethod: "Standard Delivery",
    attachments: [],
    amount: null,
    status: "Draft",
  });

  const handleSubmit = async (values, isDraftSubmission = false) => {
    setIsSubmitting(true);
    setIsDraft(isDraftSubmission);

    try {
      // Validate required fields for non-draft submissions
      //if (!isDraftSubmission) {
      if (!values.customerId || !values.customer.name) {
        throw new Error(
          isRTL
            ? "يرجى اختيار العميل من القائمة"
            : "Please select a customer from the list",
        );
      }
      // else if (!values.salesRepId || !values.salesRep.name) {
      //   throw new Error(
      //     isRTL
      //       ? "يرجى اختيار مندوب المبيعات"
      //       : "Please select a sales representative",
      //   );
      // }
      else if (
        values.items.length === 0 ||
        values.items.some((item) => item.quantity <= 0 || item.unitPrice < 0)
      ) {
        throw new Error(
          isRTL
            ? "يرجى إضافة بنود صحيحة للفاتورة مع وصف وكمية وسعر صحيح"
            : "Please add valid Recurring items with description, quantity, and unit price",
        );
      }
      //  }

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
          status: "Active",
          attachments: [],
        };

        if (location.state?.action == "edit") {
          await commonApi.update(
            location.state?.newData.id,
            {
              updatedAt: new Date().toISOString(),
              issueDate: submitData.issueDate,
              //    dueDate: submitData.dueDate,
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              isActive: isDraftSubmission,
              main: JSON.stringify(submitData),
              elementNumber: submitData.elementNumber,
              totalAmount: submitData.amount?.total,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "sales_recurring",
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
              //     dueDate: submitData.dueDate,
              //   invoiceID: location.state?.newData.id,
              //   invoice: location.state?.newData.main,

              isActive: isDraftSubmission,
              main: JSON.stringify(submitData),
              elementNumber: submitData.elementNumber,
              totalAmount: submitData.amount?.total,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "sales_recurring",
          );
        }

        // Show success message
        await Swal.fire({
          icon: "success",
          title: isDraftSubmission
            ? isRTL
              ? "تم حفظ المسودة بنجاح"
              : "Draft Saved Successfully"
            : isRTL
              ? "تم إنشاء الفاتورة الدورية بنجاح"
              : "Recurring Created Successfully",
          text: isDraftSubmission
            ? isRTL
              ? "تم حفظ الفاتورة الدورية كمسودة"
              : "Recurring has been saved as draft"
            : isRTL
              ? "تم إنشاء الفاتورة الدورية وإرسالها"
              : "Recurring has been created and sent",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/sales/recurring-invoices");
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

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                elementNumber: generateNumber("REC"),
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
                          ? "تعديل الفاتورة الدورية"
                          : "Edit Recurring"
                        : isRTL
                          ? "إنشاء فاتورة دورية "
                          : "Create New Recurring"}
                    </h1>
                    {/* <p className="text-muted-foreground text-sm sm:text-base">
              {location.state?.action == "edit"
                ? isRTL
                  ? "تعديل الفاتورة الدورية "
                  : "Edit a return"
                : isRTL
                  ? "إنشاء فاتورة دورية "
                  : "Create New Recurring"}
            </p> */}
                  </div>
                </div>
                <MainButtons
                  values={values}
                  setShowPreview={setShowPreview}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDraft={true}
                  location={location}
                />
              </motion.div>

              {/* Recurring Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-4 sm:p-6"
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "معلومات الفاتورة الدورية" : "Recurring Information"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {" "}
                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "رقم الفاتورة " : "Invoice Number"}
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <div className="h-12 w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                        {location.state?.action == "edit"
                          ? JSON.parse(location.state?.newData.main)
                              .elementNumber
                          : JSON.parse(location.state?.newData.main)
                              .elementNumber}{" "}
                      </div>{" "}
                    </div>
                  </div> */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "رقم الفاتورة الدورية" : "Recurring Number"}
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        disabled={true}
                        name="elementNumber"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder={isRTL ? "INV-2024-0001" : "INV-2024-0001"}
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
                      {isRTL ? "الاشتراك" : "Subscription"}
                    </label>
                    <div className="relative">
                      <RectangleEllipsis className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        name="subscription"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        //   placeholder={isRTL ? "INV-2024-0001" : "INV-2024-0001"}
                      />
                    </div>
                    <ErrorMessage
                      name="subscription"
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
                      {isRTL
                        ? " إصدار فاتورة كل (أيام)"
                        : "Issue an invoice every (days)"}
                    </label>

                    <div className="relative">
                      <Repeat className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />

                      <Field
                        type="number"
                        min="1"
                        step="1"
                        name="repetitionEvery"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        //   placeholder={isRTL ? "INV-2024-0001" : "INV-2024-0001"}
                      />
                    </div>
                    <ErrorMessage
                      name="repetitionEvery"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "عدد مرات التكرار" : "Number of repetitions"}
                    </label>
                    <div className="relative">
                      <Repeat2 className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        type="number"
                        min="1"
                        step="1"
                        name="repetitionNumber"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        //   placeholder={isRTL ? "INV-2024-0001" : "INV-2024-0001"}
                      />
                    </div>
                    <ErrorMessage
                      name="repetitionNumber"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Field
                        name="active"
                        type="checkbox"
                        className="w-5 h-5 text-primary bg-background border border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      />
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "نشط" : "Active"}
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse"></div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse ">
                      <Field
                        name="sendCopyToMe"
                        type="checkbox"
                        className="w-5 h-5 text-primary bg-background border border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      />
                      <label className="text-sm font-medium text-foreground">
                        {isRTL
                          ? "أرسل لى نسخة من الفاتورة"
                          : "Send me a copy of the generated invoice"}
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse"></div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Field
                        name="autoPayment"
                        type="checkbox"
                        className="w-5 h-5 text-primary bg-background border border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      />
                      <label className="text-sm font-medium text-foreground">
                        {isRTL
                          ? "تفعيل الدفع التلقائي"
                          : "Enable auto payment for this invoice"}
                      </label>
                    </div>
                  </div>
                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "أصدر الفاتورة قبل" : "Issue invoice before"}
                    </label>
                    <div className="relative">
                      <Field
                        name="repetitionbefore"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        //   placeholder={isRTL ? "INV-2024-0001" : "INV-2024-0001"}
                      />
                    </div>
                    <ErrorMessage
                      name="repetitionbefore"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div> */}
                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "تاريخ الاستحقاق" : "Due Date"}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        name="dueDate"
                        type="date"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    <ErrorMessage
                      name="dueDate"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div> */}
                </div>
              </motion.div>

              {/* Customer and Sales Rep Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-4 sm:p-6"
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "العميل" : "Customer"}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols- gap-6">
                  {/* Customer Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "اختيار العميل" : "Customer Selection"} *
                    </label>

                    {/* Customer Search */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                          type="text"
                          placeholder={
                            isRTL
                              ? "البحث عن عميل..."
                              : "Search for customer..."
                          }
                          value={searchTerm}
                          onChange={(e) => {
                            setAddQuery(e.target.value);
                            setSearchTerm(e.target.value);
                          }}
                          onFocus={() => setShowCustomerSearch(true)}
                          onBlur={() => {
                            // Delay hiding to allow click events
                            setTimeout(() => setShowCustomerSearch(false), 150);
                          }}
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>

                      {!values.customerId && !showCustomerSearch && (
                        <button
                          type="button"
                          onClick={() => setShowCustomerSearch(true)}
                          className="w-full px-4 py-2 text-sm border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
                        >
                          {isRTL
                            ? "اختر عميل من القائمة"
                            : "Choose from customer list"}
                        </button>
                      )}
                    </div>

                    {/* Customer Dropdown */}
                    {showCustomerSearch && (
                      <div className="border border-border rounded-lg bg-background max-h-60 overflow-y-auto shadow-lg z-10">
                        {customers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              handleCustomerSelect(
                                customer,
                                setFieldValue,
                                setShowCustomerSearch,
                                setSearchTerm,
                                //   setAddQuery,
                              );

                              setAddQuery("");
                            }}
                            className="w-full p-4 text-left rtl:text-right hover:bg-muted transition-colors border-b border-border last:border-b-0"
                          >
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <Building className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">
                                  {isRTL ? customer.name : customer.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {customers.length === 0 && (
                          <div className="p-4 text-center text-muted-foreground">
                            {isRTL ? "لا توجد نتائج" : "No results found"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Customer Display */}
                    {values.customerId && (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <Building className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">
                                {isRTL
                                  ? values.customer.name
                                  : values.customer.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {values.customer.email}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFieldValue("customerId", "");
                              setFieldValue("customer", initialValues.customer);
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <ErrorMessage
                      name="customerId"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                </div>

                {/* Payment Terms */}
                {/* <div className="mt-6">
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? "شروط الدفع" : "Payment Terms"} *
                  </label>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {paymentTerms.map((term) => (
                      <button
                        key={term.id}
                        type="button"
                        onClick={() =>
                          handlePaymentTermSelect(term, setFieldValue)
                        }
                        className={`p-3 border rounded-lg text-left rtl:text-right transition-all ${
                          values.paymentTermId === term.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <CreditCard className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-sm">
                              {isRTL ? term.nameAr : term.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {term.days === 0
                                ? isRTL
                                  ? "فوري"
                                  : "Immediate"
                                : `${term.days} ${isRTL ? "أيام" : "days"}`}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <ErrorMessage
                    name="paymentTermId"
                    component="div"
                    className="text-destructive text-sm mt-1"
                  />
                </div> */}
              </motion.div>

              {/* Recurring Items */}
              {/* <ChooseProducts
                location={location}
                values={values}
                setFieldValue={setFieldValue}
                setAddQuery={setAddQuery}
                setIsLoading={setIsLoading}
                addQuery={addQuery}
              /> */}

              {/* Totals Section */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
                style={{ animationDelay: "300ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "الإجمالي والخصومات" : "Totals & Discounts"}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "نوع الخصم" : "Discount Type"}
                        </label>
                        <Field
                          as="select"
                          name="discountType"
                          className="w-full mt-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                          <option value="percentage">
                            {isRTL ? "نسبة مئوية" : "Percentage"}
                          </option>
                          <option value="fixed">
                            {isRTL ? "مبلغ ثابت" : "Fixed Amount"}
                          </option>
                        </Field>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "قيمة الخصم" : "Discount Value"}
                        </label>
                        <div className="relative mt-1">
                          {values.discountType === "percentage" ? (
                            <Percent className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          ) : (
                            <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          )}
                          <Field
                            name="discountValue"
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "تكلفة الشحن" : "Shipping Cost"}
                      </label>
                      <div className="relative mt-1">
                        <Truck className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          name="shippingCost"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grand Total Display */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center text-lg">
                      <Calculator className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                      {isRTL ? "الإجمالي" : "Grand Total"}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isRTL ? "المجموع الفرعي:" : "Subtotal:"}
                        </span>
                        <span className="font-medium">
                          {formatAmount(
                            convertAmount(
                              totals.subtotal,
                              localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                            ),
                          )}
                        </span>
                      </div>
                      {totals.totalItemDiscounts > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isRTL ? "خصومات البنود:" : "Item Discounts:"}
                          </span>
                          <span className="font-medium text-destructive">
                            -
                            {formatAmount(
                              convertAmount(
                                totals.totalItemDiscounts,
                                localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                              ),
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isRTL ? "الضريبة:" : "Tax:"}
                        </span>
                        <span className="font-medium">
                          {formatAmount(
                            convertAmount(
                              totals.totalTax,
                              localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                            ),
                          )}
                        </span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isRTL
                              ? "خصم الفاتورة الدورية:"
                              : "Recurring Discount:"}
                          </span>
                          <span className="font-medium text-destructive">
                            -
                            {formatAmount(
                              convertAmount(
                                totals.discount,
                                localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                              ),
                            )}
                          </span>
                        </div>
                      )}
                      {values.shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isRTL ? "الشحن:" : "Shipping:"}
                          </span>
                          <span className="font-medium">
                            {formatAmount(
                              convertAmount(
                                values.shippingCost,
                                localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                              ),
                            )}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>{isRTL ? "الإجمالي:" : "Grand Total:"}</span>
                          <span className="text-primary">
                            {formatAmount(
                              convertAmount(
                                totals.total,
                                localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
                style={{ animationDelay: "400ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "معلومات الشحن" : "Shipping Information"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "عنوان الشحن" : "Shipping Address"}
                    </label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 rtl:left-auto rtl:right-3 top-3 text-muted-foreground w-4 h-4" />
                      <Field
                        as="textarea"
                        name="shippingAddress"
                        rows="3"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        placeholder={isRTL ? "عنوان الشحن" : "Shipping address"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "طريقة الشحن" : "Shipping Method"}
                    </label>
                    <div className="relative mt-2">
                      <Truck className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        as="select"
                        name="shippingMethod"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                      >
                        <option value="Standard Delivery">
                          {isRTL ? "توصيل عادي" : "Standard Delivery"}
                        </option>
                        <option value="Express Delivery">
                          {isRTL ? "توصيل سريع" : "Express Delivery"}
                        </option>
                        <option value="Same Day Delivery">
                          {isRTL ? "توصيل في نفس اليوم" : "Same Day Delivery"}
                        </option>
                        <option value="Customer Pickup">
                          {isRTL ? "استلام من العميل" : "Customer Pickup"}
                        </option>
                      </Field>
                      <ChevronDown className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes with Rich Text Editor */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
                style={{ animationDelay: "500ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "الملاحظات والشروط" : "Notes & Terms"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {isRTL ? "ملاحظات" : "Notes"}
                    </label>
                    <ReliableRichTextEditor
                      value={values.notes}
                      onChange={(value) => setFieldValue("notes", value)}
                      placeholder={
                        isRTL ? "ملاحظات إضافية" : "Additional notes"
                      }
                      height="150px"
                      isRTL={isRTL}
                    />
                  </div>

                  {/* <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {isRTL ? "الشروط والأحكام" : "Terms & Conditions"}
                    </label>
                    <ReliableRichTextEditor
                      value={values.terms}
                      onChange={(value) => setFieldValue("terms", value)}
                      placeholder={
                        isRTL ? "الشروط والأحكام" : "Terms and conditions"
                      }
                      height="150px"
                      isRTL={isRTL}
                    />
                  </div> */}
                </div>
              </div>
              {/* File Attachments */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
                style={{ animationDelay: "550ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "المرفقات" : "Attachments"}
                </h2>

                <div className="space-y-4">
                  {location.state?.action == "edit" ? (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">
                        {isRTL ? "التحميلات التي على الخادم" : "Server Uploads"}
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {serverImages.map((f: any) => {
                          // const attached = !!selectedServerFiles.find(
                          //   (s) => s.id === f.id,
                          // );
                          return (
                            <div
                              key={f.id}
                              className="w-40 p-2 bg-card border border-border rounded-lg flex-shrink-0"
                            >
                              <div className="w-full h-24 mb-2 bg-muted rounded overflow-hidden flex items-center justify-center">
                                {f.mime && f.mime.startsWith("image") ? (
                                  <img
                                    src={f.url}
                                    alt={f.original_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-muted-foreground text-sm">
                                    {f.original_name}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground truncate">
                                  {f.original_name}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setServerImages(
                                      serverImages.filter(
                                        (file: any) => file.url !== f.url,
                                      ),
                                    );

                                    console.log(serverImages);
                                  }}
                                  className={`px-2 py-1 text-xs rounded ${1 == 1 ? "bg-red-500 text-white" : "bg-muted/20"}`}
                                >
                                  {isRTL ? "حذف" : "Delete"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 text-sm text-muted-foreground">
                      {/* {isRTL
                        ? "لم يتم العثور على تحميلات على الخادم"
                        : "No server uploads found"} */}
                    </div>
                  )}

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-all">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files,
                          setFieldValue,
                          values.attachments,
                          isRTL,
                        )
                      }
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        {isRTL ? "اختر الملفات" : "Choose files"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? "PDF, DOC, DOCX, JPG, PNG, GIF (حد أقصى 10MB)"
                          : "PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB)"}
                      </p>
                    </label>
                  </div>

                  {values.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">
                        {isRTL ? "الملفات المرفقة:" : "Attached Files:"}
                      </h4>
                      {values.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <Paperclip className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeAttachment(
                                index,
                                values.attachments,
                                setFieldValue,
                              )
                            }
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-card border border-border rounded-xl p-4 sm:p-6 gap-4 animate-slide-in-up"
                style={{ animationDelay: "600ms" }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/sales/recurring-invoices")}
                  className="px-4 sm:px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 rtl:space-x-reverse">
                  {location.state?.action != "edit" && (
                    <button
                      type="button"
                      onClick={() => handleSubmit(values, true)}
                      disabled={isSubmitting}
                      className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 sm:px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting && isDraft ? (
                        <>
                          <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                          <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>{isRTL ? "حفظ كمسودة" : "Save as Draft"}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    //type="submit"
                    onClick={() => handleSubmit(values, false)}
                    disabled={isSubmitting}
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {isSubmitting && !isDraft ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>
                          {location.state?.action == "edit"
                            ? isRTL
                              ? "جاري التعديل..."
                              : "Editing..."
                            : isRTL
                              ? "جاري الإنشاء..."
                              : "Creating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>
                          {location.state?.action == "edit"
                            ? isRTL
                              ? "تعديل الفاتورة الدورية"
                              : "Edit Recurring"
                            : isRTL
                              ? "إنشاء الفاتورة الدورية"
                              : "Create Recurring"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div> */}

              {/* Recurring Preview Modal */}
              {showPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {isRTL
                          ? "معاينة الفاتورة الدورية"
                          : "Recurring Preview"}
                      </h2>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Recurring Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                      <QuotationTemplate
                        data={{
                          ...values,
                          title: isRTL ? "الفاتورة الدورية" : "Recurring",
                          //      depositPaid: values.depositPaid,

                          //  element: isRTL ? "بنود الفاتورة الدورية" : "Recurring Items",
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
