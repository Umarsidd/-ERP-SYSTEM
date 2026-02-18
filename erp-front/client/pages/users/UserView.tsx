import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import { Copy, Edit, Printer, Trash2 } from "lucide-react";
import { handleCopy, handleEdit } from "@/lib/function";
import { authApi } from "@/lib/authApi";
import CryptoJS from "crypto-js";

export default function UserView() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [customer, setCustomer] = useState(location.state?.viewFrom);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          {isRTL ? "المستخدم غير موجود" : "User Not Found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? "عرض المستخدم" : "User Details"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL
                ? "تفاصيل المستخدم ومعلومات الاتصال"
                : "User full details and contact information"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {(JSON.parse(localStorage.getItem("subRole") || "null") as any)?.Users
            ?.editAndDeleteUser !== false && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
                onClick={async () => {
                  setIsSubmitting(true);
                  var res = await authApi.delete(
                    isRTL ? "حذف" : "Delete",
                    isRTL
                      ? `هل أنت متأكد من حذف ${customer.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${customer.elementNumber}? This action cannot be undone.`,
                    customer.id,
                    isRTL,
                  );

                  console.log("res", res);
                  if (res) {
                    navigate("/users/management");
                  }
                }}
              >
                {isSubmitting && (
                  <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
                )}

                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {isRTL ? "حذف" : "Delete"}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(customer, navigate, `/users/edit`)}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isRTL ? "تحرير" : "Edit"}
                </span>
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <Card className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "الاسم" : "Name"}
              </div>
              <div className="font-medium">{customer.name}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "الشركة" : "Company"}
              </div>
              <div className="font-medium">
                {" "}
                {JSON.parse(customer.main)?.company ||
                  (isRTL ? "فرد" : "Individual")}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "الهاتف" : "Phone"}
              </div>
              <div className="font-medium">{customer.phone}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "البريد الإلكتروني" : "Email"}
              </div>
              <div className="font-medium">{customer.email}</div>
            </div>
            {/* <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "العملة" : "Currency"}
                  </div>
                  <div className="font-medium">
                    {JSON.parse(customer.main)?.currency}
                  </div>
                </div> */}
            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "القيمة الضريبية" : "VAT Number"}
              </div>
              <div className="font-medium">
                {JSON.parse(customer.main)?.vatNumber || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "العنوان" : "Address"}
              </div>
              <div className="font-medium">
                {JSON.parse(customer.main)?.address}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "الحالة" : "Status"}
              </div>
              <div className="font-medium">{customer.status}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "المدينة" : "City"}
              </div>
              <div className="font-medium">
                {JSON.parse(customer.main)?.city}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "المحافظة" : "State"}
              </div>
              <div className="font-medium">
                {JSON.parse(customer.main)?.state}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                {isRTL ? "البلد" : "Country"}
              </div>
              <div className="font-medium">
                {JSON.parse(customer.main)?.country}
              </div>
            </div>
          </div>

          {JSON.parse(customer.main)?.contacts?.length >= 1 && (
            <div className="mt-8 mb-2">
              <div className="text-xs text-muted-foreground">
                {isRTL ? "جهات الاتصال" : "Contacts"}
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-1">
                {JSON.parse(customer.main)?.contacts.map(
                  (ct, idx) =>
                    ct.name !== "" && (
                      <div key={idx} className="p-3 border m-2  rounded-md">
                        <div className="font-medium">{ct.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ct.job}
                        </div>
                        <div className="text-sm mt-">{ct.phone}</div>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
          {/* 
          {JSON.parse(customer.main)?.branchesChoice?.length >= 1 && (
            <div className="mt-8 mb-2">
              <div className="text-xs text-muted-foreground">
                {isRTL ? "الفروع" : "Branches"}
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-1">
                {JSON.parse(customer.main)?.branchesChoice.map(
                  (ct, idx) =>
                    ct.name !== "" && (
                      <div key={idx} className="p-3 border m-2  rounded-md">
                        <div className="font-medium">{ct.name}</div>
          
                      </div>
                    ),
                )}
              </div>
            </div>
          )} */}
        </motion.div>
      </Card>
    </div>
  );
}
