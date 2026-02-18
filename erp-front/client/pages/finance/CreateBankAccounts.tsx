import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage, Field, FieldArray } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import {
  activeList,
  bankTypes,
  roleWithdrawDepositList,
  withdrawDepositList,
} from "@/data/data";
import { MainButtons } from "@/components/common/MainButtons";
import { generateNumber } from "@/lib/products_function";
import MultiSelect from "@/components/ui/MultiSelect";
import { loadBranches, loadCustomers } from "@/lib/api_function";

export default function CreateBankAccounts() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRTL } = useLanguage();
  const location = useLocation();

  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("SAF"),
    issueDate: new Date().toISOString().split("T")[0],
    description: "",
    deposit: "",
    depositChoice: [],
    usersIDS: [],

    // withdraw: "",
    // withdrawChoice: [],
    type: "Safe",
    name: "",
    accountNumber: "",
    currency: "IQD",
    status: "Active",
    openingBalance: 0,
    currentBalance: 0,
  });

  const schema = Yup.object().shape({
    // type: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    name: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    //  accountNumber: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    //  currency: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    //  status: Yup.string().required(isRTL ? "مطلوب" : "Required"),
  });

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    loadBranches(setBranches);
    loadCustomers(addQuery, setIsLoading, setCustomers, "Editor");
  }, [searchTerm]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...values,
        attachments: [],
      };

      if (location.state?.action == "edit") {
        await commonApi.update(
          location.state?.newData.id,
          {
            issueDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            status: submitData.status,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            accountNumber: submitData.accountNumber,
            name: submitData.name,
            type: submitData.type,
            // withdrawChoice: submitData.withdrawChoice,
            // withdraw: submitData.withdraw,
            depositChoice: JSON.stringify(submitData.depositChoice),
            deposit: submitData.deposit,
            description: submitData.description,
            // openingBalance: submitData.openingBalance,
            // currentBalance: submitData.currentBalance,
            totalAmount: submitData.currentBalance,
          },
          "bank_accounts",
        );
      } else {
        await commonApi.create(
          {
            createdAt: new Date().toISOString(),
            issueDate: new Date().toISOString(),
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

            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            status: submitData.status,
            accountNumber: submitData.accountNumber,
            name: submitData.name,
            type: submitData.type,
            // withdrawChoice: submitData.withdrawChoice,
            // withdraw: submitData.withdraw,
            depositChoice: JSON.stringify(submitData.depositChoice),
            deposit: submitData.deposit,
            description: submitData.description,
            // openingBalance: submitData.openingBalance,
            // currentBalance: submitData.currentBalance,
            totalAmount: submitData.currentBalance,
          },
          "bank_accounts",
        );
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
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/finance/bank-accounts");
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
          location.state?.action == "copy"
            ? {
              ...JSON.parse(location.state?.newData.main),
              elementNumber: generateNumber("SAF"),
            }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : initialValues
        }
        validationSchema={schema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, handleChange, handleBlur, setFieldValue }) => (
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
                      ? "إضافة / تحرير الخزائن والحسابات البنكية"
                      : "Add / Edit Safe And Bank Accounts"}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {isRTL
                      ? "قم بإضافة حساب بنكي جديد أو تحرير حساب موجود."
                      : "Add a new bank account or edit an existing one."}
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

            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>{isRTL ? "النوع" : "Type"}</Label>
                  <Field
                    as="select"
                    name="type"
                    id="type"
                    className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {bankTypes.map((c) => (
                      <option key={c.nameAr} value={c.name}>
                        {isRTL ? `${c.nameAr}` : `${c.name}`}
                      </option>
                    ))}
                  </Field>

                  <ErrorMessage
                    name="type"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "الاسم " : " Name"}</Label>

                  <Field
                    //  placeholder={isRTL ? "SAF-2024-0001" : "SAF-2024-0001"}

                    name="name"
                    //   type="date"
                    className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />

                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                {/* <div>
                  <Label> {isRTL ? " اسم البنك" : "Bank Name"}</Label>

                  <Field
                    //  placeholder={isRTL ? "SAF-2024-0001" : "SAF-2024-0001"}

                    name="bankName"
                    //   type="date"
                    className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />

                  <ErrorMessage
                    name="bankName"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div> */}

                {values.type === "Bank" && (
                  <div>
                    <Label> {isRTL ? "رقم الحساب" : "Account Number"}</Label>

                    <Field
                      //  placeholder={isRTL ? "SAF-2024-0001" : "SAF-2024-0001"}

                      name="accountNumber"
                      //   type="date"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />

                    <ErrorMessage
                      name="accountNumber"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                )}

                {/* {values.type === "Bank" && (
                  <div>
                    <Label>{isRTL ? "العملة" : "Currency"}</Label>
                    <Field
                      as="select"
                      name="currency"
                      id="currency"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
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
                )} */}

                <div>
                  <Label> {isRTL ? " الحالة" : "Status"}</Label>

                  <Field
                    as="select"
                    name="status"
                    id="status"
                    className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {activeList.map((c) => (
                      <option key={c.name} value={c.name}>
                        {isRTL ? `${c.nameAr}` : `${c.name}`}
                      </option>
                    ))}
                  </Field>

                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                {/* Opening Balance Field - Only for new accounts */}
                {location.state?.action !== "edit" && (
                  <div>
                    <Label>{isRTL ? "الرصيد الافتتاحي" : "Opening Balance"}</Label>
                    <Input
                      type="number"
                      name="openingBalance"
                      value={values.openingBalance}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFieldValue("openingBalance", value);
                        setFieldValue("currentBalance", value);
                      }}
                      onBlur={handleBlur}
                      placeholder={isRTL ? "أدخل الرصيد الافتتاحي" : "Enter opening balance"}
                      className="w-full"
                    />
                    <ErrorMessage
                      name="openingBalance"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label>{isRTL ? "الوصف" : "Description"}</Label>
                <Textarea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />{" "}
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-destructive text-sm"
                />
              </div>
              <div
                className="bg-card border border-border rounded-xl mt-4 p-6 animate-slide-in-up"
                style={{ animationDelay: "500ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "الصلاحيات" : "Permissions"}
                </h2>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                  <div>
                    <Label>
                      {" "}
                      {
                        isRTL ? "النوع" : "type"

                        //" إيداع" : "Deposit"
                      }
                    </Label>

                    <Field
                      onChange={(e) => {
                        setFieldValue("deposit", e.target.value);
                        setFieldValue("depositChoice", []);
                        setFieldValue("usersIDS", []);
                      }}
                      value={values.deposit}
                      as="select"
                      name="deposit"
                      id="deposit"
                      className="w-full px-2 py-1 mt-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {withdrawDepositList.map((c) => (
                        <option key={c.name} value={c.name}>
                          {isRTL ? `${c.nameAr}` : `${c.name}`}
                        </option>
                      ))}
                    </Field>

                    <ErrorMessage
                      name="deposit"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                  {values.deposit === "Specific Employee" && (
                    <div>
                      <Label> {isRTL ? "اختر" : "Select"} </Label>

                      <MultiSelect
                        list={customers}
                        selectedList={values.depositChoice}
                        setFieldValue={setFieldValue}
                        fieldName="depositChoice"
                        fieldName2="usersIDS"
                      />

                      <ErrorMessage
                        name="depositChoice"
                        component="div"
                        className="text-destructive text-sm"
                      />
                    </div>
                  )}

                  {values.deposit === "Specific Branch" && (
                    <div>
                      <Label> {isRTL ? "اختر" : "Select"} </Label>

                      <MultiSelect
                        list={branches}
                        selectedList={values.depositChoice}
                        setFieldValue={setFieldValue}
                        fieldName="depositChoice"
                        fieldName2="usersIDS"
                        type="branches"
                      />

                      <ErrorMessage
                        name="depositChoice"
                        component="div"
                        className="text-destructive text-sm"
                      />
                    </div>
                  )}

                  {values.deposit === "Specific Role" && (
                    <div>
                      <Label> {isRTL ? "اختر" : "Select"} </Label>

                      <MultiSelect
                        list={roleWithdrawDepositList}
                        selectedList={values.depositChoice}
                        setFieldValue={setFieldValue}
                        fieldName="depositChoice"
                        fieldName2="usersIDS"
                      />

                      <ErrorMessage
                        name="depositChoice"
                        component="div"
                        className="text-destructive text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                  <div>
                    <Label> {isRTL ? " سحب" : "Withdraw"} </Label>

                    <Field
                      onChange={(e) => {
                        setFieldValue("withdraw", e.target.value);
                        setFieldValue("withdrawChoice", []);
                      }}
                      value={values.withdraw}
                      as="select"
                      name="withdraw"
                      id="withdraw"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      {withdrawDepositList.map((c) => (
                        <option key={c.name} value={c.name}>
                          {isRTL ? `${c.nameAr}` : `${c.name}`}
                        </option>
                      ))}
                    </Field>

                    <ErrorMessage
                      name="withdraw"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>

                  {values.withdraw === "Specific Employee" && (
                    <div>
                      <Label> {isRTL ? "اختر" : "Select"} </Label>

                      <MultiSelect
                        list={customers}
                        selectedList={values.withdrawChoice}
                        setFieldValue={setFieldValue}
                        fieldName="withdrawChoice"
                      />

                    
                      <Field
                        //     onChange={(e) => {
                        //       setFieldValue("customerId", e.target.value);

                        // //      console.log("customerId", values.customerId);
                        //     }}
                        as="select"
                        value={values.withdrawChoice}
                        name="withdrawChoice"
                        id="withdrawChoice"
                        className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isRTL ? `${c.name}` : `${c.name}`}
                          </option>
                        ))}
                      </Field>

                      <ErrorMessage
                        name="withdrawChoice"
                        component="div"
                        className="text-destructive text-sm"
                      />
                    </div>
                  )}

                  {values.withdraw === "Specific Role" && (
                    <div>
                      <Label> {isRTL ? "اختر" : "Select"} </Label>
                      <MultiSelect
                        list={roleWithdrawDepositList}
                        selectedList={values.withdrawChoice}
                        setFieldValue={setFieldValue}
                        fieldName="withdrawChoice"
                      />
                      <Field
                        as="select"
                        multiple
                        name="withdrawChoice"
                        id="withdrawChoice"
                        className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        {roleWithdrawDepositList.map((c) => (
                          <option key={c.name} value={c.name}>
                            {isRTL ? `${c.nameAr}` : `${c.name}`}
                          </option>
                        ))}
                      </Field> 
                      <ErrorMessage
                        name="withdrawChoice"
                        component="div"
                        className="text-destructive text-sm"
                      /> 
                    </div>
                  )}
                </div> */}
              </div>
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
