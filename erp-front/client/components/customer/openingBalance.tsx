import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import CryptoJS from "crypto-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send } from "lucide-react";
import { authApi } from "@/lib/authApi";

export function OpeningBalance(props: {
  isDialog: boolean;
  setShowAddModal: any;
  data: any;
  id: any;
}) {
  const { isDialog, setShowAddModal, data, id } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isRTL } = useLanguage();
  const location = useLocation();

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const metaRaw = data?.meta;
      if (!metaRaw) return; // أو تعامل مع الحالة الفارغة

      const parsed =
        typeof metaRaw === "string" ? JSON.parse(metaRaw) : metaRaw;
      // احمِ parsed.data
      parsed.data = parsed.data || [];

      parsed.data.forEach((e) => {
        if (e.invoiceID === values.code) {
          e.totalAmount = values.openingBalance;
        }
      });

      await authApi.update(id, {
        main: JSON.stringify({
          ...JSON.parse(data.main),
          openingBalance: values.openingBalance,
        }),

        meta: JSON.stringify(parsed),

        updatedAt: new Date().toISOString(),
        updatedBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
      });

      await Swal.fire({
        icon: "success",
        title: isRTL
          ? "تم حفظ الرصيد الافتتاحي بنجاح"
          : "Opening Balance Saved Successfully",

        text: isRTL ? "تم حفظ الرصيد الافتتاحي" : "Opening Balance Saved",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowAddModal(false);
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
        initialValues={JSON.parse(data.main)}
        //   validationSchema={CustomerSchema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, handleChange, handleBlur, setFieldValue, submitForm }) => (
          <Form className="space-y-6">
            <Card className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
                <div>
                  <Label className="my-4">
                    {isRTL ? " الرصيد الافتتاحي" : "Opening Balance"}
                  </Label>
                  <Input
                    name="openingBalance"
                    value={values.openingBalance}
                    type="number"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="my-4"
                    // placeholder="0"
                  />{" "}
                  <ErrorMessage
                    name="openingBalance"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
              </div>

              {isDialog && (
                <div className="flex items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => submitForm()}
                    disabled={isSubmitting}
                    className="mx-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4  py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>
                          {location.state?.action == "edit"
                            ? isRTL
                              ? "جاري التعديل..."
                              : "Editing..."
                            : isRTL
                              ? "جاري الإنشاء..."
                              : "Creating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span> {isRTL ? "حفظ" : "Save"}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
}
