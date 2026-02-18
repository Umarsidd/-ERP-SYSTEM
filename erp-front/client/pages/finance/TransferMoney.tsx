import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { commonApi } from "@/lib/api";
import Swal from "sweetalert2";
import { Upload } from "lucide-react";
import SingleSelect from "@/components/ui/SingleSelect";
import { currencies } from "@/data/currencies";

interface Safe {
  id: number;
  name: string;
  type: string;
  totalAmount: number;
  currency: string;
  status: string;
}

const TransferMoney = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [safes, setSafes] = useState<Safe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const preselectedFromSafeId = location.state?.fromSafeId;

  // Prepare safe lists for SingleSelect
  const safeOptions = safes.map(safe => ({
    id: safe.id,
    name: safe.name,
    nameAr: safe.name, // Assuming no separate Arabic name for safes
    ...safe
  }));

  // Prepare currency list for SingleSelect
  const currencyOptions = currencies.map((curr: any) => ({
    id: curr.code,
    name: `${curr.code} ${curr.english_name}`,
    nameAr: `${curr.code} ${curr.arabic_name}`,
    ...curr
  }));

  useEffect(() => {
    fetchActiveSafes();
  }, []);

  const fetchActiveSafes = async () => {
    try {
      setIsLoading(true);
      const response = await commonApi.getAll(
        1,
        100,
        [],
        { field: "id", direction: "desc", type: "basic" },
        "bank_accounts"
      );
      // Filter to only active/main safes
      const activeSafes = (response.data || []).filter(
        (safe: any) => safe.status === 'Active' || safe.status === 'Main'
      );
      setSafes(activeSafes);
    } catch (error) {
      console.error("Error fetching safes:", error);
      Swal.fire({
        icon: "error",
        title: isRTL ? "خطأ" : "Error",
        text: isRTL ? "فشل في تحميل الخزائن" : "Failed to load safes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validationSchema = Yup.object().shape({
    fromSafeId: Yup.mixed().required(isRTL ? "يرجى اختيار الخزينة المصدر" : "Please select source treasury"),
    toSafeId: Yup.mixed().required(isRTL ? "يرجى اختيار الخزينة الوجهة" : "Please select destination treasury"),
    amount: Yup.number()
      .required(isRTL ? "يرجى إدخال المبلغ" : "Please enter amount")
      .positive(isRTL ? "المبلغ يجب أن يكون أكبر من صفر" : "Amount must be greater than zero")
      .test(
        "sufficient-balance",
        isRTL ? "الرصيد غير كافي" : "Insufficient balance",
        function (value) {
          const { fromSafeId } = this.parent;
          // When using SingleSelect, fromSafeId is an object
          const safeId = fromSafeId?.id;
          const fromSafe = safes.find((s) => s.id === safeId);
          return fromSafe ? value <= (fromSafe.totalAmount || 0) : true;
        }
      ),
    transferDate: Yup.date().required(
      isRTL ? "يرجى اختيار التاريخ" : "Please select date"
    ),
    notes: Yup.string().max(1000, isRTL ? "الملاحظات طويلة جداً" : "Notes too long"),
  });

  const initialValues = {
    // SingleSelect expects the full object, so we try to find it if preselected
    fromSafeId: safeOptions.find(s => s.name === "Main Treasury") || null, // Default to a safe if needed, or keep null
    toSafeId: null,
    amount: 0,
    transferDate: new Date().toISOString().slice(0, 16),
    notes: "",
    currency: currencyOptions.find(c => c.code === 'INR') || null,
    exchangeCurrency: currencyOptions.find(c => c.code === 'INR') || null,
  };

  // Handle preselection
  const [formInitialValues, setFormInitialValues] = useState(initialValues);

  useEffect(() => {
    if (safes.length > 0 && preselectedFromSafeId) {
      const selected = safeOptions.find(s => s.id === preselectedFromSafeId);
      if (selected) {
        setFormInitialValues(prev => ({ ...prev, fromSafeId: selected as any }));
      }
    }
  }, [safes, preselectedFromSafeId]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    // Check if safes are selected (since SingleSelect values are objects)
    if (!values.fromSafeId?.id || !values.toSafeId?.id) {
      return;
    }

    if (values.fromSafeId.id === values.toSafeId.id) {
      Swal.fire({
        icon: "error",
        title: isRTL ? "خطأ" : "Error",
        text: isRTL ? "لا يمكن التحويل إلى نفس الخزينة" : "Cannot transfer to the same treasury"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fromSafe = safes.find(s => s.id === values.fromSafeId.id);
      const toSafe = safes.find(s => s.id === values.toSafeId.id);
      const amount = parseFloat(values.amount);

      if (!fromSafe || !toSafe) {
        throw new Error("Safe not found");
      }

      // Calculate new balances
      const fromNewBalance = (fromSafe.totalAmount || 0) - amount;
      const toNewBalance = (toSafe.totalAmount || 0) + amount;

      // Update source safe (subtract amount)
      await commonApi.update(
        values.fromSafeId.id,
        {
          totalAmount: fromNewBalance,
          updatedAt: new Date().toISOString(),
        },
        "bank_accounts"
      );

      // Update destination safe (add amount)
      await commonApi.update(
        values.toSafeId.id,
        {
          totalAmount: toNewBalance,
          updatedAt: new Date().toISOString(),
        },
        "bank_accounts"
      );

      await Swal.fire({
        icon: "success",
        title: isRTL ? "نجح التحويل" : "Transfer Successful",
        html: `
          <div class="text-left">
            <p><strong>${isRTL ? "من" : "From"}:</strong> ${fromSafe.name}</p>
            <p><strong>${isRTL ? "إلى" : "To"}:</strong> ${toSafe.name}</p>
            <p><strong>${isRTL ? "المبلغ" : "Amount"}:</strong> ${amount}</p>
          </div>
        `,
        timer: 3000,
        showConfirmButton: true,
      });

      resetForm();
      navigate("/finance/bank-accounts");
    } catch (error: any) {
      console.error("Error during transfer:", error);
      Swal.fire({
        icon: "error",
        title: isRTL ? "فشل التحويل" : "Transfer Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          (isRTL ? "حدث خطأ أثناء التحويل" : "An error occurred during transfer"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <BackButton />

      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, handleChange, handleBlur }) => {
          const fromSafe = values.fromSafeId ? safes.find((s) => s.id === (values.fromSafeId as any).id) : null;
          const toSafe = values.toSafeId ? safes.find((s) => s.id === (values.toSafeId as any).id) : null;
          const amount = parseFloat(values.amount.toString()) || 0;

          const fromBalanceAfter = fromSafe ? (fromSafe.totalAmount || 0) - amount : 0;
          const toBalanceAfter = toSafe ? (toSafe.totalAmount || 0) + amount : 0;

          return (
            <Form className="space-y-4">
              {/* From and To Section - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* From Section */}
                <Card className="p-6 bg-white">
                  <h3 className="text-lg font-semibold mb-4">
                    {isRTL ? "من:" : "From:"}
                  </h3>

                  <div className="space-y-4">
                    {/* Treasury Selector */}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {isRTL ? "الخزينة" : "Treasury"}
                        </Label>
                        <SingleSelect
                          list={safeOptions.filter(s => s.id !== (values.toSafeId as any)?.id)}
                          selectedItem={values.fromSafeId}
                          setFieldValue={setFieldValue}
                          fieldName="fromSafeId"
                          placeholder={isRTL ? "اختر الخزينة" : "Main Treasury"}
                        />
                        {touched.fromSafeId && errors.fromSafeId && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.fromSafeId as string}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount and Balances */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {isRTL ? "المبلغ" : "Amount"}
                        </Label>
                        <Input
                          type="number"
                          name="amount"
                          value={values.amount}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="0.00"
                          className="bg-gray-50 border-gray-300 text-sm"
                          step="0.01"
                        />
                        {touched.amount && errors.amount && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.amount as string}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {isRTL ? "الرصيد قبل" : "Available before"}
                        </Label>
                        <Input
                          type="text"
                          value={(fromSafe?.totalAmount || 0).toFixed(2)}
                          disabled
                          className="bg-gray-100 border-gray-300 text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {isRTL ? "الرصيد بعد" : "Available after"}
                        </Label>
                        <Input
                          type="text"
                          value={fromBalanceAfter.toFixed(2)}
                          disabled
                          className={`border-gray-300 text-sm ${fromBalanceAfter < 0
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100"
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* To Section */}
                <Card className="p-6 bg-white">
                  <h3 className="text-lg font-semibold mb-4">
                    {isRTL ? "إلى:" : "To:"}
                  </h3>

                  <div className="space-y-4">
                    {/* Treasury Selector */}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {isRTL ? "الخزينة" : "Treasury"}
                        </Label>
                        <SingleSelect
                          list={safeOptions.filter(s => s.id !== (values.toSafeId as any)?.id)}
                          selectedItem={values.toSafeId}
                          setFieldValue={setFieldValue}
                          fieldName="toSafeId"
                          placeholder={isRTL ? "اختر الخزينة" : "Choose Treasury"}
                        />
                        {touched.toSafeId && errors.toSafeId && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.toSafeId as string}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Balances */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {isRTL ? "الرصيد قبل" : "Available before"}
                        </Label>
                        <Input
                          type="text"
                          value={(toSafe?.totalAmount || 0).toFixed(2)}
                          disabled
                          className="bg-gray-100 border-gray-300 text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          {isRTL ? "الرصيد بعد" : "Available after"}
                        </Label>
                        <Input
                          type="text"
                          value={toBalanceAfter.toFixed(2)}
                          disabled
                          className="bg-gray-100 border-gray-300 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Transfer Date and Notes Section */}
              <Card className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isRTL ? "تاريخ التحويل" : "Transfer Date"}
                    </Label>
                    <Input
                      type="datetime-local"
                      name="transferDate"
                      value={values.transferDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="bg-gray-50 border-gray-300"
                    />
                    {touched.transferDate && errors.transferDate && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.transferDate as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isRTL ? "الملاحظات" : "Notes"}
                    </Label>
                    <Textarea
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder=""
                      className="bg-gray-50 border-gray-300 min-h-[42px]"
                      rows={1}
                    />
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="mt-6">
                  <Label className="text-sm font-medium mb-2 block">
                    {isRTL ? "المرفقات" : "Attachments"}
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 transition-colors hover:bg-gray-100 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="text-primary font-medium hover:underline">
                        {isRTL ? "إسقاط الملف هنا" : "Drop file here"}
                      </span>
                      {" "}
                      {isRTL ? "أو" : "or"}
                      {" "}
                      <span className="text-blue-600 font-medium hover:underline">
                        {isRTL ? "اختر من جهاز الكمبيوتر" : "select from your computer"}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 h-10"
                >
                  {isSubmitting
                    ? isRTL
                      ? "جاري التحويل..."
                      : "Transferring..."
                    : isRTL
                      ? "تحويل"
                      : "Transfer"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/finance/bank-accounts")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default TransferMoney;
