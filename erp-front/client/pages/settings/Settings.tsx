import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  DollarSign,
  Shield,
  Upload,
  Image,
  RefreshCw,
  Save,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSetting } from "@/contexts/SettingContext";
import CryptoJS from "crypto-js";
import { commonApi } from "@/lib/api";
import Swal from "sweetalert2";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);

  const { settings, refreshSettings, isLoading } = useSetting();
  const [settingData, setSettingData] = useState({
    logoUrl: "",
    logoText: "",
    logoAddress: "",
    logoPhone: "",
    logoPhone2: "",

    logoEmail: "",
  });
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setSettingData(settings?.logo ?? {});
    }
  }, [settings]);

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
            main: JSON.stringify({ ...settings, logo: settingData }),
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
            main: JSON.stringify({ ...settings, logo: settingData }),
          },
          "setting",
        );
      }

      await Swal.fire({
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isRTL ? "الاعدادات العامة " : "General Settings"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? "إدارة إعدادات النظام والتكوينات"
              : "Manage system settings and configurations"}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        ></motion.div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {isRTL ? " العملات" : "Currency "}
              </CardTitle>
              <CardDescription>{isRTL ? " " : " "}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-950/20 dark:to-primary-950/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="text- md:text-start">
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {isRTL ? "تعديل العملات" : "Edit Currency "}
                  </h3>
                  <p className="text-primary-700 dark:text-primary-300 text-sm mt-1">
                    {isRTL
                      ? "يمكنك هنا اضافة وتعديل العملات"
                      : "You can add and edit currency here."}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/settings/currency-templates")}
                  className="bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isRTL ? "تعديل" : "Edit"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {isRTL ? "تغيير رمز المرور" : "Change Password"}
              </CardTitle>
              <CardDescription>{isRTL ? " " : " "}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-r from-red-50 to-red-50 dark:from-red-950/20 dark:to-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text- md:text-start">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                    {isRTL ? "تغيير رمز المرور" : "Change Password"}
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {isRTL
                      ? "يمكنك هنا تغيير رمز المرور"
                      : "You can change your password here."}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/auth/reset-password")}
                  className="bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isRTL ? "تعديل" : "Edit"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                {isRTL ? "قوالب الطباعة" : "Print Templates"}
              </CardTitle>
              <CardDescription>{isRTL ? " " : " "}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text- md:text-start">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {isRTL ? "تخصيص قوالب الطباعة" : "Customize Print Templates"}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                    {isRTL
                      ? "إنشاء وتعديل قوالب الفواتير"
                      : "Create and edit invoice templates."}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/settings/print-templates")}
                  className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isRTL ? "تعديل" : "Edit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">
            {isRTL ? "إعدادات الشعار" : "Logo Settings"}
          </h3>

          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {isRTL ? "رفع الشعار" : "Upload Logo"}
              </label>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                  {settingData.logoUrl &&
                    settingData.logoUrl !== "/placeholder.svg" ? (
                    <img
                      src={settingData.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isRTL ? "رفع صورة" : "Upload Image"}</span>
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isRTL
                      ? "SVG، PNG أو JPG. الحد الأقصى 2MB."
                      : "SVG, PNG or JPG. Max 2MB."}
                  </p>
                </div>
              </div>
            </div>

            {/* Logo Text */}

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? "اسم الشركة" : "Company"}
              </label>
              <input
                type="text"
                value={settingData.logoText}
                onChange={(e) =>
                  setSettingData((prev) => ({
                    ...prev,
                    logoText: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={isRTL ? "اسم الشركة" : "Company"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? "العنوان" : "Address"}
              </label>
              <input
                type="text"
                value={settingData.logoAddress}
                onChange={(e) =>
                  setSettingData((prev) => ({
                    ...prev,
                    logoAddress: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={isRTL ? "العنوان" : "Address"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? "رقم الهاتف" : "Phone Number"}
              </label>
              <input
                type="text"
                value={settingData.logoPhone}
                onChange={(e) =>
                  setSettingData((prev) => ({
                    ...prev,
                    logoPhone: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={isRTL ? "رقم الهاتف" : "Phone Number"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? "رقم الهاتف البديل" : "Alternate Phone Number"}
              </label>
              <input
                type="text"
                value={settingData.logoPhone2}
                onChange={(e) =>
                  setSettingData((prev) => ({
                    ...prev,
                    logoPhone2: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={
                  isRTL ? "رقم الهاتف البديل" : "Alternate Phone Number"
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? "الايميل" : "Email"}
              </label>
              <input
                type="text"
                value={settingData.logoEmail}
                onChange={(e) =>
                  setSettingData((prev) => ({
                    ...prev,
                    logoEmail: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={isRTL ? "الايميل" : "Email"}
              />
            </div>

            <Button
              onClick={handleSaveDB}
              disabled={saving}
              // variant="outline"
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
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setSettingData((prev) => ({
                ...prev,
                logoUrl: reader.result as string,
              }));
            };
            reader.readAsDataURL(file);

            console.log("Selected file:", file);
            console.log("File size (bytes):", reader);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default Settings;
