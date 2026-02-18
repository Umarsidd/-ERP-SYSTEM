import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import CryptoJS from "crypto-js";
import { useCurrency } from "@/contexts/CurrencyContext";
import Swal from "sweetalert2";
import { Plus, Minus, Hash, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { commonApi } from "@/lib/api";
import { selectedCurrency, selectedSymbol, stockOrdersList } from "@/data/data";
import { simpleCalculateTotals, mainFilter } from "@/lib/function";
import { BackButton } from "@/components/common/BackButton";
import { MainButtons } from "@/components/common/MainButtons";
import {
  generateNumber,
  calculateItemTotal,
  handleProductSelect,
} from "@/lib/products_function";
import Tabs from "@/components/ui/tab";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { CustomFields } from "@/components/common/CustomFields";
import { loadProducts, loadWarehouse } from "@/lib/api_function";
import { CurrencyFields } from "@/components/common/CurrencyFields";

export default function NewStockOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount, convertAmount, currentCurrency } = useCurrency();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDraft, setIsDraft] = useState(false);
  const [products, setProducts] = useState([]);
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

  const [productSearch, setProductSearch] = useState({});
  const [showProductDropdown, setShowProductDropdown] = useState<
    Record<number, boolean>
  >({});

  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );
  useEffect(() => {
    loadWarehouse(setWarehouses);
  }, []);

  useEffect(() => {
    loadProducts(addQuery, setIsLoading, setProducts);
  }, [productSearch]);

  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("ORD"),
    name: "addStorePermission",
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

    items: [
      {
        productId: "",
        productName: "",
        description: "",
        stockQuantity: 0,
        oldQuantity: 0,
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
    type: "Add",
    notes: "",
    attachments: [],
    amount: null,
    status: "stockPending",
    fields: [],
    discountType: "percentage",
    discountValue: 0,
    shippingCost: 0,

    paymentTermId: "1", // Default to Net 30
    transactionId: "",
    paymentTerm: null,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],

    shippingAddress: "",
    shippingAddressAr: "",
    shippingMethod: "Standard Delivery",
    depositAmount: 0,
    warehousesTo: "main",
    warehousesFrom: "main",
    remainAmount: 0,
    raisedAmount: 0,
    paidAmount: 0,
    numberOfPayments: 0,
    returnAmount: 0,
    returnOnlyAmount: 0,

    depositPaid: false,
    stockStatus: "stockPending",

    paymentMethod: "Cash",
    currency: JSON.stringify({
      code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
    }),
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
        values.items.some((item) => item.unitPrice < 0)
      ) {
        throw new Error(
          isRTL
            ? "يرجى إضافة بنود صحيحة مع وصف وكمية وسعر صحيح"
            : "Please add valid items with description, quantity, and unit price",
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
        const submitData = {
          ...values,
          amount: simpleCalculateTotals(values),
          //   status: "Returned",
          attachments: [],
        };
        //  console.log(`now`, submitData);
        console.log(`now`, simpleCalculateTotals(values));

        if (location.state?.action == "edit") {
          await commonApi.update(
            location.state?.newData.id,
            {
              updatedAt: new Date().toISOString(),
              issueDate: submitData.issueDate,
              main: JSON.stringify(submitData),
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              elementNumber: submitData.elementNumber,
              totalAmount: submitData.amount?.total,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "inventory_stock_order",
          );

          //  var res3 = await commonApi.update(
          //    location.state?.newData.id,
          //    {
          //      updatedAt: new Date().toISOString(),
          //      issueDate: submitData.issueDate,
          //      dueDate: submitData.dueDate,
          //      // isActive: isDraftSubmission,
          //      main: JSON.stringify(submitData),
          //      elementNumber: submitData.elementNumber,
          //      totalAmount: submitData.amount?.total,
          //      status: submitData.status,
          //      paymentMethod: submitData.paymentMethod,
          //      updatedBy: JSON.stringify(
          //        JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user"),import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))?.user,
          //      ),

          //      attachments: JSON.stringify({
          //        images: [...res, ...serverImages],
          //      }),
          //    },
          //    "sales_invoices",
          //  );

          // if (Array.isArray(submitData.items)) {
          //   (submitData.items as any[]).forEach(async (item: any) => {
          //     if (!item || !item.productId) return;
          //     try {
          //       commonApi.update(
          //         item.productId,
          //         {
          //           updatedAt: new Date().toISOString(),
          //           stockQuantity: item.stockQuantity,
          //           oldQuantity: item.stockQuantity,

          //           updatedBy: JSON.stringify(
          //             JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user"),import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))?.user,
          //           ),
          //         },
          //         "inventory_products",
          //       );
          //     } catch (err) {
          //       console.error("Failed to update product stock", err);
          //     }
          //   });
          // }
        } else {
          var res2 = await commonApi.create(
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
              main: JSON.stringify({
                ...submitData,
                name:
                  submitData.type == "Add"
                    ? "addStorePermission"
                    : submitData.type == "Transfer"
                      ? "Transfer"
                      : "StoreDisbursementOrder",
              }),
              elementNumber: submitData.elementNumber,
              totalAmount: submitData.amount?.total,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "inventory_stock_order",
          );

          // if (Array.isArray(submitData.items)) {
          //   (submitData.items as any[]).forEach(async (item: any) => {
          //     if (!item || !item.productId) return;
          //     try {
          //       commonApi.update(
          //         item.productId,
          //         {
          //           updatedAt: new Date().toISOString(),
          //           stockQuantity: item.stockQuantity,
          //           oldQuantity: item.stockQuantity,
          //           updatedBy: JSON.stringify(
          //             JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user"),import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))?.user,
          //           ),
          //         },
          //         "inventory_products",
          //       );
          //     } catch (err) {
          //       console.error("Failed to update product stock", err);
          //     }
          //   });
          // }
        }

        // if (submitData.type == "Add") {
        //   addOrEditAccountsEntry(
        //     location,
        //     submitData,
        //     location.state?.action == "edit"
        //       ? location.state?.newData.id
        //       : res2.data.id,
        //     "addStorePermission",
        //     "addStorePermission",
        //     "main_stock",
        //   );
        // } else {
        //   addOrEditAccountsEntry(
        //     location,
        //     submitData,
        //     location.state?.action == "edit"
        //       ? location.state?.newData.id
        //       : res2.data.id,
        //     "StoreDisbursementOrder",
        //     "main_stock",
        //     "StoreDisbursementOrder",
        //   );
        // }

        await Swal.fire({
          icon: "success",
          title:
            location.state?.action == "edit"
              ? isRTL
                ? "تم الحفظ بنجاح"
                : "Order has been saved"
              : isRTL
                ? "تم إنشاء الطلب بنجاح"
                : "Order created",
          text:
            location.state?.action == "edit"
              ? isRTL
                ? "تم حفظ الطلب "
                : "Order has been saved"
              : isRTL
                ? "تم إنشاء الطلب بنجاح"
                : "Order has been created",
          timer: 2000,
          showConfirmButton: false,
        });
        //console.log(`now`, res);

        navigate("/inventory/stock-orders");
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

  return (
    <div className="max- mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                elementNumber: generateNumber("ORD"),
              }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : location.state?.action == "create"
                ? { ...initialValues , type: location.state?.newData }
                : initialValues
        }
        //    validationSchema={validationSchema}
        onSubmit={(values) => handleSubmit(values, false)}
      >
        {({ values, setFieldValue, errors, touched }) => {
          const totals = simpleCalculateTotals(values);

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
                          ? "تعديل الطلب"
                          : "Edit Stock Order"
                        : isRTL
                          ? "إضافة طلب"
                          : "Create Stock Order"}
                    </h1>
                  </div>
                </div>

                <MainButtons
                  values={values}
                  setShowPreview={null}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDraft={null}
                  location={location}
                />
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerSelection
                  values={values}
                  setFieldValue={setFieldValue}
                  addQuery={addQuery}
                  initialValues={initialValues}
                  setIsLoading={setIsLoading}
                  setAddQuery={setAddQuery}
                  tableName={values.type == "Add" ? "supplier" : "customer"}
                  title={isRTL ? "المورد" : "Supplier"}
                  title2={isRTL ? "اختيار المورد" : "Supplier Selection"}
                  titleAdd={isRTL ? "إضافة مورد جديد" : "Add Supplier"}
                  titleList={
                    isRTL ? "اختر مورد من القائمة" : "Choose from supplier list"
                  }
                  titleSearch={
                    isRTL ? "البحث عن مورد..." : "Search for supplier..."
                  }
                />
                {/* Return Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    {isRTL ? "معلومات الطلب" : "Order Information"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "رقم الطلب" : "Order Number"}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          disabled={true}
                          name="elementNumber"
                          className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder={
                            isRTL ? "ORD-2026-0001" : "ORD-2026-0001"
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
                          disabled={
                            location.state?.action == "edit" ? false : true
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
                        {isRTL ? "نوع الطلب" : "Type"}
                      </label>
                      <div className="relative">
                        <Field
                          onChange={(e) => {
                            setFieldValue("type", e.target.value);

                            setFieldValue("items", [
                              {
                                productId: "",
                                productName: "",
                                description: "",
                                quantity: 1,
                                stockQuantity: 0,
                                oldQuantity: 0,
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
                              },
                            ]);

                            setProductSearch((prev) => ({}));

                            setAddQuery("");
                          }}
                          as="select"
                          name="type"
                          className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                          {stockOrdersList.map((option) => (
                            <option key={option.name} value={option.name}>
                              {isRTL ? option.nameAr : option.name}
                            </option>
                          ))}
                        </Field>{" "}
                      </div>
                      <ErrorMessage
                        name="type"
                        component="div"
                        className="text-destructive text-sm"
                      />
                    </div>

                    {values.type === "Transfer" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            {isRTL ? "من المستودع" : "from Warehouse"}
                          </label>
                          <div className="relative">
                            <Field
                              onChange={(e) => {
                                setFieldValue("warehousesFrom", e.target.value);

                                setFieldValue("items", [
                                  {
                                    productId: "",
                                    productName: "",
                                    description: "",
                                    quantity: 1,
                                    stockQuantity: 0,
                                    oldQuantity: 0,
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
                                  },
                                ]);

                                setProductSearch((prev) => ({}));

                                setAddQuery("");
                              }}
                              as="select"
                              name="warehousesFrom"
                              className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            >
                              {warehouses.map((option) => (
                                <option
                                  key={option.elementNumber}
                                  value={option.elementNumber}
                                >
                                  {isRTL
                                    ? option.elementNumber
                                    : option.elementNumber}
                                </option>
                              ))}
                            </Field>{" "}
                          </div>
                          <ErrorMessage
                            name="warehousesFrom"
                            component="div"
                            className="text-destructive text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            {isRTL ? "الى المستودع" : "to Warehouse"}
                          </label>
                          <div className="relative">
                            <Field
                              onChange={(e) => {
                                setFieldValue("warehousesTo", e.target.value);

                                setFieldValue("items", [
                                  {
                                    productId: "",
                                    productName: "",
                                    description: "",
                                    quantity: 1,
                                    stockQuantity: 0,
                                    oldQuantity: 0,
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
                                  },
                                ]);

                                setProductSearch((prev) => ({}));

                                setAddQuery("");
                              }}
                              as="select"
                              name="warehousesTo"
                              className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            >
                              {warehouses.map((option) => (
                                <option
                                  key={option.elementNumber}
                                  value={option.elementNumber}
                                >
                                  {isRTL
                                    ? option.elementNumber
                                    : option.elementNumber}
                                </option>
                              ))}
                            </Field>{" "}
                          </div>
                          <ErrorMessage
                            name="warehousesTo"
                            component="div"
                            className="text-destructive text-sm"
                          />
                        </div>
                      </>
                    )}

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

              {/* Return Items */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
                style={{ animationDelay: "200ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "بنود الطلب" : "Order Items"}
                </h2>
                <FieldArray name="items">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.items.map((item, index) => {
                        const itemTotal = calculateItemTotal(item);

                        return (
                          <div
                            key={index}
                            className="p-4 border border-border rounded-lg animate-scale-in"
                            style={{ animationDelay: `${300 + index * 100}ms` }}
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
                              {/* Product Selection */}
                              <div className="lg:col-span-2">
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "المنتج" : "Product"}
                                </label>
                                <div className="relative mt-1">
                                  {/* <Package className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder={
                                        isRTL
                                          ? "البحث عن منتج..."
                                          : "Search product..."
                                      }
                                      value={
                                        productSearch[index] || item.productName
                                      }
                                      onChange={(e) => {
                                        setProductSearch((prev) => ({
                                          ...prev,
                                          [index]: e.target.value,
                                        }));

                                        setAddQuery(e.target.value);
                                      }}
                                      onFocus={() =>
                                        setShowProductDropdown((prev) => ({
                                          ...prev,
                                          [index]: true,
                                        }))
                                      }
                                      onBlur={() => {
                                        setTimeout(
                                          () =>
                                            setShowProductDropdown((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            })),
                                          150,
                                        );
                                      }}
                                      className="w-full pl- rtl:pl- rtl:pr- pr- px-2 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                    <button
                                      type="button"
                                      // onClick={() =>
                                      // setProductSearch((prev) => ({
                                      //   ...prev,
                                      //   [index]: "",
                                      // }))
                                      // }
                                      className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    >
                                      <Search className="w-4 h-4" />
                                    </button>

                                    {showProductDropdown[index] && (
                                      <div className="absolute left-0 right-0 z-10 mt-1 bg-background border border-border rounded-lg max-h-56 overflow-y-auto shadow-lg">
                                        {products.map((product) => (
                                          <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => {
                                              handleProductSelect(
                                                product,
                                                index,
                                                setFieldValue,
                                                values.type === "Add",
                                                convertAmount,
                                                JSON.parse(values.currency)
                                                  .code,
                                                values.type,
                                              );

                                              setProductSearch((prev) => ({
                                                ...prev,
                                                [index]: product.elementNumber,
                                              }));
                                              setAddQuery("");
                                              setShowProductDropdown(
                                                (prev) => ({
                                                  ...prev,
                                                  [index]: false,
                                                }),
                                              );
                                            }}
                                            className="w-full p-3 text-left rtl:text-right hover:bg-muted transition-colors border-b border-border last:border-b-0"
                                          >
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <div className="font-medium">
                                                  {isRTL
                                                    ? product.elementNumber
                                                    : product.elementNumber}
                                                </div>
                                                {/* <div className="text-sm text-muted-foreground">
                                                  {product.description}
                                                </div> */}
                                              </div>
                                              <div className="text-sm font-medium">
                                                {formatAmount(
                                                  convertAmount(
                                                    values.type == "Add"
                                                      ? JSON.parse(product.main)
                                                          ?.purchasePrice
                                                      : product.totalAmount,
                                                    JSON.parse(values.currency)
                                                      .code,
                                                  ),
                                                  JSON.parse(values.currency)
                                                    .symbol,
                                                )}
                                              </div>
                                            </div>
                                          </button>
                                        ))}
                                        {products.length === 0 && (
                                          <div className="p-4 text-center text-muted-foreground">
                                            {isRTL
                                              ? "لا توجد نتائج"
                                              : "No results found"}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <ErrorMessage
                                  name={`items.${index}.productId`}
                                  component="div"
                                  className="text-destructive text-sm mt-1"
                                />
                              </div>

                              {/* Description */}
                              {/* <div className="lg:col-span-2">
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "الوصف" : "Description"}
                                </label>
                                <Field
                                  name={`items.${index}.description`}
                                  className="w-full mt-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                  placeholder={
                                    isRTL ? "وصف البند" : "Item description"
                                  }
                                />
                                <ErrorMessage
                                  name={`items.${index}.description`}
                                  component="div"
                                  className="text-destructive text-sm mt-1"
                                />
                              </div> */}

                              {/* Quantity */}
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "الكمية " : " Qty"}
                                </label>
                                <Field
                                  name={`items.${index}.quantity`}
                                  type="number"
                                  min="0"
                                  // step="0.01"
                                  className="w-full mt-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => {
                                    const quantity =
                                      parseFloat(e.target.value) || 0;
                                    setFieldValue(
                                      `items.${index}.quantity`,
                                      quantity,
                                    );
                                    setFieldValue(
                                      `items.${index}.total`,
                                      calculateItemTotal({ ...item, quantity }),
                                    );

                                    setFieldValue(
                                      `items.${index}.stockQuantity`,
                                      values.type == "Add"
                                        ? item.oldQuantity + quantity
                                        : item.oldQuantity - quantity,
                                    );
                                  }}
                                />
                              </div>

                              {item?.unitList?.length > 0 && (
                                <div>
                                  <label>{isRTL ? "الوحدة" : "Unit"}</label>
                                  <Field
                                    as="select"
                                    name={`items.${index}.unit`}
                                    className="w-full mt-1 px-2 py-1 bg-primary-50  border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                      setFieldValue(
                                        `items.${index}.unit`,
                                        e.target.value,
                                      );

                                      item?.unitList?.filter((r) => {
                                        if (
                                          r.value.toString() ===
                                          e.target.value.toString()
                                        ) {
                                          var unitName = r.unitName;
                                          setFieldValue(
                                            `items.${index}.unitName`,
                                            unitName,
                                          );
                                        }
                                      });

                                      var unitPrice =
                                        parseFloat(item?.originalUnitPrice) *
                                        parseFloat(e.target.value);

                                      setFieldValue(
                                        `items.${index}.unitPrice`,
                                        unitPrice,
                                      );
                                      setFieldValue(
                                        `items.${index}.total`,
                                        calculateItemTotal({
                                          ...item,
                                          unitPrice,
                                        }),
                                      );
                                    }}
                                  >
                                    {item?.unitList?.map((c) => (
                                      <option key={c.unitName} value={c.value}>
                                        {isRTL
                                          ? `${c.unitName}`
                                          : `${c.unitName}`}
                                      </option>
                                    ))}
                                  </Field>
                                </div>
                              )}

                              {/* Unit Price */}
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "السعر" : "Price"}
                                </label>
                                <div className="relative mt-1">
                                  {/* <DollarSign className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                                  <Field
                                    name={`items.${index}.unitPrice`}
                                    type="number"
                                    min="0"
                                    value={item.unitPrice?.toFixed(0)}
                                    //  step="0.01"
                                    className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                      const unitPrice =
                                        parseFloat(e.target.value) || 0;
                                      setFieldValue(
                                        `items.${index}.unitPrice`,
                                        unitPrice,
                                      );
                                      setFieldValue(
                                        `items.${index}.total`,
                                        calculateItemTotal({
                                          ...item,
                                          unitPrice,
                                        }),
                                      );
                                    }}
                                  />
                                </div>
                              </div>

                              {/* old quantity */}
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "الكمية قبل" : "Before Quantity"}
                                </label>
                                <div className="relative mt-1">
                                  {/* <DollarSign className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                                  <Field
                                    name={`items.${index}.oldQuantity`}
                                    type="number"
                                    min="0"
                                    disabled={true}
                                    //  step="0.01"
                                    className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>

                              {/* After quantity */}
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "الكمية بعد" : "After Quantity"}
                                </label>
                                <div className="relative mt-1">
                                  {/* <DollarSign className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                                  <Field
                                    name={`items.${index}.stockQuantity`}
                                    type="number"
                                    min="0"
                                    disabled={true}
                                    //  step="0.01"
                                    className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>

                              {/* Discount */}
                              {/* <div>
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "خصم" : "Discount"}
                                </label>
                                <div className="flex mt-1 space-x-1 rtl:space-x-reverse">
                                  <div className="relative flex-1">
                        
                                    <Field
                                      name={`items.${index}.discount`}
                                      type="number"
                                      min="0"
                                      //   step="0.01"
                                      className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                      ) => {
                                        const discount =
                                          parseFloat(e.target.value) || 0;
                                        setFieldValue(
                                          `items.${index}.discount`,
                                          discount,
                                        );
                                        setFieldValue(
                                          `items.${index}.total`,
                                          calculateItemTotal({
                                            ...item,
                                            discount,
                                          }),
                                        );
                                      }}
                                    />
                                  </div>
                                  <Field
                                    as="select"
                                    name={`items.${index}.discountType`}
                                    className="w-9 px-  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    onChange={(
                                      e: React.ChangeEvent<HTMLSelectElement>,
                                    ) => {
                                      setFieldValue(
                                        `items.${index}.discountType`,
                                        e.target.value,
                                      );
                                      setFieldValue(
                                        `items.${index}.total`,
                                        calculateItemTotal({
                                          ...item,
                                          discountType: e.target.value as
                                            | "percentage"
                                            | "fixed",
                                        }),
                                      );
                                    }}
                                  >
                                    <option value="percentage">%</option>
                                    <option value="fixed">$</option>
                                  </Field>
                                </div>
                              </div> */}

                              {/* Tax Rate */}
                              {/* <div>
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "ضريبة %" : "Tax %"}
                                </label>
                                <div className="relative mt-1">
                                  <Field
                                    name={`items.${index}.taxRate`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    // step="0.01"
                                    className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                      const taxRate =
                                        parseFloat(e.target.value) || 0;
                                      setFieldValue(
                                        `items.${index}.taxRate`,
                                        taxRate,
                                      );
                                      setFieldValue(
                                        `items.${index}.total`,
                                        calculateItemTotal({
                                          ...item,
                                          taxRate,
                                        }),
                                      );
                                    }}
                                  />
                                </div>
                              </div> */}

                              {/* Total and Actions */}
                              <div className="flex items-end justify-between">
                                <div>
                                  <label className="text-sm font-medium text-foreground">
                                    {isRTL ? "الإجمالي" : "Total"}
                                  </label>
                                  <div className="mt-1 px-4 py-2 bg-muted rounded-lg font-semibold text-foreground text-sm">
                                    {formatAmount(
                                      convertAmount(
                                        itemTotal,
                                        localStorage.getItem(
                                          "selectedCurrency",
                                        ) ?? selectedCurrency,
                                      ),
                                      JSON.parse(values.currency).symbol,
                                    )}
                                  </div>
                                </div>
                                {values.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() =>
                          push({
                            productId: "",
                            productName: "",
                            description: "",
                            stockQuantity: 0,
                            oldQuantity: 0,
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
                          })
                        }
                        className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse text-muted-foreground hover:text-primary"
                      >
                        <Plus className="w-5 h-5" />
                        <span>{isRTL ? "إضافة بند" : "Add Item"}</span>
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <div className="bg-white border border-border rounded-xl p-4 sm:p-6">
                <div>
                  <Tabs
                    tabs={[
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
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
