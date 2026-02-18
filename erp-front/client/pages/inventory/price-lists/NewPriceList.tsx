import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import { productStatuses } from "@/data/data";
import { MainButtons } from "@/components/common/MainButtons";
import { generateNumber } from "@/lib/products_function";

export default function NewPriceList() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRTL } = useLanguage();
  const location = useLocation();
  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("PL"),
    name: "",
    status: "Active",
    items: [],
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(isRTL ? "مطلوب" : "Required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (location.state?.action == "edit") {
        await commonApi.update(
          location.state?.newData.id,
          {
            updatedAt: new Date().toISOString().split("T")[0],
            issueDate: new Date().toISOString().split("T")[0],
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            elementNumber: values.elementNumber,
            status: values.status,
            name: values.name,
          },
          "inventory_price_lists",
        );
      } else {
        await commonApi.create(
          {
            createdAt: new Date().toISOString().split("T")[0],
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
            updatedAt: new Date().toISOString().split("T")[0],
            issueDate: new Date().toISOString().split("T")[0],
            name: values.name,
            items: JSON.stringify({ items: values.items }),

            elementNumber: values.elementNumber,
            status: values.status,
          },
          "inventory_price_lists",
        );
      }

      await Swal.fire({
        icon: "success",
        title:
          location.state?.action == "edit"
            ? isRTL
              ? "تم حفظ القائمة بنجاح"
              : "Price list has been saved"
            : isRTL
              ? "تم إنشاء القائمة"
              : "Price list created",
        text:
          location.state?.action == "edit"
            ? isRTL
              ? "تم حفظ القائمة "
              : "Price list has been saved"
            : isRTL
              ? "تم إنشاء القائمة بنجاح"
              : "Price list has been created",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/inventory/price-lists");
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
                elementNumber: generateNumber("PL"),
                name: location.state?.newData.name,
                status: location.state?.newData.status,
                items: location.state?.newData?.items?.items || [],
              }
            : location.state?.action == "edit"
              ? {
                  elementNumber: location.state?.newData.elementNumber,
                  name: location.state?.newData.name,
                  status: location.state?.newData.status,
                }
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
              <div className="flex items-center space-x-4 rtl:space-x-reverse  mt-12 sm:mt-0">
                <BackButton />
                <div>
                  <h1 className="text-2xl font-bold">
                    {" "}
                    {isRTL
                      ? "إضافة / تحرير قائمة الأسعار"
                      : "Add / Edit Price List"}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {isRTL
                      ? "قم بإضافة قائمة أسعار جديدة أو تعديل قائمة موجودة."
                      : "Add a new price list or edit an existing one."}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? "اسم القائمة" : "Price list Name"}</Label>
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                <div>
                  <Label>{isRTL ? "حالة القائمة" : "Price list Status"}</Label>
                  <Field
                    as="select"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {productStatuses.map((option) => (
                      <option key={option.value} value={option.value}>
                        {isRTL ? option.labelAr : option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-destructive text-sm"
                  />
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
                  onClick={() => navigate(-1)}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
              </div>{" "} */}
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
