import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, FieldArray, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import { commonApi } from "@/lib/api";
import { Paperclip, Upload, X } from "lucide-react";
import ReliableRichTextEditor from "@/components/editor/ReliableRichTextEditor";
import { MainButtons } from "@/components/common/MainButtons";
import {
  generateNumber,
  generatePassword,
  handleFileUpload,
  removeAttachment,
} from "@/lib/products_function";
import { authApi, authApiMain } from "@/lib/authApi";
import CryptoJS from "crypto-js";
import { loadBranches } from "@/lib/api_function";
import { useSetting } from "@/contexts/SettingContext";

export default function NewUser() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneRegExp = /^[0-9()+\-\s]*$/;

  const { isRTL } = useLanguage();
  const location = useLocation();

  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );

  const [initialValues, setInitialValues] = useState({
    name: "",
    type: "individual",
    elementNumber: generateNumber("USR"),
    code: generateNumber("USR"),
    pass: generatePassword(),
    branchesChoice: [],
    company: "",
    email: "",
    phone: "",
    altPhone: "",
    vatNumber: "",
    taxId: "",
    currency: "",
    creditLimit: "",
    subRole: "Admin",
    address: "",
    city: "",
    state: "",
    postal: "",
    country: "",
    notes: "",
    contacts: [],
    attachments: [],
  });

  const CustomerSchema = Yup.object().shape({
    name: Yup.string().required(isRTL ? "الاسم مطلوب" : "Name is required"),
    //  type: Yup.string().oneOf(["individual", "company"]).required(),
    email: Yup.string()
      .email(isRTL ? "البريد الإلكتروني غير صالح" : "Invalid email")
      .required(isRTL ? "البريد الإلكتروني غير صالح" : "Invalid email"),
    phone: Yup.string().matches(
      phoneRegExp,
      isRTL ? "رقم الهاتف غير صالح" : "Invalid phone number",
    ),
    contacts: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required(
          isRTL ? "اسم جهة الاتصال مطلوب" : "Contact name required",
        ),
        job: Yup.string(),
        email: Yup.string().email(
          isRTL ? "البريد الإلكتروني غير صالح" : "Invalid email",
        ),
        phone: Yup.string().matches(
          phoneRegExp,
          isRTL ? "رقم الهاتف غير صالح" : "Invalid phone number",
        ),
      }),
    ),
  });

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    loadBranches(setBranches);
  }, []);
  const { settings, refreshSettings } = useSetting();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
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

          attachments: [],
        };

        if (location.state?.action == "edit") {
          var x = {
            name: submitData.name,
            email: submitData.email,
            phone: submitData.phone,
            main: JSON.stringify({ ...submitData, pass: "" }),
            updatedAt: new Date().toISOString(),
            elementNumber: submitData.name,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            // status:"Active",
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          };

          var y =
            submitData?.pass?.trim()?.length > 3
              ? { ...x, password: submitData.pass }
              : x;

          if (submitData.email !== location.state?.newData.email) {
            var result = await authApiMain.getAllWithoutRole(
              1,
              1,
              [
                {
                  field: "email",
                  operator: "=",
                  value: submitData.email,
                  type: "basic",
                  andOr: "and",
                },
              ],
              {
                field: "id",
                direction: "desc",
                type: "basic",
                json_path: "$.elementNumber",
              },
              "users",
            );

            if (result.total > 0) {
              await Swal.fire({
                icon: "error",
                title: isRTL ? "خطأ" : "Error",
                text:
                  //     res.error.message ||
                  isRTL
                    ? "البريد الإلكتروني موجود بالفعل"
                    : "email already exists",
                confirmButtonText: isRTL ? "حسناً" : "OK",
              });

              throw new Error("Email already exists");
            }
          }

          var result4 = await authApiMain.getAllWithoutRole(
            1,
            1,
            [
              {
                field: "email",
                operator: "=",
                value: location.state?.newData.email,
                type: "basic",
                andOr: "and",
              },
            ],
            {
              field: "id",
              direction: "desc",
              type: "basic",
              json_path: "$.elementNumber",
            },
            "users",
          );

          var result3 = await authApiMain.update(result4.data[0].id, y);
          var result2 = await authApi.update(location.state?.newData.id, y);
        } else {
          const bytes = CryptoJS.AES.decrypt(
            localStorage.getItem("other"),
            import.meta.env.VITE_SECRET,
          );
          const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          console.log("decrypted", decrypted);

          var obj = {
            role: "Editor",
            invoiceID: decrypted,
            name: submitData.name,
            email: submitData.email,
            phone: submitData.phone,
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

            password: submitData.pass,
            status: "Active",
            main: JSON.stringify({ ...submitData, pass: "" }),
            issueDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            elementNumber: submitData.name,
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          };

          try {
            var res2 = await authApiMain.register(obj, isRTL);
            console.log("res2", res2);
            if (res2?.status !== 200) {
              throw new Error("Registration failed");
            }
            var res3 = await authApi.register(obj, isRTL);
            console.log(res3);
          } catch (error) {
            console.error("Error during user creation:", error);
            throw error;
          }
        }

        // var result6 = await commonApi.update(
        //   location.state?.newData.id,
        //   {
        //     main: JSON.stringify(values),

        //   },
        //   "branches",
        // );

        await Swal.fire({
          icon: "success",
          title:
            location.state?.action == "edit"
              ? isRTL
                ? "تم حفظ المستخدم بنجاح"
                : "User has been saved"
              : isRTL
                ? "تم إنشاء المستخدم"
                : "User created",
          text:
            location.state?.action == "edit"
              ? isRTL
                ? "تم حفظ المستخدم "
                : "User has been saved"
              : isRTL
                ? "تم إنشاء المستخدم "
                : "User has been created",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/users/management");
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
      //   resetForm();
    }
  };

  return (
    <div className="max-w- mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
                ...JSON.parse(location.state?.newData.main),
                // elementNumber: generateNumber("USR"),
              }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : initialValues
        }
        validationSchema={CustomerSchema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, handleChange, handleBlur, setFieldValue }) => (
          <Form className="space-y-6">
            <motion.div
              // initial={{ opacity: 0, y: -8 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse   mt-12 sm:mt-0">
                <BackButton />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {location.state?.action == "edit"
                      ? isRTL
                        ? "تعديل المستخدم"
                        : "Edit User"
                      : isRTL
                        ? "إضافة مستخدم جديد"
                        : "Create New User"}
                  </h1>

                  <p className="text-muted-foreground mt-1">
                    {isRTL
                      ? "أدخل تفاصيل المستخدم بالكامل، يمكنك إضافة جهات اتصال متعددة ومعلومات ضريبية وملاحظات"
                      : "Enter full user details, add multiple contacts, tax info and notes."}
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

              {/* <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            {isRTL ? "عودة" : "Back"}
          </Button>
          <Button
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {isRTL ? "نهاية الصفحة" : "Top"}
          </Button>
        </div> */}
            </motion.div>

            <Card className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{isRTL ? "معرف المستخدم" : "User ID"}</Label>
                  <Input
                    disabled
                    name="code"
                    value={values?.code}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="code"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "الاسم الكامل" : "Full Name"}</Label>
                  <Input
                    name="name"
                    value={values?.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-destructive text-sm"
                  />
                  {/* {errors.name && touched.name && (
                    <div className="text-destructive text-sm mt-1">
                      {typeof errors.name === "string" ? errors.name : null}
                    </div>
                  )} */}
                </div>

                <div>
                  <Label>{isRTL ? "دور المستخدم" : "User Role"}</Label>
                  <select
                    name="subRole"
                    value={values?.subRole}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="select">{isRTL ? "اختر" : "Select"}</option>

                    {settings?.roles?.map((c) => (
                      <option key={c.name} value={c.name}>
                        {isRTL ? `${c.nameAr}` : `${c.name}`}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage
                    name="subRole"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "نوع المستخدم" : "User Type"}</Label>
                  <select
                    name="type"
                    value={values?.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="individual">
                      {isRTL ? "فرد" : "Individual"}
                    </option>
                    <option value="company">
                      {isRTL ? "شركة" : "Company"}
                    </option>
                  </select>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>
                    {isRTL ? "الشركة (إذا وجدت)" : "Company (optional)"}
                  </Label>
                  <Input
                    name="company"
                    value={values?.company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="company"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                  <Input
                    name="email"
                    value={values?.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "الهاتف" : "Phone"}</Label>
                  <Input
                    name="phone"
                    value={values?.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "كلمة المرور" : "Password"}</Label>
                  {location.state?.action == "edit" && (
                    <Label className="mx-2  text-xs font-light text-destructive">
                      {isRTL
                        ? "(اتركها فارغه لكي لا تتغيير كلمة المرور)"
                        : "(Leave it blank to keep the password unchanged)"}
                    </Label>
                  )}
                  <Input
                    name="pass"
                    value={values.pass}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="pass"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                {/* <div>
                  <Label>{isRTL ? "هاتف بديل" : "Alt. Phone"}</Label>
                  <Input
                    name="altPhone"
                    value={values?.altPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="altPhone"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div> */}

                <div>
                  <Label>
                    {isRTL ? "الرقم الضريبي / VAT" : "VAT / Tax Number"}
                  </Label>
                  <Input
                    name="vatNumber"
                    value={values?.vatNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="vatNumber"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label>{isRTL ? "العنوان" : "Address"}</Label>
                <Textarea
                  name="address"
                  value={values?.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />{" "}
                <ErrorMessage
                  name="address"
                  component="div"
                  className="text-destructive text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <Label>{isRTL ? "المدينة" : "City"}</Label>
                  <Input
                    name="city"
                    value={values?.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "المنطقة/المحافظة" : "State"}</Label>
                  <Input
                    name="state"
                    value={values?.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="state"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "الرمز البريدي" : "Postal Code"}</Label>
                  <Input
                    name="postal"
                    value={values?.postal}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="postal"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "الدولة" : "Country"}</Label>
                  <Input
                    name="country"
                    value={values?.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
              </div>

              {/* <div className="mt-4">
                <Label> {isRTL ? "اختر الفروع" : "Select branches"} </Label>

                <MultiSelect
                  list={branches}
                  selectedList={values.branchesChoice}
                  setFieldValue={setFieldValue}
                  fieldName="branchesChoice"
                />

                <ErrorMessage
                  name="branchesChoice"
                  component="div"
                  className="text-destructive text-sm"
                />
              </div> */}

              <div className="space-y- mt-6">
                <div className="flex items-center justify-between">
                  <Label>{isRTL ? "جهات الاتصال" : "Contacts"}</Label>
                  <span className="text-sm text-muted-foreground">
                    {isRTL
                      ? "يمكنك إضافة عدة جهات اتصال"
                      : "You can add multiple contacts"}
                  </span>
                </div>

                <FieldArray name="contacts">
                  {({ remove, push }) => (
                    <div className="space-y-3">
                      {values?.contacts &&
                        values?.contacts?.length > 0 &&
                        values?.contacts?.map((c, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-muted/5 rounded-md grid grid-cols-1 md:grid-cols-4 gap-3 items-"
                          >
                            <div>
                              <Label>{isRTL ? "الاسم" : "Name"}</Label>
                              <Input
                                name={`contacts.${index}.name`}
                                value={c.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />{" "}
                              <ErrorMessage
                                name={`contacts.${index}.name`}
                                component="div"
                                className="text-destructive text-sm"
                              />
                            </div>
                            <div>
                              <Label>{isRTL ? "الوظيفة" : "Job"}</Label>
                              <Input
                                name={`contacts.${index}.job`}
                                value={c.job}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />{" "}
                              <ErrorMessage
                                name={`contacts.${index}.job`}
                                component="div"
                                className="text-destructive text-sm"
                              />
                            </div>
                            <div>
                              <Label>
                                {isRTL ? "البريد الإلكتروني" : "Email"}
                              </Label>
                              <Input
                                name={`contacts.${index}.email`}
                                value={c.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />{" "}
                              <ErrorMessage
                                name={`contacts.${index}.email`}
                                component="div"
                                className="text-destructive text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label>{isRTL ? "الهاتف" : "Phone"}</Label>
                                <Input
                                  name={`contacts.${index}.phone`}
                                  value={c.phone}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />{" "}
                                <ErrorMessage
                                  name={`contacts.${index}.phone`}
                                  component="div"
                                  className="text-destructive text-sm"
                                />
                              </div>
                              <div className="flex items- justify- gap-2 flex- mt-6">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  type="button"
                                >
                                  <X className="w-4 h-4" />

                                  {/* {isRTL ? "حذف" : "Remove"} */}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            push({ name: "", job: "", email: "", phone: "" })
                          }
                        >
                          {isRTL ? "إضافة جهة اتصال" : "Add Contact"}
                        </Button>
                      </div>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Notes with Rich Text Editor */}
              <div
                className="bg-card  border- rounded-xl p-2 animate-slide-in-up mt-4"
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
                      value={values?.notes ?? ""}
                      onChange={(value) => setFieldValue("notes", value)}
                      placeholder={
                        isRTL ? "ملاحظات إضافية" : "Additional notes"
                      }
                      height="150px"
                      isRTL={isRTL}
                    />
                  </div>
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
                        {serverImages?.map((f: any) => {
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

                  {values?.attachments?.length > 0 && (
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
              {/* <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isRTL ? "حفظ المستخدم" : "Save User"}{" "}
                  {isSubmitting && (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => navigate("/customers/management")}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
              </div> */}
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
