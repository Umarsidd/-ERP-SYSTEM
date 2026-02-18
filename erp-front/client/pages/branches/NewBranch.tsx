import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import { commonApi } from "@/lib/api";
import ReliableRichTextEditor from "@/components/editor/ReliableRichTextEditor";
import { MainButtons } from "@/components/common/MainButtons";
import { generateNumber } from "@/lib/products_function";
import CryptoJS from "crypto-js";
import MultiSelect from "@/components/ui/MultiSelect";
import { loadCustomers } from "@/lib/api_function";

export default function NewBranch() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneRegExp = /^[0-9()+\-\s]*$/;

  const { isRTL } = useLanguage();
  const location = useLocation();

  const [initialValues, setInitialValues] = useState({
    name: "",
    elementNumber: generateNumber("BRN"),
    code: generateNumber("BRN"),
    email: "",
    phone: "",
    altPhone: "",
    vatNumber: "",
    usersIDS: [],
    //  taxId: "",
    //  currency: "",
    // creditLimit: "",
    address: "",
    city: "",
    state: "",
    postal: "",
    country: "",
    notes: "",
    // attachments: [],
  });

  const CustomerSchema = Yup.object().shape({
    name: Yup.string().required(isRTL ? "الاسم مطلوب" : "Name is required"),
  });

    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [addQuery, setAddQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

  
    useEffect(() => {
      loadCustomers(addQuery, setIsLoading, setCustomers, "Editor");
    }, [searchTerm]);



  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (location.state?.action == "edit") {
        var x = {
          main: JSON.stringify(values),
          updatedAt: new Date().toISOString(),
          elementNumber: values.name,
          email: values.email,
          phone: values.phone,
          name: values.name,

          updatedBy: JSON.stringify(
            JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user,
          ),
          // status: "Active",
        };
        var result2 = await commonApi.update(
          location.state?.newData.id,
          x,
          "branches",
        );
      } else {
        await commonApi.create(
          {
            main: JSON.stringify(values),
            updatedAt: new Date().toISOString(),
            elementNumber: values.name,
            email: values.email,
            phone: values.phone,
            name: values.name,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            status: "Active",
          },
          "branches",
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
        // timer: 2000,
        showConfirmButton: false,
      });

      navigate("/branches/management");
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
                        ? "تعديل الفرع"
                        : "Edit Branch"
                      : isRTL
                        ? "إضافة فرع جديد"
                        : "Create New Branch"}
                  </h1>

                  <p className="text-muted-foreground mt-1">
                    {isRTL
                      ? "أدخل تفاصيل الفرع بالكامل، يمكنك إضافة معلومات ضريبية وملاحظات"
                      : "Enter full branch details, add tax info and notes."}
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
                  <Label>{isRTL ? "معرف الفرع" : "Branch ID"}</Label>
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
                  <Label>{isRTL ? "الاسم" : "Name"}</Label>
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
                </div>

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

                <div className="mt-4">
                  <Label> {isRTL ? "اختر مستخدمين" : "Select Users"} </Label>

                  <MultiSelect
                    list={customers}
                    selectedList={values.usersIDS}
                    setFieldValue={setFieldValue}
                    fieldName="usersIDS"
                  />

                  <ErrorMessage
                    name="usersIDS"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
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
                    {/* <label className="text-sm font-medium text-foreground mb-2 block">
                      {isRTL ? "ملاحظات" : "Notes"}
                    </label> */}
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
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
