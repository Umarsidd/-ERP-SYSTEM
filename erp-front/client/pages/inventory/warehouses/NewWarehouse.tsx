import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  productStatuses,
  roleWithdrawDepositList,
  warehouseStatuses,
  withdrawDepositList,
} from "@/data/data";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainButtons } from "@/components/common/MainButtons";
import { BackButton } from "@/components/common/BackButton";
import { generateNumber } from "@/lib/products_function";
import MultiSelect from "@/components/ui/MultiSelect";
import { loadBranches, loadCustomers } from "@/lib/api_function";

export default function NewWarehouse() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRTL } = useLanguage();
  const location = useLocation();
  const [initialValues, setInitialValues] = useState({
    name: "",
    code: generateNumber("WHS"),
    address: "",
    country: "",
    state: "",
    city: "",
    manager: "",
    capacity: "",
    status: "Active",
    deposit: "",
    depositChoice: [],
    usersIDS: [],
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    code: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    address: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    // country: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    // state: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    //  city: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    // manager: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    capacity: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    status: Yup.string().required(isRTL ? "مطلوب" : "Required"),
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
            elementNumber: submitData.name,
            //    totalAmount: submitData.sellingPrice,
            status: submitData.status,
            code: submitData.code,
            //    attachments: JSON.stringify({ images: res }),
          },
          "inventory_warehouse",
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
            main: JSON.stringify(submitData),
            elementNumber: submitData.name,
            code: submitData.code,
            //  totalAmount: submitData.sellingPrice,
            status: submitData.status,
            // attachments: JSON.stringify({ images: res }),
          },
          "inventory_warehouse",
        );
      }

      await Swal.fire({
        icon: "success",
        title:
          location.state?.action == "edit"
            ? isRTL
              ? "تم حفظ المستودع بنجاح"
              : "Warehouse has been saved"
            : isRTL
              ? "تم إنشاء المستودع"
              : "Warehouse created",
        text:
          location.state?.action == "edit"
            ? isRTL
              ? "تم حفظ المستودع "
              : "Warehouse has been saved"
            : isRTL
              ? "تم إنشاء المستودع "
              : "Warehouse has been created",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/inventory/warehouses");
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
      //   resetForm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                code: generateNumber("WHS"),
              }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : initialValues
        }
        validationSchema={schema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form className="space-y-4">
            <motion.div
              // initial={{ opacity: 0, y: -8 }}
              // animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4  mt-12 sm:mt-0">
                <BackButton />
                <div>
                  <h1 className="text-2xl font-bold">
                    {isRTL ? " إضافة / تحرير مستودع " : "Create Warehouse"}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {isRTL
                      ? "قم بإنشاء مستودع جديد لإدارة مخزونك."
                      : "Create a new warehouse to manage your inventory."}
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
              />
            </motion.div>

            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{isRTL ? "اسم المستودع" : "Name"}</Label>
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "الرمز" : "Code"}</Label>
                  <Input
                    name="code"
                    value={values.code}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="code"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "المدير" : "Manager"}</Label>
                  <Input
                    name="manager"
                    value={values.manager}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="manager"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  {" "}
                  <Label>{isRTL ? "العنوان" : "Address"}</Label>
                  <Input
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "حالة المنتج" : "Product Status"}</Label>
                  <Field
                    as="select"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {warehouseStatuses.map((option) => (
                      <option key={option.value} value={option.value}>
                        {isRTL ? option.labelAr : option.label}{" "}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "البلد" : "Country"}</Label>
                  <Input
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                {/* <div>
                  <Label>{isRTL ? "البلد" : "Country"}</Label>
                  <select
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {Object.values(COUNTRY_MAP).map((c: any) => (
                      <option key={c.code} value={c.code}>
                        {isRTL ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div>
                  <Label>{isRTL ? "المحافظة" : "State"}</Label>
                  <Input
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="state"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "المدينة" : "City"}</Label>
                  <Input
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "السعة" : "Capacity"}</Label>
                  <Input
                    type="number"
                    name="capacity"
                    value={values.capacity}
                    onChange={handleChange}
                  />{" "}
                  <ErrorMessage
                    name="capacity"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
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
                </div>{" "}
              </div>

              {/* <div className="flex items-center gap-3">
                <Button disabled={isSubmitting} type="submit">
                  {isRTL ? "حفظ" : "Save"}{" "}
                  {isSubmitting && (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => navigate("/inventory/warehouses")}
                >
                  {isRTL ? "إلغاء" : "Cancel"}{" "}
                </Button>
              </div> */}
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
