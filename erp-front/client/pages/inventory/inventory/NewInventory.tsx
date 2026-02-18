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
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Hash } from "lucide-react";
import ReliableRichTextEditor from "@/components/editor/ReliableRichTextEditor";
import { BackButton } from "@/components/common/BackButton";
import { MainButtons } from "@/components/common/MainButtons";
import { generateNumber } from "@/lib/products_function";

export default function NewInventory() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRTL } = useLanguage();
  const location = useLocation();
  const [initialValues, setInitialValues] = useState({
    elementNumber: generateNumber("INV"),
    issueDate: "",
    warehouse: "",
    notes: "",
  });

  const schema = Yup.object().shape({
    issueDate: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    warehouse: Yup.string().required(isRTL ? "مطلوب" : "Required"),
  });

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
            updatedAt: new Date().toISOString().split("T")[0],
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
            elementNumber: submitData.elementNumber,
            //status: submitData.status,
          },
          "inventory_inventory",
        );
      } else {
        await commonApi.create(
          {
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
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
            elementNumber: submitData.elementNumber,
            status: "Active",
          },
          "inventory_inventory",
        );
      }

      await Swal.fire({
        icon: "success",
        title:
          location.state?.action == "edit"
            ? isRTL
              ? "تم حفظ ورقة الجرد بنجاح"
              : "Inventory has been saved"
            : isRTL
              ? "تم إنشاء ورقة الجرد"
              : "Inventory created",
        text:
          location.state?.action == "edit"
            ? isRTL
              ? "تم حفظ ورقة الجرد "
              : "Inventory has been saved"
            : isRTL
              ? "تم إنشاء ورقة الجرد "
              : "Inventory has been created",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/inventory/inventory");
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
                code: generateNumber("INV"),
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
              <div className="flex items-center space-x-4 rtl:space-x-reverse  mt-12 sm:mt-0">
                <BackButton />
                <div>
                  <h1 className="text-2xl font-bold">
                    {isRTL ? " إضافة / تحرير ورقة الجرد " : "Create Inventory"}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {isRTL
                      ? "قم بإنشاء ورقة جرد جديدة لإدارة مخزونك."
                      : "Create a new inventory to manage your stock."}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? "الجرد الطلب" : "Inventory Number"}
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Field
                      disabled={true}
                      name="elementNumber"
                      className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder={isRTL ? "ORD-2026-0001" : "ORD-2026-0001"}
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
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? "المستودع" : "Warehouse"}
                  </label>
                  <div className="relative">
                    {/* <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                    <Field
                      name="warehouse"
                      // type="date"
                      className="w-full pl-4 rtl:pl-4 rtl:pr-4 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <ErrorMessage
                    name="warehouse"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                {/* <div>
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
                </div> */}
              </div>
              {/* Notes with Rich Text Editor */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up  my-5"
                style={{ animationDelay: "500ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {isRTL ? "الملاحظات والشروط" : "Notes & Terms"}
                </h2>

                <label className="text-sm font-medium text-foreground mb-2 block">
                  {isRTL ? "ملاحظات" : "Notes"}
                </label>
                <ReliableRichTextEditor
                  value={values.notes}
                  onChange={(value) => setFieldValue("notes", value)}
                  placeholder={isRTL ? "ملاحظات إضافية" : "Additional notes"}
                  height="150px"
                  isRTL={isRTL}
                />
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
                  onClick={() => navigate("/inventory/inventory")}
                >
                  {isRTL ? "إلغاء" : "Cancel"}{" "}
                </Button>
              </div>{" "} */}
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
