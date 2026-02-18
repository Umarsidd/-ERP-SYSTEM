import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CryptoJS from "crypto-js";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  RefreshCw,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSetting } from "@/contexts/SettingContext";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import { Loading } from "@/components/common/loading";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import { currencies } from "@/data/currencies";

export default function CurrencyTemplates() {
  const { isRTL } = useLanguage();
  const { settings, refreshSettings, isLoading } = useSetting();
  const [units, setUnits] = useState([]);

  useEffect(() => {
    console.log("Settings changed:", settings?.currency?.list);

    console.log("fixedCurrency", settings?.fixedCurrency);

    if (settings) {
      setUnits(settings?.fixedCurrency ?? []);
    }
  }, [settings]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // currencySystem: "",
    currencyName: JSON.stringify({
      code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
    }),
    currencyValue: 0,
  });

  const handleSave = async () => {
    if (
      (formData.currencyValue &&
        JSON.parse(formData.currencyName).code !==
          localStorage.getItem("selectedCurrency")) ??
      selectedCurrency
    ) {
      if (editingId) {
        setUnits((prev) =>
          prev?.map((u) =>
            u.id === editingId
              ? {
                  ...formData,
                  id: editingId,
                  currencyValue: formData.currencyValue,
                  currencyName: formData.currencyName,

                  createdAt: u.createdAt,
                }
              : u,
          ),
        );
        setEditingId(null);
      } else {
        const newUnit = {
          id: `currency_${Date.now()}`,
          currencyValue: formData.currencyValue,
          currencyName: formData.currencyName,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setUnits((prev) => [...prev, newUnit]);
      }

      settings.currency.list.map((c) => {
        if (JSON.parse(formData.currencyName).code === c.code) {
          c.rate_to_iqd = 1 / formData.currencyValue;
        }
        return c;
      });

      setFormData({
        // currencySystem: "",
        currencyName: JSON.stringify({
          code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          symbol:
            localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
        }),
        currencyValue: 0,
      });
      setShowForm(false);
    }
  };

  const handleEdit = (unit) => {
    setFormData(unit);
    setEditingId(unit.id);
    setShowForm(true);
  };

  const handleDelete = async (unit) => {
    const result = await Swal.fire({
      title: isRTL
        ? "هل أنت متأكد من حذف هذا العنصر؟"
        : "Are you sure you want to delete this item?",
      //  text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isRTL ? "حذف" : "Delete",
      cancelButtonText: isRTL ? "إلغاء" : "Cancel",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      settings.currency.list.map((c) => {
        if (JSON.parse(unit.currencyName).code === c.code) {
          c.rate_to_iqd = JSON.parse(unit.currencyName).rate_to_iqd;
        }
        return c;
      });

      setUnits((prev) => prev.filter((u) => u.id !== unit.id));
    }
  };

  const handleCancel = () => {
    setFormData({
      // currencySystem: "",
      currencyName: JSON.stringify({
        code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
        symbol:
          localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
      }),
      currencyValue: 0,
    });
    setShowForm(false);
    setEditingId(null);
    //  setNewConversion({ unitName: "", value: "" });
  };

  const [saving, setSaving] = useState(false);

  const handleSaveDB = async () => {
    setSaving(true);
    try {
      if (settings != null) {
        await commonApi.update(
          settings.id,
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
            main: JSON.stringify({ ...settings, fixedCurrency: units }),
         
          },
          "setting",
        );
      } else {
        var res = await commonApi.create(
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
            main: JSON.stringify({ ...settings, fixedCurrency: units }),
          },
          "setting",
        );
      }
             Swal.fire({
              icon: "success",
              title: isRTL ? "تم الحفظ بنجاح" : "Settings have been saved",
              timer: 1000,
              showConfirmButton: false,
            });

      refreshSettings();
      console.log("Settings saved successfully", res);
      // Show success message
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground ">
            {isRTL ? "تعديل العملات" : "Edit Currency"}
          </h1>
          <p className="text-muted-foreground mt-1">{isRTL ? " " : " "}</p>
        </div>
        {!showForm && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleSaveDB}
              disabled={saving}
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="h-4 w-4 mr-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">
                {saving
                  ? isRTL
                    ? "حفظ..."
                    : "Saving..."
                  : isRTL
                    ? "حفظ"
                    : "Save"}
              </span>
            </Button>

            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isRTL ? "تثبيت سعر صرف" : "تثبيت سعر صرف"}
              </span>
            </Button>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            ></motion.div>
          </div>
        )}
      </motion.div>

      {/* Form Section */}
      {showForm && (
        <Card className="p-6 border-2 border-primary/20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6">
              {editingId
                ? isRTL
                  ? "تحرير العملة"
                  : "Edit Currency Template"
                : isRTL
                  ? "تثبيت عملة جديدة"
                  : "Create New Currency Template"}
            </h3>

            {/* Base Unit Section */}
            <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium"></h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? "عملة النظام" : "System Currency"}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency
                    }
                    // onChange={(e) =>
                    //   setFormData((prev) => ({
                    //     ...prev,
                    //     baseUnit: e.target.value,
                    //   }))
                    // }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    // placeholder={isRTL ? "مثال: كيلوجرام" : "e.g., Kilogram"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? "العملة" : "Currency"}
                  </label>

                  <select
                    //defaultValue={formData.currencyName || ""}
                    // as="select"
                    // // name="currency"
                    //  id="currency"
                    value={JSON.parse(formData.currencyName).code || ""}
                    className="w-full px-3 py-1 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    onChange={(e) => {
                      (
                        JSON.parse(
                          localStorage.getItem("selectedCurrencyList"),
                        ) ?? currencies
                      ).map((c) => {
                        if (c.code === e.target.value) {
                          setFormData((prev) => ({
                            ...prev,
                            currencyName: JSON.stringify(c),
                          }));
                        }
                        return c;
                      });
                    }}
                  >
                    {(
                      JSON.parse(
                        localStorage.getItem("selectedCurrencyList"),
                      ) ?? currencies
                    ).map((c) => (
                      <option key={c.code} value={c.code}>
                        {isRTL
                          ? `${c.code} - ${c.symbol}`
                          : `${c.code} - ${c.symbol}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? "سعر الصرف" : "Exchange Rate"}
                  </label>
                  <input
                    type="text"
                    value={formData.currencyValue || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currencyValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    //  placeholder={isRTL ? "مثال: الأوزان" : "e.g., Weights"}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleSave}>
                {editingId
                  ? isRTL
                    ? "تحديث"
                    : "Update"
                  : isRTL
                    ? "إنشاء"
                    : "Create"}
              </Button>
            </div>
          </motion.div>
        </Card>
      )}

      {/* Units List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />
        ) : units?.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              {isRTL ? "لا توجد عملات" : "No currency templates created yet"}
            </div>
          </Card>
        ) : (
          units?.map((unit) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div
                  onClick={() =>
                    setExpandedId(expandedId === unit.id ? null : unit.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex-1 text-">
                    <h3 className="font-semibold">
                      {isRTL
                        ? JSON.parse(unit.currencyName).arabic_name
                        : JSON.parse(unit.currencyName).english_name}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="mx-2">
                        1{JSON.parse(unit.currencyName).symbol} ={" "}
                        {unit.currencyValue}{" "}
                        {localStorage.getItem("selectedCurrencySymbol") ??
                          selectedSymbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(unit);
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(unit);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {/* <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${expandedId === unit.id ? "rotate-180" : ""}`}
                    /> */}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
