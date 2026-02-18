import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { Hash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { commonApi } from "@/lib/api";
import { BackButton } from "@/components/common/BackButton";
import { MainButtons } from "@/components/common/MainButtons";
import { ChooseProductsAccounts } from "@/components/account/ChooseProductsAccounts";
import { calculateAccountsTotals } from "@/lib/accounts_function";
import { generateNumber } from "@/lib/products_function";
import Tabs from "@/components/ui/tab";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import { currencies } from "@/data/currencies";
import { Label } from "@/components/ui/label";

export default function AddEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [addQuery, setAddQuery] = useState("");

  const [addQuery2, setAddQuery2] = useState("");
  const [productSearch, setProductSearch] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [isLoading2, setIsLoading2] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );

  // useEffect(() => {
  //   console.log(
  //     "location?.state?.newData",
  //     JSON.parse(location?.state?.newData.main),
  //   );
  // }, []);

  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("ACC"),
    issueDate: new Date().toISOString().split("T")[0],
    items: [
      {
        costCenterId: "",
        costCenterName: "",
        guideId: "",
        guideName: "",
        description: "",
        taxRate: 0,
        credit: 0,
        debit: 0,
      },
      {
        costCenterId: "",
        costCenterName: "",
        guideId: "",
        guideName: "",
        description: "",
        taxRate: 0,
        credit: 0,
        debit: 0,
      },
    ],
    creditTotal: 0,
    debitTotal: 0,
    notes: "",
    elementName: "",
    attachments: [],
    amount: null,
    status: "Sent",
    //   fields: [],
    currency: JSON.stringify({
      code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
    }),
  });

  const handleSubmit = async (values, isDraftSubmission = false) => {
    setIsSubmitting(true);
    setIsDraft(isDraftSubmission);
    console.log("Submitting values:", values);
    try {
      if (
        values.items.length <= 1 ||
        calculateAccountsTotals(values).debit !==
          calculateAccountsTotals(values).credit
      ) {
        throw new Error(
          isRTL
            ? "يرجى إضافة بنود صحيحة ما لا يقل عن بندين وقيمة المدين يجب ان تساوي الدائن"
            : "Please add valid items with at least two items where debit does not equal credit",
        );
      }

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
          amount: calculateAccountsTotals(values),
          status: "Sent",
          attachments: [],
        };

        if (location.state?.action == "edit") {
          await commonApi.update(
            location.state?.newData.id,
            {
              updatedAt: new Date().toISOString(),
              issueDate: submitData.issueDate,
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              //   dueDate: submitData.dueDate,
              main: JSON.stringify({
                ...submitData,
              }),
              elementNumber: submitData.elementNumber,
              totalAmount: submitData.amount?.credit,

              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "accounts",
          );
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
              // dueDate: submitData.dueDate,
              // invoiceID: location.state?.newData.id,
              // invoice: location.state?.newData.main,
              main: JSON.stringify({
                ...submitData,
              }),
              elementNumber: submitData.elementNumber,
              totalAmount: submitData.amount?.credit,

              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "accounts",
          );
        }

        // Show success message
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

        navigate("/accounts/daily-entries");
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
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                elementNumber: generateNumber("ACC"),
              }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : location.state?.action == "return"
                ? JSON.parse(location.state?.newData.main)
                : initialValues
        }
        //    validationSchema={validationSchema}
        onSubmit={(values) => handleSubmit(values, false)}
      >
        {({ values, setFieldValue, errors, touched }) => {
          const totals = calculateAccountsTotals(values);

          return (
            <Form className="space-y-8">
              {/* Header */}
              <motion.div
                // initial={{ opacity: 0, y: -20 }}
                // animate={{ opacity: 1, y: 0 }}
                // transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center space-x-4 rtl:space-x-reverse mt-12 sm:mt-0">
                  <BackButton />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {location.state?.action == "edit"
                        ? isRTL
                          ? "تعديل القيد"
                          : "Edit Entry"
                        : isRTL
                          ? "إنشاء قيد جديد"
                          : "Create New Entry"}
                    </h1>
                    {/* <p className="text-muted-foreground text-sm sm:text-base">
              {location.state?.action == "edit"
                ? isRTL
                  ? "تعديل فاتورة الارجاع "
                  : "Edit a return"
                : isRTL
                  ? "إنشاء فاتورة ارجاع "
                  : "Create New Return"}
            </p> */}
                  </div>
                </div>
                <MainButtons
                  values={values}
                  setShowPreview={null}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDraft={true}
                  location={location}
                />
              </motion.div>

              {/* Return Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-4 sm:p-6"
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "معلومات القيد" : "Accounts Information"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {" "}
                  {/* <div className="space-y-2">
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
                  </div> */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "رقم القيد" : "Entry Number"}
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        disabled={true}
                        name="elementNumber"
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder={isRTL ? "ACC-2024-0001" : "ACC-2024-0001"}
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
                    <Label>{isRTL ? "العملة" : "Currency"}</Label>
                    <Field
                      as="select"
                      name="currency"
                      id="currency"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      onChange={(e) => {
                        setFieldValue("currency", e.target.value);
                        setFieldValue("items", [
                          {
                            costCenterId: "",
                            costCenterName: "",
                            guideId: "",
                            guideName: "",
                            description: "",
                            taxRate: 0,
                            credit: 0,
                            debit: 0,
                          },
                          {
                            costCenterId: "",
                            costCenterName: "",
                            guideId: "",
                            guideName: "",
                            description: "",
                            taxRate: 0,
                            credit: 0,
                            debit: 0,
                          },
                        ]);

                        //  setProductSearch((prev) => ({}));

                        setAddQuery("");
                      }}
                    >
                      {(
                        JSON.parse(
                          localStorage.getItem("selectedCurrencyList"),
                        ) ?? currencies
                      ).map((c) => (
                        <option key={c.code} value={JSON.stringify(c)}>
                          {isRTL
                            ? `${c.code} - ${c.symbol}`
                            : `${c.code} - ${c.symbol}`}
                        </option>
                      ))}
                    </Field>

                    <ErrorMessage
                      name="currency"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                </div>
              </motion.div>

              {/*  Items */}
              <ChooseProductsAccounts
                totals={totals}
                location={location}
                values={values}
                setFieldValue={setFieldValue}
                setAddQuery={setAddQuery}
                setIsLoading={setIsLoading}
                addQuery={addQuery}
                setAddQuery2={setAddQuery2}
                setIsLoading2={setIsLoading2}
                addQuery2={addQuery2}
              />

              {/* Tabs */}

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
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
