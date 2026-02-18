import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CryptoJS from "crypto-js";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Tag,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import { Loading } from "@/components/common/loading";
import { useSetting } from "@/contexts/SettingContext";

export default function Brands() {
  const { isRTL } = useLanguage();
  const { settings, refreshSettings, isLoading } = useSetting();
  const [brands, setBrands] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (settings && settings.brands) {
      setBrands(settings.brands || []);
    } else {
      setBrands([]);
    }
  }, [settings]);

  const handleSave = async () => {
    if (formData.name) {
      setSaving(true);
      try {
        const brandData = {
          id: editingId || `brand_${Date.now()}`,
          name: formData.name,
          description: formData.description,
          createdAt: new Date().toISOString()
        };

        let newBrands = [];
        if (editingId) {
          newBrands = brands.map(b => b.id === editingId ? brandData : b);
        } else {
          newBrands = [...brands, brandData];
        }

        const newSettings = { ...settings, brands: newBrands };

        await commonApi.update(
          settings.id,
          {
            updatedAt: new Date().toISOString(),
            main: JSON.stringify(newSettings),
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user") || "",
                  import.meta.env.VITE_SECRET
                ).toString(CryptoJS.enc.Utf8)
              )?.user
            ),
          },
          "setting"
        );

        await refreshSettings();

        await Swal.fire({
          icon: "success",
          title: isRTL ? "تم الحفظ بنجاح" : "Saved successfully",
          timer: 1000,
          showConfirmButton: false,
        });

        handleCancel();
      } catch (error) {
        console.error("Error saving brand:", error);
        await Swal.fire({
          icon: "error",
          title: isRTL ? "حدث خطأ" : "Error occurred",
          text: isRTL ? "فشل الحفظ" : "Failed to save",
        });
      } finally {
        setSaving(false);
      }
    } else {
      await Swal.fire({
        icon: "error",
        title: isRTL ? "مطلوب" : "Required",
        text: isRTL ? "يرجى إدخال اسم العلامة التجارية" : "Please enter brand name",
      });
    }
  };

  const handleEdit = (brand) => {
    setFormData({
      name: brand.name,
      description: brand.description || ""
    });
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: isRTL
        ? "هل أنت متأكد من حذف هذا العنصر؟"
        : "Are you sure you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isRTL ? "حذف" : "Delete",
      cancelButtonText: isRTL ? "إلغاء" : "Cancel",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      setSaving(true);
      try {
        const newBrands = brands.filter(b => b.id !== id);
        const newSettings = { ...settings, brands: newBrands };

        await commonApi.update(
          settings.id,
          {
            updatedAt: new Date().toISOString(),
            main: JSON.stringify(newSettings),
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user") || "",
                  import.meta.env.VITE_SECRET
                ).toString(CryptoJS.enc.Utf8)
              )?.user
            ),
          },
          "setting"
        );
        await refreshSettings();
        await Swal.fire({
          icon: "success",
          title: isRTL ? "تم الحذف بنجاح" : "Deleted successfully",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(error);
        await Swal.fire({
          icon: "error",
          title: isRTL ? "حدث خطأ" : "Error occurred",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
    });
    setShowForm(false);
    setEditingId(null);
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
            {isRTL ? "العلامات التجارية" : "Brands"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL
              ? "إدارة العلامات التجارية للمنتجات"
              : "Manage product brands"}
          </p>
        </div>
        {!showForm && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isRTL ? "إضافة علامة تجارية" : "Add Brand"}
              </span>
            </Button>
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
                  ? "تعديل العلامة التجارية"
                  : "Edit Brand"
                : isRTL
                  ? "إضافة علامة تجارية جديدة"
                  : "Add New Brand"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isRTL ? "اسم العلامة التجارية" : "Brand Name"}
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={isRTL ? "مثال: نايك" : "e.g., Nike"}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  {isRTL ? "الوصف" : "Description"}
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={isRTL ? "وصف للعلامة التجارية" : "Brand description"}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 mr-2"
                  >
                    <Tag className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isRTL ? "حفظ" : "Save"}
              </Button>
            </div>
          </motion.div>
        </Card>
      )}

      {/* Brands List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <Loading title={isRTL ? "جاري التحميل ..." : "Loading..."} />
        ) : brands.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              {isRTL ? "لا توجد علامات تجارية" : "No brands found"}
            </div>
          </Card>
        ) : (
          brands.map((brand: any) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      {brand.name}
                    </h3>
                    {brand.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {brand.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
