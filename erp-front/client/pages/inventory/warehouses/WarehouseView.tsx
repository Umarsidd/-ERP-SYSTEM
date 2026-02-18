import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import {
  Copy,
  Edit,
  Trash2,
  Users,
  Warehouse,
  Package,
  TrendingUp,
  TrendingDown,
  MapPin,
  User,
  Boxes,
  Activity,
  Settings,
  BarChart3,
} from "lucide-react";
import { handleCopy, handleEdit } from "@/lib/function";
import { commonApi } from "@/lib/api";

export default function WarehouseView() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.viewFrom);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!product) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          {isRTL ? "غير موجود" : "Not Found"}
        </div>
      </div>
    );
  }

  const warehouseData = JSON.parse(product.main);

  // Mock data for demonstration - in real app, this would come from API
  const stockStats = {
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  const recentMovements = [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {warehouseData?.name}
              </h1>
              <Badge variant="outline" className="text-xs">
                {warehouseData?.code}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {isRTL
                ? "إدارة المستودع والمخزون"
                : "Warehouse and inventory management"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleCopy(
                isRTL ? "نسخ" : "Copy",
                isRTL
                  ? `هل تريد نسخ ${product.elementNumber}؟`
                  : `Do you want to copy ${product.elementNumber}?`,
                product,
                isRTL,
                navigate,
                "/inventory/warehouses/new"
              );
            }}
          >
            <Copy className="h-4 w-4 sm:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              var res = await commonApi.delete(
                isRTL ? "حذف" : "Delete",
                isRTL
                  ? `هل أنت متأكد من حذف ${product.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete ${product.elementNumber}? This action cannot be undone.`,
                product.id,
                product.tableName,
                isRTL,
                setIsRefreshing
              );
              setIsSubmitting(false);
              if (res) {
                navigate(-1);
              }
            }}
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            )}
            <Trash2 className="h-4 w-4 sm:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">{isRTL ? "حذف" : "Delete"}</span>
          </Button>

          {(JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Inventory?.update !== false && (
              <Button
                size="sm"
                onClick={() =>
                  handleEdit(product, navigate, `/inventory/warehouses/edit`)
                }
              >
                <Edit className="w-4 h-4 sm:mr-2 rtl:ml-2" />
                <span className="hidden sm:inline">
                  {isRTL ? "تحرير" : "Edit"}
                </span>
              </Button>
            )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? "إجمالي الأصناف" : "Total Items"}
              </p>
              <p className="text-2xl font-bold">{stockStats.totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? "قيمة المخزون" : "Stock Value"}
              </p>
              <p className="text-2xl font-bold">${stockStats.totalValue}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? "مخزون منخفض" : "Low Stock"}
              </p>
              <p className="text-2xl font-bold text-orange-500">
                {stockStats.lowStock}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? "نفذ من المخزون" : "Out of Stock"}
              </p>
              <p className="text-2xl font-bold text-red-500">
                {stockStats.outOfStock}
              </p>
            </div>
            <Boxes className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Warehouse className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? "نظرة عامة" : "Overview"}
            </span>
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? "المخزون" : "Stock"}
            </span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? "الحركات" : "Movements"}
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isRTL ? "الإعدادات" : "Settings"}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {isRTL ? "معلومات الموقع" : "Location Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "العنوان" : "Address"}
                </p>
                <p className="font-medium">{warehouseData?.address || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "المدينة" : "City"}
                </p>
                <p className="font-medium">{warehouseData?.city || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "المحافظة" : "State"}
                </p>
                <p className="font-medium">{warehouseData?.state || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "البلد" : "Country"}
                </p>
                <p className="font-medium">{warehouseData?.country || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {isRTL ? "معلومات الإدارة" : "Management Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "المدير" : "Manager"}
                </p>
                <p className="font-medium">{warehouseData?.manager || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "السعة" : "Capacity"}
                </p>
                <p className="font-medium">{warehouseData?.capacity || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {warehouseData?.depositChoice?.length >= 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {warehouseData?.deposit === "Specific Branch" ? (
                    <>
                      <Warehouse className="h-5 w-5" />
                      <span>{isRTL ? "الفروع المخصصة" : "Assigned Branches"}</span>
                    </>
                  ) : warehouseData?.deposit === "Specific Employee" ? (
                    <>
                      <Users className="h-5 w-5" />
                      <span>{isRTL ? "الموظفون المخصصون" : "Assigned Employees"}</span>
                    </>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {warehouseData?.depositChoice.map(
                    (item, idx) =>
                      item.name !== "" && (
                        <div
                          key={idx}
                          className="p-3 border border-border rounded-lg bg-muted/50"
                        >
                          <p className="font-medium text-sm">{item.name}</p>
                        </div>
                      )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stock Tab */}
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {isRTL ? "عناصر المخزون" : "Stock Items"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{isRTL ? "لا توجد عناصر في المخزون" : "No stock items yet"}</p>
                <p className="text-sm mt-2">
                  {isRTL
                    ? "سيتم عرض عناصر المخزون هنا عند إضافتها"
                    : "Stock items will appear here when added"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {isRTL ? "سجل الحركات" : "Movement History"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{isRTL ? "لا توجد حركات مسجلة" : "No movements recorded"}</p>
                <p className="text-sm mt-2">
                  {isRTL
                    ? "سيتم عرض حركات المخزون (إدخال/إخراج) هنا"
                    : "Stock movements (in/out) will appear here"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {isRTL ? "إعدادات المستودع" : "Warehouse Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">
                    {isRTL ? "تفعيل تتبع المخزون" : "Enable Stock Tracking"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "تتبع حركات المخزون تلقائياً"
                      : "Automatically track stock movements"}
                  </p>
                </div>
                <Badge variant="secondary">
                  {isRTL ? "قريباً" : "Coming Soon"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">
                    {isRTL ? "تنبيهات المخزون المنخفض" : "Low Stock Alerts"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "إرسال تنبيهات عند انخفاض المخزون"
                      : "Send alerts when stock is low"}
                  </p>
                </div>
                <Badge variant="secondary">
                  {isRTL ? "قريباً" : "Coming Soon"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">
                    {isRTL ? "تقارير المخزون" : "Stock Reports"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "إنشاء تقارير دورية للمخزون"
                      : "Generate periodic stock reports"}
                  </p>
                </div>
                <Badge variant="secondary">
                  {isRTL ? "قريباً" : "Coming Soon"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
