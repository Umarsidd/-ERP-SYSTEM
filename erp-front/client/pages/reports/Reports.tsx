import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/animated-button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  BarChart3,
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Briefcase,
  Calculator,
  MessageSquare,
  Coins,
  Clock,
  Activity,
  PieChart,
  Target,
  Settings,
  Truck,
  Globe,
  Store,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ReportAnimatedButton } from "@/components/ui/report-animated-button";

const salesReports = [
  {
    title: "Sales Reports",
    titleAr: "تقارير المبيعات",
    description: "Comprehensive sales performance analytics",
    descriptionAr: "تحليلات شاملة لأداء المبيعات",
    firstAr: "تقارير الفواتير",
    first: "Invoice Reports",
    secondAr: "تقارير المدفوعات",
    second: "Payment Reports",
    thirdAr: "الارباح",
    third: "Profit Reports",
    icon: ShoppingCart,
    href: "/reports/sales",
    gradient: "bg-gradient-to-br from-green-500 to-green-600",
  },
  {
    title: "Purchase Reports",
    titleAr: "تقارير المشتريات",
    description: "Comprehensive purchase performance analytics",
    descriptionAr: "تحليلات شاملة لأداء المشتريات",
    firstAr: "تقارير الفواتير",
    first: "Invoice Reports",
    secondAr: "تقارير المدفوعات",
    second: "Payment Reports",
    thirdAr: "",
    third: "",
    icon: Truck,
    href: "/reports/sales",
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  },
  {
    title: "Accounting Reports",
    titleAr: "التقارير المحاسبية",
    description: "Financial statements and accounting analysis",
    descriptionAr: "البيانات المالية والتحليل المحاسبي",

    firstAr: "", //"القيود اليومية"
    first: "", //Daily Entries
    secondAr: "سندات القبض",
    second: "Receipt Vouchers",
    thirdAr: "المصروفات",
    third: "Expenses",
    icon: Calculator,
    href: "/reports/sales",
    gradient: "bg-gradient-to-br from-violet-600 to-violet-700",
  },

  {
    title: "Inventory Reports",
    titleAr: "تقارير المخزون",
    description: "Stock levels and inventory movement analysis",
    descriptionAr: "مستويات المخزون وتحليل حركة المخزون",

    firstAr: "ورقة الجرد",
    first: "Inventory Sheet",
    secondAr: "حركة المخزون",
    second: "Inventory Movement",
    thirdAr: "",
    third: "",

    icon: Package,
    href: "/reports/sales",
    // gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  },

  {
    title: "Supplier Reports",
    titleAr: "تقارير الموردين",
    description: "Comprehensive supplier performance analytics",
    descriptionAr: "تحليلات شاملة لأداء الموردين",
    firstAr: "كشف حساب الموردين",
    first: "Supplier Statements",
    secondAr: "",
    second: "",
    thirdAr: "",
    third: "",
    icon: Store,
    href: "/reports/sales",
    gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
  },

  {
    title: "Customer Reports",
    titleAr: "تقارير العملاء",
    description: "Comprehensive customer performance analytics",
    descriptionAr: "تحليلات شاملة لأداء العملاء",
    firstAr: "كشف حساب العملاء",
    first: "Customer Statements",
    secondAr: " ",
    second: " ",
    thirdAr: " ",
    third: " ",
    icon: Users,
    href: "/reports/sales",
    gradient: "bg-gradient-to-br from-cyan-600 to-cyan-700",
  },
];


export default function Reports() {
  const { isRTL } = useLanguage();




  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isRTL
              ? "التقارير والتحليلات الشاملة"
              : "Comprehensive Reports & Analytics"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {isRTL
              ? "تقارير شاملة وتحليلات ذكية لجميع أقسام النظام"
              : "Comprehensive reports and intelligent analytics for all system modules"}
          </p>
        </div>
      </div>

      {/* Sales & Financial Reports */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {salesReports.map((report, index) => (
            <ReportAnimatedButton
              key={report.title}
              {...report}
              isRTL={isRTL}
              delay={index * 100}
            />
          ))}
        </div>
      </div>

      {/* Operational Reports */}
      {/* <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "التقارير التشغيلية" : "Operational Reports"}
          </h2>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            {isRTL ? "عرض الكل" : "View All"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {operationalReports.map((report, index) => (
            <AnimatedButton
              key={report.title}
              {...report}
              isRTL={isRTL}
              delay={index * 100}
            />
          ))}
        </div>
      </div> */}

      {/* Business Intelligence Reports */}
      {/* <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "تقارير ذكاء الأعمال" : "Business Intelligence Reports"}
          </h2>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            {isRTL ? "عرض الكل" : "View All"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {businessReports.map((report, index) => (
            <AnimatedButton
              key={report.title}
              {...report}
              isRTL={isRTL}
              delay={index * 100}
            />
          ))}
        </div>
      </div> */}
    </div>
  );
}
