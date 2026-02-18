import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DollarSign, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { paymentList, selectedCurrency, selectedSymbol } from "@/data/data";
import { BackButton } from "@/components/common/BackButton";
import { loadBankAccounts, loadInvoices } from "@/lib/api_function";
import { MainButtons } from "@/components/common/MainButtons";
import { CustomFields } from "@/components/common/CustomFields";
import { CustomerSelection } from "@/components/customer/CustomerSelection";
import { FileAttachments } from "@/components/invoices/FileAttachments";
import { NoteswithRichTextEditor } from "@/components/invoices/NoteswithRichTextEditor";
import Tabs from "@/components/ui/tab";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import { paymentHandleSubmit, paymentInvoicesInitialValues } from "@/lib/payment_function";
import { generateTransactionId } from "@/lib/products_function";

// Validation Schema
export default function PurchasesNewPayment() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const { formatAmount, convertAmount } = useCurrency();

  const validationSchema = Yup.object({
    customerId: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    // transactionId: Yup.string().required(
    //   isRTL ? "معرف المعاملة مطلوب" : "Transaction id is required",
    // ),
    // amount: Yup.number()
    //   .required(isRTL ? "المبلغ مطلوب" : "Amount is required")
    //   .positive(isRTL ? "المبلغ مطلوب" : "Amount must be positive"),
    //currency: Yup.string().required("Currency is required"),
    paymentMethod: Yup.string().required(
      isRTL ? "اختيار وسيلة الدفع مطلوبة" : "Payment method is required",
    ),
    issueDate: Yup.date().required(
      isRTL ? "تاريخ الدفع مطلوب" : "Payment date is required",
    ),
    status: Yup.string().required(
      isRTL ? "الحالة مطلوبة" : "Status is required",
    ),
    notes: Yup.string(),
  });
  const [productSearch, setProductSearch] = useState({});

  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );

  type type2 = {
    [key: string]: any;
  };


    const [installments, setInstallments] = useState<type2>({});
  
  const [invoice, setInvoice] = useState<type2>({});
  const [invoiceMain, setInvoiceMain] = useState<type2>({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [bankAccounts, setBankAccounts] = useState<type2>({});
  const [bankAccountsMetaData, setBankAccountsMetaData] = useState([]);

  useEffect(() => {
    loadBankAccounts(setBankAccounts, setBankAccountsMetaData, setIsLoading);
    loadInvoices(
      location.state?.action == "invoices"
        ? location.state?.newData?.id
        : location.state?.newData?.invoiceID,
      currentPage,
      itemsPerPage,
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
          location.state?.action == "edit"
            ? JSON.parse(location.state?.newData.main)
            : location.state?.action == "invoices"
              ? {
                  ...paymentInvoicesInitialValues,
                  amount:
                    location.state?.newData.status === "PartiallyPaid"
                      ? Math.abs(
                          Number(location.state?.newData.totalAmount) -
                            Number(
                              JSON.parse(location.state?.newData.main)
                                .paidAmount,
                            ),
                        )
                      : location.state?.newData.totalAmount,

                  currency:
                    JSON.parse(location.state?.newData.main)?.currency ||
                    JSON.stringify({
                      code:
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      symbol:
                        localStorage.getItem("selectedCurrencySymbol") ??
                        selectedSymbol,
                    }),
                  elementNumber: generateTransactionId(),
                }
              : {
                  ...paymentInvoicesInitialValues,
                  elementNumber: generateTransactionId(),
                }
        }
        validationSchema={validationSchema}
        onSubmit={(values) =>
          paymentHandleSubmit(
            values,
            isRTL,
            setIsSubmitting,
            location,
            invoiceMain,

            convertAmount,
            bankAccounts,
            bankAccountsMetaData,
            serverImages,
            navigate,
            "purchase_payment",
            "purchase",
            invoice,
            installments,
          )
        }
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form>
            {/* Header */}
            <motion.div
              // initial={{ opacity: 0, y: -20 }}
              // animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center gap-4  mt-12 sm:mt-0">
                <BackButton />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {location.state?.action == "edit"
                      ? isRTL
                        ? "تعديل الدفعة"
                        : "Edit Payment"
                      : isRTL
                        ? "دفعة شراء جديدة"
                        : "New Purchase Payment"}
                  </h1>
                  <p className="text-muted-foreground">
                    {location.state?.action == "edit"
                      ? isRTL
                        ? ""
                        : ""
                      : isRTL
                        ? "تسجيل دفعة شراء جديدة  "
                        : "Record a new payment"}
                  </p>
                </div>
              </div>
              <MainButtons
                values={values}
                setShowPreview={null}
                handleSubmit={paymentHandleSubmit}
                isSubmitting={isSubmitting}
                isDraft={null}
                location={location}
                submit={"submit"}
                setIsSubmitting={setIsSubmitting}
                invoiceMain={invoiceMain}
                convertAmount={convertAmount}
                bankAccounts={bankAccounts}
                bankAccountsMetaData={bankAccountsMetaData}
                serverImages={serverImages}
                invoice={invoice}
                installments={installments}
                tableName={"purchase_payment"}
                pageName={"purchase"}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerSelection
                  values={values}
                  setFieldValue={setFieldValue}
                  addQuery={addQuery}
                  initialValues={paymentInvoicesInitialValues}
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

                {/* Payment Information */}
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    {isRTL ? "معلومات الدفع" : "Payment Information"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">
                        {isRTL ? "معرف المعاملة" : "Transaction ID"}
                      </Label>

                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                        <Field
                          disabled
                          as={Input}
                          className="pl-10"
                          id="transactionId"
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

                    <div className="space-y-2">
                      <Label htmlFor="issueDate">
                        {isRTL ? "تاريخ الدفع" : "Payment Date"}
                        <span className="text-red-500 ml-1"></span>
                      </Label>
                      <div className="relative">
                        <Field
                          name="issueDate"
                          type="date"
                          className="w-full h-10  p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                      <ErrorMessage
                        name="issueDate"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {isRTL ? "المبلغ" : "Amount"}
                        <span className="text-red-500 ml-1"></span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Field
                          //    disabled={location.state?.action == "installments"?true:false}
                          as={Input}
                          id="amount"
                          name="amount"
                          type="number"
                          //    min="0"
                          max={
                            location.state?.action == "installments"
                              ? location.state?.newData.remainingAmount
                              : undefined
                          }
                          step="0.01"
                          placeholder={isRTL ? "0.00" : "0.00"}
                          className="pl-10"
                        />
                      </div>
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">
                        {isRTL ? "طريقة الدفع" : "Payment Method"}
                        <span className="text-red-500 ml-1"></span>
                      </Label>
                      <Select
                        dir={isRTL ? "rtl" : "ltr"}
                        value={values.paymentMethod}
                        onValueChange={(value) =>
                          setFieldValue("paymentMethod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isRTL
                                ? "اختر طريقة الدفع"
                                : "Select payment method"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentList.map((payment) => (
                            <SelectItem key={payment.name} value={payment.name}>
                              {isRTL ? payment.nameAr : payment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="paymentMethod"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                    {location.state?.action !== "invoices" &&
                      location.state?.action !== "return" &&
                      location.state?.action !== "installments" &&
                      location.state?.newData?.invoiceID === undefined && (
                        <CurrencyFields
                          values={values}
                          setFieldValue={setFieldValue}
                          setAddQuery={setAddQuery}
                          setProductSearch={setProductSearch}
                        />
                      )}
                    <CustomFields values={values} />
                  </div>
                </div>
              </div>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">
                        {isRTL ? "الحالة" : "Status"}
                        <span className="text-red-500 ml-1"></span>
                      </Label>
                      <Select
                        dir={isRTL ? "rtl" : "ltr"}
                        value={values.status}
                        onValueChange={(value) =>
                          setFieldValue("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isRTL ? "اختر الحالة" : "Select status"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {statusList.map((stat) => (
                            <SelectItem key={stat.name} value={stat.name}>
                              {isRTL ? stat.nameAr : stat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="status"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  </div> */}

              <div className="bg-white border border-border rounded-xl p-4 sm:p-6 mt-9">
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
            </motion.div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
