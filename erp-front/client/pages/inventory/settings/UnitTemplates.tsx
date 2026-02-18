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

export default function UnitTemplates() {
  const { isRTL } = useLanguage();
  const { settings, refreshSettings, isLoading } = useSetting();
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (settings) {
      setUnits(settings?.unitTemplates ?? []);
    }
  }, [settings]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    // nameAr: "",
    baseUnit: "",
    //  baseUnitAr: "",
    conversions: [],
  });

  const [newConversion, setNewConversion] = useState({
    unitName: "",
    value: "",
  });

  const handleAddConversion = async () => {
    if (newConversion.unitName && newConversion.value) {
      const conversion = {
        id: `conv_${Date.now()}`,
        unitName: newConversion.unitName,
        value: parseFloat(newConversion.value),
      };
      setFormData((prev) => ({
        ...prev,
        conversions: [...(prev.conversions || []), conversion],
      }));
      setNewConversion({ unitName: "", value: "" });
    } else {
      await Swal.fire({
        icon: "error",
        title: isRTL ? "الرجاء ملء جميع الحقول" : "Please fill all fields",
        // text: isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred",
        confirmButtonText: isRTL ? "حسناً" : "OK",
      });
    }
  };

  const handleRemoveConversion = (conversionId: string) => {
    setFormData((prev) => ({
      ...prev,
      conversions: (prev.conversions || []).filter(
        (c) => c.id !== conversionId,
      ),
    }));
  };

  const handleSave = async () => {
    if (formData.name && formData.baseUnit && formData.conversions?.length) {
      if (editingId) {
        setUnits((prev) =>
          prev?.map((u) =>
            u.id === editingId
              ? {
                  ...formData,
                  id: editingId,
                  conversions: formData.conversions || [],
                  createdAt: u.createdAt,
                }
              : u,
          ),
        );
        setEditingId(null);
      } else {
        const newUnit = {
          id: `unit_${Date.now()}`,
          baseUnit: formData.baseUnit,
          name: formData.name,
          conversions: formData.conversions || [],
          createdAt: new Date().toISOString().split("T")[0],
        };
        setUnits((prev) => [...prev, newUnit]);
      }
      setFormData({
        baseUnit: "",
        name: "",
        conversions: [],
      });
      setShowForm(false);
    }
  };

  const handleEdit = (unit) => {
    setFormData(unit);
    setEditingId(unit.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
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
      setUnits((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      // nameAr: "",
      baseUnit: "",
      // baseUnitAr: "",
      conversions: [],
    });
    setShowForm(false);
    setEditingId(null);
    setNewConversion({ unitName: "", value: "" });
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
            main: JSON.stringify({ ...settings, unitTemplates: units }),
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
            main: JSON.stringify({ ...settings, unitTemplates: units }),
          },
          "setting",
        );
      }
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
            {isRTL ? "نماذج الوحدات" : "Unit Templates"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL
              ? "تعريف وحدات المنتجات والتحويلات"
              : "Define product units and conversions"}
          </p>
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
                {isRTL ? "إضافة وحدة جديدة" : "Add Unit Template"}
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
                  ? "تحرير الوحدة"
                  : "Edit Unit Template"
                : isRTL
                  ? "إنشاء وحدة جديدة"
                  : "Create New Unit Template"}
            </h3>

            {/* Base Unit Section */}
            <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium"></h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL
                      ? "الوحدة الأساسية (الاصغر)"
                      : "Base Unit (Smallest Unit)"}
                  </label>
                  <input
                    type="text"
                    value={formData.baseUnit || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        baseUnit: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={isRTL ? "مثال: كيلوجرام" : "e.g., Kilogram"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? "اسم النموذج" : "Template Name"}
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={isRTL ? "مثال: الأوزان" : "e.g., Weights"}
                  />
                </div>
              </div>
            </div>

            {/* Conversions Section */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium">
                {isRTL
                  ? "الوحدات الاكبر والتحويلات"
                  : "Larger Units & Conversions"}
              </h4>

              {(formData.conversions || []).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">
                        1 {conv.unitName}
                      </span>
                      <span className="text-muted-foreground"> = </span>
                      <span className="text-sm font-medium">
                        {conv.value} {formData.baseUnit}
                      </span>
                    </div>
                    {/* <div className="text-xs text-muted-foreground">
                      1 {formData.baseUnitAr} = {conv.value}
                    </div> */}
                  </div>
                  <button
                    onClick={() => handleRemoveConversion(conv.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg space-y-4">
                <h5 className="text-sm font-medium">
                  {isRTL ? "إضافة وحدة جديدة" : "Add New Unit Conversion"}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newConversion.unitName}
                    onChange={(e) =>
                      setNewConversion((prev) => ({
                        ...prev,
                        unitName: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder={isRTL ? "اسم الوحدة" : "Unit Name"}
                  />

                  <input
                    type="number"
                    value={newConversion.value}
                    onChange={(e) =>
                      setNewConversion((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder={isRTL ? "القيمة" : "Value"}
                  />
                  <Button
                    onClick={handleAddConversion}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {isRTL ? "إضافة" : "Add"}
                  </Button>
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
              {isRTL ? "لا توجد نماذج وحدات" : "No unit templates created yet"}
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
                    <h3 className="font-semibold">{unit.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {`${unit.baseUnit}`}
                      <span className="mx-2">•</span>
                      {isRTL
                        ? ` ${(unit.conversions || []).length} تحويل `
                        : `${(unit.conversions || []).length} conversions`}
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
                        handleDelete(unit.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${expandedId === unit.id ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === unit.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border p-4 bg-muted/10"
                  >
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">
                        {isRTL ? "جدول التحويلات" : "Conversion Table"}
                      </h4>
                      <div className="space-y-2">
                        {(unit.conversions || []).map((conv) => (
                          <div
                            key={conv.id}
                            className="flex justify-between items-center text-sm p-2 bg-background rounded border border-border/50"
                          >
                            <span className="font-medium">
                              1 {conv.unitName} = {conv.value} {unit.baseUnit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
