import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import { recurrenceList, selectedCurrency, selectedSymbol } from "@/data/data";
import { useCurrency } from "@/contexts/CurrencyContext";
import { MainButtons } from "@/components/common/MainButtons";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { CustomFields } from "@/components/common/CustomFields";
import ReliableRichTextEditor from "@/components/editor/ReliableRichTextEditor";
import { generateNumber } from "@/lib/products_function";

export default function CreateInstallmentAgreements() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatAmount, convertAmount, currentCurrency } = useCurrency();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("INV"),
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
    description: "",
    paymentRate: "",
    installmentNumber: 0,
    installmentAmount: 0,
    installmentAmountWithFraction: 0,
    amount: 0,
    status: "Unpaid",
    fields: [],
    currency: JSON.stringify({
      code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
    }),
  });

  const schema = Yup.object().shape({
    customerId: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    installmentAmount: Yup.number()
      .min(2, isRTL ? "الحد الادنى 2" : "Minimum 2")
      .required(isRTL ? "مطلوب" : "Required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...values,
        attachments: [],
      };

      const result = [];
      let date = new Date(submitData.issueDate);
      var remain = 0;
      var co = submitData.installmentNumber * submitData.installmentAmount;

      if (co > submitData.amount) {
        var temp = co - submitData.amount;
        remain = Math.ceil(submitData.installmentAmount - temp);
      } else {
        remain = submitData.installmentAmount;
      }
      for (let i = 0; i < submitData.installmentNumber; i++) {
        // remain =
        //   remain +
        //   submitData.installmentAmount;// - submitData.installmentAmountWithFraction;
        result.push({
          id: i + 1,
          elementNumber: submitData.elementNumber,
          customerId: submitData.customerId,
          customer: submitData.customer,
          issueDate: new Date(date),
          dueDate: new Date(date),
          installmentAmountPaid: 0,
          installmentAmount:
            i == submitData.installmentNumber - 1
              ? remain
              : submitData.installmentAmount,
          remainingAmount:
            i == submitData.installmentNumber - 1
              ? remain
              : submitData.installmentAmount,
          status: "Unpaid",
        }); // تخزين نسخة من التاريخ الحالي

        switch (submitData.paymentRate) {
          case "Weekly":
            date.setDate(date.getDate() + 7);
            break;
          case "2 Weeks":
            date.setDate(date.getDate() + 14);
            break;
          case "4 Weeks":
            date.setDate(date.getDate() + 28);
            break;
          case "Monthly":
            date.setMonth(date.getMonth() + 1);
            break;
          case "2 Month":
            date.setMonth(date.getMonth() + 2);
            break;
          case "3 Month":
            date.setMonth(date.getMonth() + 3);
            break;
          case "6 Month":
            date.setMonth(date.getMonth() + 6);
            break;
          case "Yearly":
            date.setFullYear(date.getFullYear() + 1);
            break;
          default:
            date.setMonth(date.getMonth() + 1);
        }
      }

      if (location.state?.action == "edit") {
        await commonApi.update(
          location.state?.newData.id,
          {
            //issueDate: submitData.issueDate,
            updatedAt: new Date().toISOString(),
            installmentsList: JSON.stringify({
              data: result,
            }),
            dueDate: submitData.issueDate,
            installmentRate: submitData.paymentRate,
            installmentNumber: submitData.installmentNumber,
            installmentAmount: submitData.installmentAmount,
            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            status: submitData.status,
          },
          "installments",
        );
      } else {
        // console.log("result", result);
        //   console.log("submitData", submitData);

        var res = await commonApi.create(
          {
            //installmentAmountPaid  installmentsList
            createdAt: new Date().toISOString(),
            issueDate: submitData.issueDate,
            updatedAt: new Date().toISOString(),
            installmentsList: JSON.stringify({
              data: result,
            }),
            dueDate: submitData.issueDate,
            installmentRate: submitData.paymentRate,
            installmentNumber: submitData.installmentNumber,
            installmentAmount: submitData.installmentAmount,

            invoiceID: submitData.invoiceID,
            invoice: submitData.invoice,

            main: JSON.stringify(submitData),

            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount,
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
            status: submitData.status,
          },
          "installments",
        );
        console.log("res", res.data.id);

        // await commonApi.update(
        //   submitData.invoiceID,
        //   {
        //     // installments: JSON.stringify({
        //     //   //issueDate: submitData.issueDate,
        //     //   updatedAt: new Date().toISOString(),
        //     //   installmentsList: result,
        //     //   dueDate: submitData.issueDate,
        //     //   installmentRate: submitData.paymentRate,
        //     //   installmentNumber: submitData.installmentNumber,
        //     //   installmentAmount: submitData.installmentAmount,
        //     //   main: submitData,
        //     //   elementNumber: submitData.elementNumber,
        //     //   totalAmount: submitData.amount,
        //     //   updatedBy: JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user"),import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))?.user,
        //     //   status: submitData.status,
        //     // }),
        //     updatedAt: new Date().toISOString(),
        //     updatedBy: JSON.stringify(
        //       JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user"),import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))?.user,
        //     ),
        //   },
        //   "sales_invoices",
        // );
      }

      await Swal.fire({
        icon: "success",
        title:
          location.state?.action == "edit"
            ? isRTL
              ? "تم الحفظ بنجاح"
              : ""
            : isRTL
              ? "تم الإنشاء بنجاح"
              : "saved successfully",
        text:
          location.state?.action == "edit"
            ? isRTL
              ? "تم الحفظ بنجاح "
              : "saved successfully"
            : isRTL
              ? "تم الإنشاء بنجاح"
              : "Created successfully",
        // timer: 2000,
        showConfirmButton: false,
      });

      navigate("/installments/agreements");
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
      //   resetForm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      {" "}
      <Formik
        initialValues={
          location.state?.action == "installments"
            ? location.state?.newData
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : initialValues
        }
        validationSchema={schema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-4">
            <motion.div
              // initial={{ opacity: 0, y: -8 }}
              // animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse mt-12 sm:mt-0">
                <BackButton />
                <div>
                  <h1 className="text-2xl font-bold">
                    {isRTL
                      ? "إضافة / تحرير اتفاقية الاقساط "
                      : "Add / Edit Installments Agreements"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "إنشاء اتفاقية تقسيط جديدة أو تعديل اتفاقية حالية"
                      : "Create a new installment agreement or modify an existing one"}
                  </p>
                </div>
              </div>

              <MainButtons
                values={values}
                setShowPreview={null}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isDraft={null}
                location={location}
                submit="submit"
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
              />
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "معلومات العرض" : "Quotation Information"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 my-6">
                  <div>
                    <Label> {isRTL ? "رقم الفاتورة" : "Invoice Number"}</Label>

                    <Field
                      placeholder={isRTL ? "INV-2025-0001" : "INV-2025-0001"}
                      disabled
                      name="elementNumber"
                      //   type="date"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />

                    <ErrorMessage
                      name="elementNumber"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>

                  <div>
                    <Label>
                      {isRTL
                        ? "مبلغ اتفاقية التقسيط"
                        : "Installment Agreement Amount"}
                    </Label>

                    <Field
                      type="number"
                      value={values?.amount?.toFixed(0)}
                      name="amount"
                      disabled
                      //   type="date"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />

                    <ErrorMessage
                      name="amount"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>

                  <div>
                    <Label>{isRTL ? "مبلغ القسط" : "Installment Amount"}</Label>

                    <Field
                      onChange={(e) => {
                        setFieldValue("installmentAmount", e.target.value);
                        const fraction = String(
                          Math.ceil(
                            Number(values.amount) / Number(e.target.value),
                          ),
                        );

                        setFieldValue(
                          "installmentAmountWithFraction",
                          Number(values.amount) / Number(e.target.value),
                        );

                        setFieldValue("installmentNumber", fraction);
                      }}
                      min={1}
                      type="number"
                      name="installmentAmount"
                      //   type="date"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />

                    <ErrorMessage
                      name="installmentAmount"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>

                  <div>
                    <Label>
                      {isRTL ? "عدد الأقساط" : "Number of Installments"}
                    </Label>

                    <Field
                      type="number"
                      name="installmentNumber"
                      disabled
                      //   type="date"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />

                    <ErrorMessage
                      name="installmentNumber"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>

                  <div>
                    <Label>{isRTL ? "معدل السداد" : "Payment Rate"}</Label>
                    <Field
                      as="select"
                      name="paymentRate"
                      //  id="paymentRate"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-[14px] bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {recurrenceList.map((c) => (
                        <option key={c.nameAr} value={c.name}>
                          {isRTL ? `${c.nameAr}` : `${c.name}`}
                        </option>
                      ))}
                    </Field>

                    <ErrorMessage
                      name="paymentRate"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>

                  <div>
                    <Label> {isRTL ? "تاريخ الإصدار" : "Issue Date"}</Label>

                    <Field
                      name="issueDate"
                      type="date"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />

                    <ErrorMessage
                      name="issueDate"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>

                  <CustomFields values={values} />
                </div>{" "}
              </div>{" "}
            </div>

            {/* Notes with Rich Text Editor */}
            <div
              className="bg-card border border-border rounded-xl p-6 animate-slide-in-up mt-8"
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
                    value={values.description}
                    onChange={(value) => setFieldValue("description", value)}
                    placeholder={isRTL ? "ملاحظات إضافية" : "Additional notes"}
                    height="150px"
                    isRTL={isRTL}
                  />
                </div>
              </div>
            </div>

            {/* <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isRTL ? "حفظ" : "Save"}
                  {isSubmitting && (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => navigate("/installments/agreements")}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
              </div>{" "} */}
          </Form>
        )}
      </Formik>
    </div>
  );
}
