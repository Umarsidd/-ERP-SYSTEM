import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Save, RefreshCw, Layout, Combine, Edit, Tag, Shapes } from "lucide-react";
import CryptoJS from "crypto-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { commonApi } from "@/lib/api";
import { useSetting } from "@/contexts/SettingContext";
import Swal from "sweetalert2";

const InventorySettings: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { settings, refreshSettings } = useSetting();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Inventory Settings
  const [inventorySettings, setInventorySettings] = useState(
    settings ?? {
      allowNegativeInventory: false,
      enableInventoryStockOrders: false,
    },
  );

  useEffect(() => {
    if (settings) {
      setInventorySettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
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
            main: JSON.stringify(inventorySettings),
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
            main: JSON.stringify(inventorySettings),
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
            {isRTL ? "إعدادات المخزون" : "Inventory Settings"}
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
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-secondary"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 mr-2"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving
              ? isRTL
                ? "حفظ..."
                : "Saving..."
              : isRTL
                ? "حفظ الإعدادات"
                : "Save Settings"}
          </Button>
        </motion.div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            {/* <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isRTL ? "إعدادات " : " Configuration"}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? "تكوين تنسيق الفواتير والترقيم"
                  : "Configure invoice formatting and numbering"}
              </CardDescription>
            </CardHeader> */}
            <CardContent className="space-y-6 mt-4">
              <div className="space-y-4">
                {/* <h3 className="text-lg font-semibold">
                  {isRTL ? "خيارات العرض" : "Display Options"}
                </h3> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>
                        {isRTL
                          ? "اتاحة المخزون بالسالب"
                          : "Allow Negative Inventory"}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? "السماح للمخزون بالذهاب إلى قيم سالبة عند بيع أكثر مما هو متاح."
                          : "Allow inventory to go negative when selling more than available."}
                      </p>
                    </div>
                    <Switch
                      dir={isRTL ? "ltr" : "ltr"}
                      checked={inventorySettings.allowNegativeInventory}
                      onCheckedChange={(checked) =>
                        setInventorySettings({
                          ...inventorySettings,
                          allowNegativeInventory: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>
                        {isRTL
                          ? "تفعيل الأذون المخزنية"
                          : "Enable Inventory Stock Orders"}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? " تفعيل استخدام الأذون المخزنية في إدارة المخزون."
                          : "Enable the use of stock orders in inventory management."}
                      </p>
                    </div>
                    <Switch
                      dir={isRTL ? "ltr" : "ltr"}
                      checked={inventorySettings.enableInventoryStockOrders}
                      onCheckedChange={(checked) =>
                        setInventorySettings({
                          ...inventorySettings,
                          enableInventoryStockOrders: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>
                        {isRTL ? "إخفاء الخصم" : "Hide Discount"}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? "إخفاء عمود الخصم في الفواتير."
                          : "Hide discount column in invoices."}
                      </p>
                    </div>
                    <Switch
                      dir={isRTL ? "ltr" : "ltr"}
                      checked={inventorySettings.hideDiscount}
                      onCheckedChange={(checked) =>
                        setInventorySettings({
                          ...inventorySettings,
                          hideDiscount: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>
                        {isRTL ? "إخفاء الضريبة" : "Hide Tax"}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? "إخفاء عمود الضريبة في الفواتير."
                          : "Hide tax column in invoices."}
                      </p>
                    </div>
                    <Switch
                      dir={isRTL ? "ltr" : "ltr"}
                      checked={inventorySettings.hideTax}
                      onCheckedChange={(checked) =>
                        setInventorySettings({
                          ...inventorySettings,
                          hideTax: checked,
                        })
                      }
                    />
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {isRTL ? "العلامات التجارية" : "Brands"}
              </CardTitle>
              <CardDescription>{isRTL ? " " : " "}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-950/20 dark:to-primary-950/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="text- md:text-start">
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {isRTL ? "العلامات التجارية" : "Brands"}
                  </h3>
                  <p className="text-primary-700 dark:text-primary-300 text-sm mt-1">
                    {isRTL
                      ? "إدارة العلامات التجارية للمنتجات"
                      : "Manage product brands."}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/inventory/brands")}
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
                <Shapes className="h-5 w-5" />
                {isRTL ? "الفئات" : "Categories"}
              </CardTitle>
              <CardDescription>{isRTL ? " " : " "}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-950/20 dark:to-primary-950/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="text- md:text-start">
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {isRTL ? "الفئات" : "Categories"}
                  </h3>
                  <p className="text-primary-700 dark:text-primary-300 text-sm mt-1">
                    {isRTL
                      ? "إدارة فئات وتصنيفات المنتجات"
                      : "Manage product categories."}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/inventory/categories")}
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
                <Combine className="h-5 w-5" />
                {isRTL ? "قوالب الوحدات" : "Unit Templates"}
              </CardTitle>
              <CardDescription>{isRTL ? " " : " "}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-950/20 dark:to-primary-950/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="text- md:text-start">
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                    {isRTL ? " الوحدات" : " Units"}
                  </h3>
                  <p className="text-primary-700 dark:text-primary-300 text-sm mt-1">
                    {isRTL
                      ? "يمكنك هنا اضافة وتعديل قوالب الوحدات"
                      : "You can add and edit unit templates here."}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/inventory/unit-templates")}
                  className="bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isRTL ? "تعديل" : "Edit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div >
  );
};

export default InventorySettings;

/* 

    main: JSON.stringify({
              ...inventorySettings,
              currency: {
                selected: "IQD",
                selectedSymbol: "د.ع",
                list: [
                  {
                    code: "IQD",
                    english_name: "Iraqi Dinar",
                    arabic_name: "الدينار العراقي",
                    symbol: "د.ع",
                    rate_to_iqd: 1,
                  },
                  {
                    code: "USD",
                    english_name: "US Dollar",
                    arabic_name: "الدولار الأمريكي",
                    symbol: "$",
                    rate_to_iqd: 0.00076229,
                  },
                  {
                    code: "EUR",
                    english_name: "Euro",
                    arabic_name: "اليورو",
                    symbol: "€",
                    rate_to_iqd: 0.00065587,
                  },
                  {
                    code: "GBP",
                    english_name: "Pound Sterling",
                    arabic_name: "الجنيه الإسترليني",
                    symbol: "£",
                    rate_to_iqd: 0.00057862,
                  },
                  {
                    code: "JPY",
                    english_name: "Japanese Yen",
                    arabic_name: "الين الياباني",
                    symbol: "¥",
                    rate_to_iqd: 0.1178,
                  },
                  {
                    code: "CNY",
                    english_name: "Chinese Yuan Renminbi",
                    arabic_name: "اليوان الصيني",
                    symbol: "¥ / 元",
                    rate_to_iqd: 0.005417,
                  },
                  {
                    code: "SAR",
                    english_name: "Saudi Riyal",
                    arabic_name: "الريال السعودي",
                    symbol: "ر.س",
                    rate_to_iqd: 0.002859,
                  },
                  {
                    code: "AED",
                    english_name: "UAE Dirham",
                    arabic_name: "الدرهم الإماراتي",
                    symbol: "د.إ",
                    rate_to_iqd: 0.0028,
                  },
                  {
                    code: "AFN",
                    english_name: "Afghan Afghani",
                    arabic_name: "الأفغاني الأفغاني",
                    symbol: "؋",
                    rate_to_iqd: 0.05054,
                  },
                  {
                    code: "ALL",
                    english_name: "Albanian Lek",
                    arabic_name: "الليك الألباني",
                    symbol: "Lek",
                    rate_to_iqd: 0.06344,
                  },
                  {
                    code: "AMD",
                    english_name: "Armenian Dram",
                    arabic_name: "الدرام الأرمني",
                    symbol: "֏",
                    rate_to_iqd: 0.2913,
                  },
                  {
                    code: "ANG",
                    english_name: "Netherlands Antillean Guilder",
                    arabic_name: "غيلدر أنتيلي هولندي",
                    symbol: "ƒ",
                    rate_to_iqd: 0.001364,
                  },
                  {
                    code: "AOA",
                    english_name: "Angolan Kwanza",
                    arabic_name: "الكوانزا الأنغولي",
                    symbol: "Kz",
                    rate_to_iqd: 0.6995,
                  },
                  {
                    code: "ARS",
                    english_name: "Argentine Peso",
                    arabic_name: "البيزو الأرجنتيني",
                    symbol: "$",
                    rate_to_iqd: 1.071,
                  },
                  {
                    code: "AUD",
                    english_name: "Australian Dollar",
                    arabic_name: "الدولار الأسترالي",
                    symbol: "$",
                    rate_to_iqd: 0.001166,
                  },
                  {
                    code: "AWG",
                    english_name: "Aruban Florin",
                    arabic_name: "الفلورن الأروبي",
                    symbol: "ƒ",
                    rate_to_iqd: 0.001364,
                  },
                  {
                    code: "AZN",
                    english_name: "Azerbaijani Manat",
                    arabic_name: "المانات الأذربيجاني",
                    symbol: "₼",
                    rate_to_iqd: 0.001296,
                  },
                  {
                    code: "BAM",
                    english_name: "Bosnia and Herzegovina Convertible Mark",
                    arabic_name: "مارك البوسنة والهرسك القابل للتحويل",
                    symbol: "KM",
                    rate_to_iqd: 0.001283,
                  },
                  {
                    code: "BBD",
                    english_name: "Barbados Dollar",
                    arabic_name: "الدولار البربادوسي",
                    symbol: "$",
                    rate_to_iqd: 0.001525,
                  },
                  {
                    code: "BDT",
                    english_name: "Bangladeshi Taka",
                    arabic_name: "التاكا البنغلاديشي",
                    symbol: "৳",
                    rate_to_iqd: 0.09313,
                  },
                  {
                    code: "BGN",
                    english_name: "Bulgarian Lev",
                    arabic_name: "الليف البلغاري",
                    symbol: "лв",
                    rate_to_iqd: 0.001283,
                  },
                  {
                    code: "BHD",
                    english_name: "Bahraini Dinar",
                    arabic_name: "الدينار البحريني",
                    symbol: "د.ب",
                    rate_to_iqd: 0.00028662,
                  },
                  {
                    code: "BIF",
                    english_name: "Burundian Franc",
                    arabic_name: "الفرنك البوروندي",
                    symbol: "FBu",
                    rate_to_iqd: 2.2414,
                  },
                  {
                    code: "BMD",
                    english_name: "Bermudian Dollar",
                    arabic_name: "الدولار البرمودي",
                    symbol: "$",
                    rate_to_iqd: 0.00076229,
                  },
                  {
                    code: "BND",
                    english_name: "Brunei Dollar",
                    arabic_name: "الدولار البروني",
                    symbol: "$",
                    rate_to_iqd: 0.00098954,
                  },
                  {
                    code: "BOB",
                    english_name: "Bolivian Boliviano",
                    arabic_name: "البوليفيانو البوليفي",
                    symbol: "Bs.",
                    rate_to_iqd: 0.005286,
                  },
                  {
                    code: "BRL",
                    english_name: "Brazilian Real",
                    arabic_name: "الريال البرازيلي",
                    symbol: "R$",
                    rate_to_iqd: 0.004037,
                  },
                  {
                    code: "BSD",
                    english_name: "Bahamian Dollar",
                    arabic_name: "الدولار الباهامي",
                    symbol: "$",
                    rate_to_iqd: 0.00076229,
                  },
                  {
                    code: "BTN",
                    english_name: "Bhutanese Ngultrum",
                    arabic_name: "النغولتروم البوتاني",
                    symbol: "Nu.",
                    rate_to_iqd: 0.0676,
                  },
                  {
                    code: "BWP",
                    english_name: "Botswana Pula",
                    arabic_name: "البولا البوتسواني",
                    symbol: "P",
                    rate_to_iqd: 0.01085,
                  },
                  {
                    code: "BYN",
                    english_name: "Belarusian Ruble",
                    arabic_name: "الروبل البيلاروسي",
                    symbol: "Br",
                    rate_to_iqd: 0.002603,
                  },
                  {
                    code: "BZD",
                    english_name: "Belize Dollar",
                    arabic_name: "الدولار البيليزي",
                    symbol: "BZ$",
                    rate_to_iqd: 0.001525,
                  },
                  {
                    code: "CAD",
                    english_name: "Canadian Dollar",
                    arabic_name: "الدولار الكندي",
                    symbol: "$",
                    rate_to_iqd: 0.001069,
                  },
                  {
                    code: "CDF",
                    english_name: "Congolese Franc",
                    arabic_name: "الفرنك الكونغولي",
                    symbol: "FC",
                    rate_to_iqd: 1.6745,
                  },
                  {
                    code: "CHF",
                    english_name: "Swiss Franc",
                    arabic_name: "الفرنك السويسري",
                    symbol: "CHF",
                    rate_to_iqd: 0.00060514,
                  },
                  {
                    code: "CLF",
                    english_name: "Chilean Unit of Account (UF)",
                    arabic_name: "وحدة حساب تشيلية (UF)",
                    symbol: "UF",
                    rate_to_iqd: 0.00001786,
                  },
                  {
                    code: "CLP",
                    english_name: "Chilean Peso",
                    arabic_name: "البيزو التشيلي",
                    symbol: "$",
                    rate_to_iqd: 0.7061,
                  },
                  {
                    code: "CNH",
                    english_name: "Chinese Yuan (Offshore)",
                    arabic_name: "اليوان الصيني (خارج الحدود)",
                    symbol: "¥",
                    rate_to_iqd: 0.005411,
                  },
                  {
                    code: "COP",
                    english_name: "Colombian Peso",
                    arabic_name: "البيزو الكولومبي",
                    symbol: "$",
                    rate_to_iqd: 2.8747,
                  },
                  {
                    code: "CRC",
                    english_name: "Costa Rican Colón",
                    arabic_name: "الكولون الكوستاريكي",
                    symbol: "₡",
                    rate_to_iqd: 0.3821,
                  },
                  {
                    code: "CUP",
                    english_name: "Cuban Peso",
                    arabic_name: "البيزو الكوبي",
                    symbol: "$",
                    rate_to_iqd: 0.01829,
                  },
                  {
                    code: "CVE",
                    english_name: "Cabo Verde Escudo",
                    arabic_name: "إسكودو الرأس الأخضر",
                    symbol: "$",
                    rate_to_iqd: 0.07232,
                  },
                  {
                    code: "CZK",
                    english_name: "Czech Koruna",
                    arabic_name: "الكرونة التشيكية",
                    symbol: "Kč",
                    rate_to_iqd: 0.01586,
                  },
                  {
                    code: "DJF",
                    english_name: "Djiboutian Franc",
                    arabic_name: "الفرنك الجيبوتي",
                    symbol: "Fdj",
                    rate_to_iqd: 0.1355,
                  },
                  {
                    code: "DKK",
                    english_name: "Danish Krone",
                    arabic_name: "الكرونة الدنماركية",
                    symbol: "kr.",
                    rate_to_iqd: 0.004893,
                  },
                  {
                    code: "DOP",
                    english_name: "Dominican Peso",
                    arabic_name: "البيزو الدومينيكاني",
                    symbol: "RD$",
                    rate_to_iqd: 0.04888,
                  },
                  {
                    code: "DZD",
                    english_name: "Algerian Dinar",
                    arabic_name: "الدينار الجزائري",
                    symbol: "د.ج",
                    rate_to_iqd: 0.09929,
                  },
                  {
                    code: "EGP",
                    english_name: "Egyptian Pound",
                    arabic_name: "الجنيه المصري",
                    symbol: "ج.م / E£",
                    rate_to_iqd: 0.03598,
                  },
                  {
                    code: "ERN",
                    english_name: "Eritrean Nakfa",
                    arabic_name: "النكفا الإريتري",
                    symbol: "Nfk",
                    rate_to_iqd: 0.01143,
                  },
                  {
                    code: "ETB",
                    english_name: "Ethiopian Birr",
                    arabic_name: "البير الإثيوبي",
                    symbol: "Br",
                    rate_to_iqd: 0.1189,
                  },
                  {
                    code: "FJD",
                    english_name: "Fiji Dollar",
                    arabic_name: "الدولار الفيجي",
                    symbol: "FJ$",
                    rate_to_iqd: 0.001735,
                  },
                  {
                    code: "FKP",
                    english_name: "Falkland Islands Pound",
                    arabic_name: "جنيه جزر فوكلاند",
                    symbol: "£",
                    rate_to_iqd: 0.00057862,
                  },
                  {
                    code: "FOK",
                    english_name: "Faroese Króna",
                    arabic_name: "كرونة فارو",
                    symbol: "kr",
                    rate_to_iqd: 0.004893,
                  },
                  {
                    code: "GEL",
                    english_name: "Georgian Lari",
                    arabic_name: "اللاري الجورجي",
                    symbol: "₾",
                    rate_to_iqd: 0.002063,
                  },
                  {
                    code: "GGP",
                    english_name: "Guernsey Pound",
                    arabic_name: "الجنيه غيرنزي",
                    symbol: "£",
                    rate_to_iqd: 0.00057862,
                  },
                  {
                    code: "GHS",
                    english_name: "Ghanaian Cedi",
                    arabic_name: "السيدي الغاني",
                    symbol: "₵",
                    rate_to_iqd: 0.008345,
                  },
                  {
                    code: "GIP",
                    english_name: "Gibraltar Pound",
                    arabic_name: "جنيه جبل طارق",
                    symbol: "£",
                    rate_to_iqd: 0.00057862,
                  },
                  {
                    code: "GMD",
                    english_name: "Gambian Dalasi",
                    arabic_name: "الدالاسي الغامبي",
                    symbol: "D",
                    rate_to_iqd: 0.05608,
                  },
                  {
                    code: "GNF",
                    english_name: "Guinean Franc",
                    arabic_name: "الفرنك الغيني",
                    symbol: "FG",
                    rate_to_iqd: 6.6548,
                  },
                  {
                    code: "GTQ",
                    english_name: "Guatemalan Quetzal",
                    arabic_name: "الكيتزال الغواتيمالي",
                    symbol: "Q",
                    rate_to_iqd: 0.005841,
                  },
                  {
                    code: "GYD",
                    english_name: "Guyanese Dollar",
                    arabic_name: "الدولار الغياني",
                    symbol: "$",
                    rate_to_iqd: 0.1595,
                  },
                  {
                    code: "HKD",
                    english_name: "Hong Kong Dollar",
                    arabic_name: "الدولار هونغ كونغ",
                    symbol: "HK$",
                    rate_to_iqd: 0.005924,
                  },
                  {
                    code: "HNL",
                    english_name: "Honduran Lempira",
                    arabic_name: "اللمبيرا الهندوراسي",
                    symbol: "L",
                    rate_to_iqd: 0.02005,
                  },
                  {
                    code: "HRK",
                    english_name: "Croatian Kuna",
                    arabic_name: "الكونا الكرواتي",
                    symbol: "kn",
                    rate_to_iqd: 0.004942,
                  },
                  {
                    code: "HTG",
                    english_name: "Haitian Gourde",
                    arabic_name: "الغورد الهايتي",
                    symbol: "G",
                    rate_to_iqd: 0.09984,
                  },
                  {
                    code: "HUF",
                    english_name: "Hungarian Forint",
                    arabic_name: "الفورنت المجري",
                    symbol: "Ft",
                    rate_to_iqd: 0.2522,
                  },
                  {
                    code: "IDR",
                    english_name: "Indonesian Rupiah",
                    arabic_name: "الروبية الإندونيسية",
                    symbol: "Rp",
                    rate_to_iqd: 12.9444,
                  },
                  {
                    code: "ILS",
                    english_name: "Israeli New Shekel",
                    arabic_name: "الشيكل الإسرائيلي الجديد",
                    symbol: "₪",
                    rate_to_iqd: 0.00246,
                  },
                  {
                    code: "IMP",
                    english_name: "Isle of Man Pound",
                    arabic_name: "جنيه جزيرة مان",
                    symbol: "£",
                    rate_to_iqd: 0.00057862,
                  },
                  {
                    code: "INR",
                    english_name: "Indian Rupee",
                    arabic_name: "الروبية الهندية",
                    symbol: "₹",
                    rate_to_iqd: 0.0676,
                  },
                  {
                    code: "IRR",
                    english_name: "Iranian Rial",
                    arabic_name: "الريال الإيراني",
                    symbol: "﷼",
                    rate_to_iqd: 33.1923,
                  },
                  {
                    code: "ISK",
                    english_name: "Icelandic Króna",
                    arabic_name: "الكرونة الآيسلندية",
                    symbol: "kr",
                    rate_to_iqd: 0.09668,
                  },
                  {
                    code: "JEP",
                    english_name: "Jersey Pound",
                    arabic_name: "جنيه جيرسي",
                    symbol: "£",
                    rate_to_iqd: 0.00057862,
                  },
                  {
                    code: "JMD",
                    english_name: "Jamaican Dollar",
                    arabic_name: "الدولار الجامايكي",
                    symbol: "J$",
                    rate_to_iqd: 0.1223,
                  },
                  {
                    code: "JOD",
                    english_name: "Jordanian Dinar",
                    arabic_name: "الدينار الأردني",
                    symbol: "د.ا",
                    rate_to_iqd: 0.00054046,
                  },
                  {
                    code: "KGS",
                    english_name: "Kyrgyzstani Som",
                    arabic_name: "السوم القيرغيزي",
                    symbol: "с",
                    rate_to_iqd: 0.06667,
                  },
                  {
                    code: "KHR",
                    english_name: "Cambodian Riel",
                    arabic_name: "الرييل الكمبودي",
                    symbol: "៛",
                    rate_to_iqd: 3.0655,
                  },
                  {
                    code: "KID",
                    english_name: "Kiribati Dollar",
                    arabic_name: "دولار كيريباتي",
                    symbol: "$",
                    rate_to_iqd: 0.001166,
                  },
                  {
                    code: "KMF",
                    english_name: "Comorian Franc",
                    arabic_name: "الفرنك القمري",
                    symbol: "CF",
                    rate_to_iqd: 0.3227,
                  },
                  {
                    code: "KRW",
                    english_name: "South Korean Won",
                    arabic_name: "الوون الكوري الجنوبي",
                    symbol: "₩",
                    rate_to_iqd: 1.1043,
                  },
                  {
                    code: "KWD",
                    english_name: "Kuwaiti Dinar",
                    arabic_name: "الدينار الكويتي",
                    symbol: "د.ك",
                    rate_to_iqd: 0.00023312,
                  },
                  {
                    code: "KYD",
                    english_name: "Cayman Islands Dollar",
                    arabic_name: "دولار جزر كايمان",
                    symbol: "$",
                    rate_to_iqd: 0.00063524,
                  },
                  {
                    code: "KZT",
                    english_name: "Kazakhstani Tenge",
                    arabic_name: "التنغي الكازاخستاني",
                    symbol: "₸",
                    rate_to_iqd: 0.3997,
                  },
                  {
                    code: "LAK",
                    english_name: "Lao Kip",
                    arabic_name: "الكيب اللاوسي",
                    symbol: "₭",
                    rate_to_iqd: 16.6401,
                  },
                  {
                    code: "LBP",
                    english_name: "Lebanese Pound",
                    arabic_name: "الليرة اللبنانية",
                    symbol: "ل.ل / L£",
                    rate_to_iqd: 68.2247,
                  },
                  {
                    code: "LKR",
                    english_name: "Sri Lanka Rupee",
                    arabic_name: "الروبية السريلانكية",
                    symbol: "Rs",
                    rate_to_iqd: 0.2336,
                  },
                  {
                    code: "LRD",
                    english_name: "Liberian Dollar",
                    arabic_name: "الدولار الليبيري",
                    symbol: "L$",
                    rate_to_iqd: 0.1381,
                  },
                  {
                    code: "LSL",
                    english_name: "Lesotho Loti",
                    arabic_name: "اللوتي الليسوتي",
                    symbol: "L",
                    rate_to_iqd: 0.01302,
                  },
                  {
                    code: "LYD",
                    english_name: "Libyan Dinar",
                    arabic_name: "الدينار الليبي",
                    symbol: "ل.د",
                    rate_to_iqd: 0.004159,
                  },
                  {
                    code: "MAD",
                    english_name: "Moroccan Dirham",
                    arabic_name: "الدرهم المغربي",
                    symbol: "د.م.",
                    rate_to_iqd: 0.007043,
                  },
                  {
                    code: "MDL",
                    english_name: "Moldovan Leu",
                    arabic_name: "الليو المولدوفي",
                    symbol: "L",
                    rate_to_iqd: 0.01279,
                  },
                  {
                    code: "MGA",
                    english_name: "Malagasy Ariary",
                    arabic_name: "الأرياري الملغاشي",
                    symbol: "Ar",
                    rate_to_iqd: 3.4266,
                  },
                  {
                    code: "MKD",
                    english_name: "Macedonian Denar",
                    arabic_name: "الدينار المقدوني",
                    symbol: "ден",
                    rate_to_iqd: 0.04058,
                  },
                  {
                    code: "MMK",
                    english_name: "Myanmar Kyat",
                    arabic_name: "الكيات الميانماري",
                    symbol: "Ks",
                    rate_to_iqd: 1.5965,
                  },
                  {
                    code: "MNT",
                    english_name: "Mongolian Tögrög",
                    arabic_name: "الـتوغروغ المنغولي",
                    symbol: "₮",
                    rate_to_iqd: 2.7111,
                  },
                  {
                    code: "MOP",
                    english_name: "Macanese Pataca",
                    arabic_name: "الـباتاكا الماكاوية",
                    symbol: "P",
                    rate_to_iqd: 0.006102,
                  },
                  {
                    code: "MRU",
                    english_name: "Mauritanian Ouguiya",
                    arabic_name: "الأوقية الموريتانية",
                    symbol: "UM",
                    rate_to_iqd: 0.03036,
                  },
                  {
                    code: "MUR",
                    english_name: "Mauritian Rupee",
                    arabic_name: "الروبية الموريشيوسية",
                    symbol: "₨",
                    rate_to_iqd: 0.03481,
                  },
                  {
                    code: "MVR",
                    english_name: "Maldivian Rufiyaa",
                    arabic_name: "الروفيا المالديفية",
                    symbol: "ރ.",
                    rate_to_iqd: 0.01178,
                  },
                  {
                    code: "MWK",
                    english_name: "Malawian Kwacha",
                    arabic_name: "الكواشا المالاوية",
                    symbol: "MK",
                    rate_to_iqd: 1.3238,
                  },
                  {
                    code: "MXN",
                    english_name: "Mexican Peso",
                    arabic_name: "البيزو المكسيكي",
                    symbol: "$",
                    rate_to_iqd: 0.01396,
                  },
                  {
                    code: "MYR",
                    english_name: "Malaysian Ringgit",
                    arabic_name: "الرينغيت الماليزي",
                    symbol: "RM",
                    rate_to_iqd: 0.00315,
                  },
                  {
                    code: "MZN",
                    english_name: "Mozambican Metical",
                    arabic_name: "الميتيكال الموزمبيقي",
                    symbol: "MT",
                    rate_to_iqd: 0.04851,
                  },
                  {
                    code: "NAD",
                    english_name: "Namibian Dollar",
                    arabic_name: "الدولار الناميبي",
                    symbol: "N$",
                    rate_to_iqd: 0.01302,
                  },
                ],
              },
            }),
            
            */
