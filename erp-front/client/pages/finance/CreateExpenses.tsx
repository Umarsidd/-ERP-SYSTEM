import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage, Field, FieldArray } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";
import { AccountGuideDropdown } from "@/components/account/AccountGuideDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import {
  Building,
  Paperclip,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  categories,
  selectedCurrency,
  selectedSymbol,
} from "@/data/data";
import { loadBankAccounts, updateBankAccounts } from "@/lib/api_function";
import { addOrEditAccountsEntry, AccountNode, loadCostCenterOrTreeAccountsData } from "@/lib/accounts_function";
import { MainButtons } from "@/components/common/MainButtons";
import { mainFilter } from "@/lib/function";
import {
  generateNumber,
  handleCustomerSelect,
  handleFileUpload,
  removeAttachment,
} from "@/lib/products_function";
import { authApi } from "@/lib/authApi";
import { Input } from "@/components/ui/input";
import { currencies } from "@/data/currencies";
import { CurrencyFields } from "@/components/common/CurrencyFields";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CompactCurrencyFields } from "@/components/common/CompactCurrencyFields";

export default function CreateExpenses() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatAmount, convertAmount, currentCurrency } = useCurrency();

  const { isRTL } = useLanguage();
  const location = useLocation();
  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState({
    field: "id",
    direction: "desc",
    type: "basic",
    json_path: "$.elementNumber",
  });

  const [accounts, setAccounts] = useState<AccountNode[]>([]);
  const [costCenters, setCostCenters] = useState<AccountNode[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [updateId, setUpdateId] = useState("");

  useEffect(() => {
    loadCostCenterOrTreeAccountsData(setAccountsLoading, setAccounts, setUpdateId, "accounts_guide");
    loadCostCenterOrTreeAccountsData(setIsLoading, setCostCenters, null, "cost_centers");
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [searchTerm]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);

      var x = {
        search: addQuery,
        status: "all",
        category: "all",
        vendor: "",
        supplier: "",
        paymentMethod: "all",
        salesPerson: "all",
        dateFrom: "",
        dateTo: "",
        amountFrom: "",
        amountTo: "",
        dueDateFrom: "",
        dueDateTo: "",
      };
      var filter = await mainFilter(x);
      var result = await authApi.getAllWithoutRole(
        1,
        20,
        filter,
        sort,
        "users",
      );
      setCustomers(result.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  type BankAccountsType = {
    [key: string]: any;
  };

  const [bankAccounts, setBankAccounts] = useState<BankAccountsType>({});
  const [bankAccountsMetaData, setBankAccountsMetaData] = useState([]);

  useEffect(() => {
    loadBankAccounts(setBankAccounts, setBankAccountsMetaData, setIsLoading);
  }, []);

  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("EXP"),
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
    items: [],
    description: "",
    recurring: false,
    assignCostCenters: false,
    unit: "",
    category: "",
    vendor: "",
    supplier: "",
    recurrence: "",
    tax: 0,
    attachments: [],
    amount: 0,
    status: "Approved",
    paymentAccountId: "",
    paymentAccount: null as AccountNode | null,
    expenseAccountId: "",
    expenseAccount: null as AccountNode | null,
    costCenterId: "",
    currency: JSON.stringify({
      code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
    }),
  });

  const schema = Yup.object().shape({
    amount: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    paymentAccountId: Yup.string().required(isRTL ? "حساب الدفع مطلوب" : "Payment account required"),
    expenseAccountId: Yup.string().required(isRTL ? "حساب المصروف مطلوب" : "Expense account required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      var res = await commonApi.upload(values.attachments);
      if (res.result === false) {
        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text: isRTL
            ? "صيغة المرفق غير مدعومة او حجمة كبير جدا"
            : "Attachment format is not supported or its size is too large",
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      } else {
        const toCurrency = (() => {
          try {
            return JSON.parse(values?.currency).code;
          } catch {
            return values?.currency ?? selectedCurrency;
          }
        })();

        const fromCurrency = localStorage.getItem("selectedCurrency") ?? selectedCurrency;

        const amountIQD = convertAmount(
          Number(values.amount),
          fromCurrency,
          toCurrency
        );

        const submitData = {
          ...values,
          amount_iqd: amountIQD,
          currency: values.currency,
        };
        if (location.state?.action == "edit") {
          commonApi.update(
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
              dueDate: submitData.dueDate,
              main: JSON.stringify(submitData),
              elementNumber: submitData.elementNumber,
              totalAmount: amountIQD,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "expenses",
          );

          if (
            Number(location.state?.newData.totalAmount) !==
            Number(values.amount)
          ) {
            updateBankAccounts(
              bankAccounts.id,
              Number(location.state?.newData.totalAmount) >
                Number(values.amount)
                ? Number(bankAccounts.totalAmount) +
                Math.abs(
                  Number(values.amount) -
                  Number(location.state?.newData.totalAmount),
                )
                : Number(bankAccounts.totalAmount) -
                Math.abs(
                  Number(location.state?.newData.totalAmount) -
                  Number(values.amount),
                ),
              Math.abs(
                Number(values.amount) -
                Number(location.state?.newData.totalAmount),
              ),
              "Expense",
              "Withdraw",
              bankAccountsMetaData,
              submitData,
            );
          }
        } else {
          var res2 = await commonApi.create(
            {
              createdAt: new Date().toISOString(),
              issueDate: submitData.issueDate,
              updatedAt: new Date().toISOString(),
              dueDate: submitData.dueDate,
              main: JSON.stringify(submitData),
              elementNumber: submitData.elementNumber,
              totalAmount: amountIQD,
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
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "expenses",
          );

          updateBankAccounts(
            bankAccounts.id,
            Number(bankAccounts.totalAmount) - Number(values.amount),
            Number(values.amount),
            "Expense",
            "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        }

        addOrEditAccountsEntry(
          location,
          submitData,
          location.state?.action == "edit"
            ? location.state?.newData.id
            : res2.data.id,
          "expenses",
          "expenses",
          "bank_accounts",
        );

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
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/finance/expenses");
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
              ...JSON.parse(location.state?.newData.main),
              elementNumber: generateNumber("EXP"),
            }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : initialValues
        }
        validationSchema={schema}
        onSubmit={(values) => handleSubmit(values)}
        enableReinitialize
      >
        {({ values, handleChange, handleBlur, setFieldValue }) => (
          <Form className="space-y-4">
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse mt-12 sm:mt-0">
                <BackButton />
                <div>
                  <h1 className="text-2xl font-bold">
                    {isRTL ? "إضافة / تحرير المصروفات" : "Add / Edit Expenses"}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {isRTL
                      ? "قم بإضافة مصروف جديد إلى سجلاتك أو تعديل مصروف موجود."
                      : "Add a new expense to your records or edit an existing expense."}
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

            <Card className="p-6 bg-background shadow-xs border border-border/60">
              {/* Row 1: Amount & Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Amount + Currency */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{isRTL ? "المبلغ" : "Amount"}</Label>
                  <div className="grid grid-cols-[1fr_120px] gap-2">
                    <Field
                      name="amount"
                      type="number"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="h-10">
                      <CompactCurrencyFields
                        values={currencies}
                        setFieldValue={setFieldValue}
                        setAddQuery={setAddQuery}
                        setProductSearch={() => { }}
                        compact={true}
                      />
                    </div>
                  </div>
                  <ErrorMessage
                    name="amount"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                {/* Expenses Number */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{isRTL ? "رقم المصروف" : "Expenses Number"}</Label>
                  <Field
                    name="elementNumber"
                    disabled
                    className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <ErrorMessage
                    name="elementNumber"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                {/* Issue Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{isRTL ? "تاريخ المصروف" : "Expenses Date"}</Label>
                  <Field
                    name="issueDate"
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <ErrorMessage
                    name="issueDate"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
              </div>

              {/* Row 2: Accounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Payment Account (Treasury/Bank) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{isRTL ? "حساب الدفع (من)" : "Payment Account (From)"}</Label>
                  <AccountGuideDropdown
                    accounts={accounts}
                    selectedAccountId={values.paymentAccountId}
                    onSelect={(account) => {
                      setFieldValue("paymentAccountId", account?.id || "");
                      setFieldValue("paymentAccount", account);
                    }}
                    placeholder={isRTL ? "اختر حساب الدفع..." : "Select payment account..."}
                    filterByCategory="1" // Assets
                    className="w-full"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {isRTL ? "الحساب الذي سيتم الدفع منه (نقدية، بنك، إلخ)" : "The account from which payment will be made (cash, bank, etc.)"}
                  </p>
                  <ErrorMessage
                    name="paymentAccountId"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                {/* Expense Account */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{isRTL ? "حساب المصروف (إلى)" : "Expense Account (To)"}</Label>
                  <AccountGuideDropdown
                    accounts={accounts}
                    selectedAccountId={values.expenseAccountId}
                    onSelect={(account) => {
                      setFieldValue("expenseAccountId", account?.id || "");
                      setFieldValue("expenseAccount", account);
                    }}
                    placeholder={isRTL ? "اختر حساب المصروف..." : "Select expense account..."}
                    filterByCategory="5" // Expenses
                    className="w-full"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {isRTL ? "نوع المصروف (رواتب، إيجار، مرافق، إلخ)" : "Type of expense (salaries, rent, utilities, etc.)"}
                  </p>
                  <ErrorMessage
                    name="expenseAccountId"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Details (Category / Cost Center / Description) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{isRTL ? "التصنيف" : "Category"}</Label>
                  <Field
                    as="select"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">{isRTL ? "اختر تصنيف..." : "Select category..."}</option>
                    {categories.map((c) => (
                      <option key={c.nameAr} value={c.name}>
                        {isRTL ? `${c.nameAr}` : `${c.name}`}
                      </option>
                    ))}
                  </Field>
                </div>

                {/* Cost Center */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{isRTL ? "مركز التكلفة" : "Cost Center"}</Label>
                  <AccountGuideDropdown
                    accounts={costCenters}
                    selectedAccountId={values.costCenterId}
                    onSelect={(node) => setFieldValue("costCenterId", node?.id || "")}
                    placeholder={isRTL ? "اختر مركز تكلفة..." : "Select cost center..."}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <Label className="text-sm font-medium">{isRTL ? "الوصف" : "Description"}</Label>
                <Field
                  as="textarea"
                  name="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Attachments Section */}
              <div className="pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">{isRTL ? "المرفقات" : "Attachments"}</h3>
                  <label htmlFor="attachments" className="cursor-pointer text-primary text-sm hover:underline flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    {isRTL ? "إضافة مرفق" : "Add Attachment"}
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, setFieldValue, values.attachments, isRTL)}
                  />
                </div>

                <div className="space-y-3">
                  {/* Server Images */}
                  {location.state?.action == "edit" && serverImages.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {serverImages.map((img: any, idx) => (
                        <div key={idx} className="relative w-16 h-16 flex-shrink-0 group">
                          <img src={img.url} className="w-full h-full object-cover rounded-md border" />
                          <button
                            type="button"
                            onClick={() => setServerImages(serverImages.filter((_, i) => i !== idx))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Attachments */}
                  {values.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {values.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/40 rounded-md text-sm border border-border/50">
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx, values.attachments, setFieldValue)}
                            className="text-muted-foreground hover:text-destructive ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    serverImages.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed border-muted rounded-md bg-muted/10">
                        {isRTL ? "لا توجد مرفقات" : "No attachments"}
                      </div>
                    )
                  )}
                </div>
              </div>
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
