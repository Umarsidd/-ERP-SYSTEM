import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@assets/logo4.png";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  UserCheck,
  Building2,
  FileText,
  Settings,
  BarChart3,
  CreditCard,
  User,
  Store,
  Calendar,
  Briefcase,
  Factory,
  Truck,
  Calculator,
  HeadphonesIcon,
  MessageSquare,
  Zap,
  BookOpen,
  Globe,
  Warehouse,
  icons,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const sidebarSections = [
  {
    title: "Dashboard",
    titleAr: "لوحة التحكم",
    icon: LayoutDashboard,
    href: "/",
  },

  {
    title: "Sales",
    titleAr: "المبيعات",
    href: "/sales",
    icon: ShoppingCart,

    children: [
      {
        title: "Invoice Management",
        titleAr: "إدارة الفواتير",
        href: "/sales/invoices",
      },
      {
        title: "Create Invoice",
        titleAr: "إنشاء فاتورة",
        href: "/sales/invoices/create-invoice",
      },
      {
        title: "Quotations",
        titleAr: "عروض الأسعار",
        href: "/sales/quotations",
      },
      {
        title: "Credit Notices",
        titleAr: "إشعارات دائنة",
        href: "/sales/credit-notices",
        //  pageName={"SalesCreditNotices"}
      },
      {
        title: "Returned Invoices",
        titleAr: "الفواتير المرتجعة",
        href: "/sales/returned-invoices",
      },
      // {
      //   title: "Recurring Invoices",
      //   titleAr: "الفواتير الدورية",
      //   href: "/sales/recurring-invoices",
      // },
      {
        title: "Customer Payments",
        titleAr: "مدفوعات العملاء",
        href: "/sales/payments",
      },
      // { title: 'Sales Settings', titleAr: 'إعدادات المبيعات', href: '/sales/settings' },
    ],
  },

  // {
  //   title: "Point of Sale (POS)",
  //   titleAr: "نقاط البيع",
  //   href: "/pos",
  //   icon: Warehouse,

  //   children: [
  //     { title: "Start Sale", titleAr: "بدء البيع", href: "/pos/start-sale" },
  //     { title: "Sessions", titleAr: "الجلسات", href: "/pos/sessions" },
  //     {
  //       title: "POS Reports",
  //       titleAr: "تقارير نقطة البيع",
  //       href: "/pos/reports",
  //     },
  //     {
  //       title: "POS Settings",
  //       titleAr: "إعدادات نقطة البيع",
  //       href: "/pos/settings",
  //     },
  //   ],
  // },

  {
    title: "Customers",
    titleAr: "العملاء",
    href: "/customers",
    icon: Users,
    pageName: "addNewCustomer",

    children: [
      {
        title: "Customer Management",
        titleAr: "إدارة العملاء",
        href: "/customers/management",
      },
      { title: "Add Customer", titleAr: "إضافة عميل", href: "/customers/new" },
      // {
      //   title: "Customer Contacts",
      //   titleAr: "جهات اتصال العملاء",
      //   href: "/customers/contacts",
      // },
    ],
  },

  {
    title: "Inventory",
    titleAr: "المخزون",
    href: "/inventory",

    icon: Package,
    children: [
      {
        title: "Product",
        titleAr: "المنتجات",
        href: "/inventory/products",
      },
      {
        title: "Warehouses",
        titleAr: "المستودعات",
        href: "/inventory/warehouses",
      },
      {
        title: "Orders",
        titleAr: "إدارة الاذون المخزنية",
        href: "/inventory/stock-orders",
      },

      {
        title: "Price Lists",
        titleAr: "إدارة قوائم الأسعار",
        href: "/inventory/price-lists",
      },

      {
        title: "Inventory Management",
        titleAr: "إدارة الجرد",
        href: "/inventory/inventory",
      },
      {
        title: "Inventory Settings",
        titleAr: "إعدادات المخزون",
        href: "/inventory/settings",
      },
    ],
  },

  {
    title: "Purchases",
    titleAr: "المشتريات",
    href: "/purchase",
    icon: Truck,
    children: [
      {
        title: "Purchase Requests",
        titleAr: "طلبات الشراء",
        href: "/purchase/requests",
      },
      {
        title: "Quotations Order",
        titleAr: "طلبات عروض الأسعار",
        href: "/purchase/order-quotations",
      },

      {
        title: "Quotations",
        titleAr: "عروض الأسعار",
        href: "/purchase/quotations",
      },

      {
        title: "Purchase Orders",
        titleAr: "أوامر الشراء",
        href: "/purchase/orders",
      },
      {
        title: "Purchase Invoices",
        titleAr: "فواتير الشراء",
        href: "/purchase/invoices",
      },

      {
        title: "Purchase Returns",
        titleAr: "مرتجعات المشتريات",
        href: "/purchase/returned-invoices",
      },
      {
        title: "Credit Notices",
        titleAr: "إشعارات دائنة",
        href: "/purchase/credit-notices",
        //  pageName={"PurchaseCreditNotices"}
      },
      {
        title: "Suppliers Payments",
        titleAr: "مدفوعات الموردين",
        href: "/purchase/payments",
      },
      {
        title: "Suppliers Management",
        titleAr: "ادارة الموردين",
        href: "/suppliers",
      },
    ],
  },

  {
    title: "Finance",
    titleAr: "المالية",
    icon: Calculator,
    href: "/finance",
    children: [
      { title: "Expenses", titleAr: "المصروفات", href: "/finance/expenses" },
      {
        title: "Receivables",
        titleAr: "سندات القبض",
        href: "/finance/receivables",
      },
      {
        title: "Bank Accounts",
        titleAr: "خزائن وحسابات بنكية",
        href: "/finance/bank-accounts",
      },
    ],
  },

  {
    title: "Installments",
    titleAr: "ادارة التقسيط",
    icon: Zap,
    href: "/installments",
    children: [
      {
        title: "Installment Agreements",
        titleAr: "اتفاقيات التقسيط",
        href: "/installments/agreements",
      },

      // {
      //   title: "Installments",
      //   titleAr: "التقسيط",
      //   href: "/installments/installments",
      // },
    ],
  },

  {
    title: "Accounts",
    titleAr: "الحسابات العامة",
    icon: Briefcase,
    href: "/accounts",
    pageName:"addingEntry",
    children: [
      {
        title: "Daily Entries",
        titleAr: "قيود يومية",
        href: "/accounts/daily-entries",
      },
      {
        title: "Add Entry",
        titleAr: "إضافة قيد",
        href: "/accounts/daily-entries/add-entry",
      },
      {
        title: "Accounts Guide",
        titleAr: "دليل الحسابات",
        href: "/accounts/guide",
      },
      {
        title: "Cost Centers",
        titleAr: "مراكز التكلفة",
        href: "/accounts/cost-centers",
      },
      // {
      //   title: "Assets",
      //   titleAr: "الأصول",
      //   href: "/accounts/assets",
      // },
      // {
      //   title: "Accounts Settings",
      //   titleAr: "إعدادات الحسابات",
      //   href: "/accounts/settings",
      // },
    ],
  },

  {
    title: "Users",
    titleAr: "المستخدمون",
    href: "/users",
    icon: User,
    pageName: "addNewUser",
    children: [
      {
        title: "Users Management",
        titleAr: "إدارة المستخدمين",
        href: "/users/management",
      },
      { title: "Add User", titleAr: "إضافة مستخدم", href: "/users/new" },
      {
        title: "Users Roles",
        titleAr: "أدوار المستخدمين",
        href: "/users/roles",
      },
    ],
  },

  {
    title: "Branches",
    titleAr: "الفروع",
    href: "/branches",
    icon: Warehouse,

    children: [
      {
        title: "Branches Management",
        titleAr: "إدارة الفروع",
        href: "/branches/management",
      },
      { title: "Add Branch", titleAr: "إضافة فرع", href: "/branches/new" },
    ],
  },

  {
    title: "Reports",
    titleAr: "التقارير",
    icon: BarChart3,
    href: "/reports", //reports
  },
  {
    title: "Settings",
    titleAr: "الإعدادات",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const { isRTL } = useLanguage();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  //  const { logo } = useTheme();
  const location = useLocation();

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      //  ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href;
  };

  const isActive2 = (href: string) => {
    //  console.log("Checking active for href:", href.split("/")[1].toString(),"Checking active for href:", location.pathname);
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith("/" + href.split("/")[1].toString());
  };

  return (
    <div
      className={cn(
        " h-screen  sidebar flex flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        isRTL && "border-r-0 border-l",
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div
              className={`
              // logo.logoSize === 'small' ? 'w-6 h-6' :
              // logo.logoSize === 'medium' ? 'w-8 h-8' : 'w-10 h-10'
            bg- rounded-lg flex items-center justify-center overflow-hidden`}
            >
              {/* {logo.logoUrl && logo.logoUrl !== '/placeholder.svg' ? (
                <img src={logo.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : ( */}

              <img src={logo} alt="logo" className="w-14 h-14 object-fill" />

              {/* <Building2 className="w-5 h-5 text-primary-foreground" />
             )} */}
            </div>

            <div>
              <h1 className="font-bold text- text-sidebar-foreground">
                {isRTL ? "نظام إدارة الأعمال" : "ERP System"}
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                {isRTL ? "إدارة شاملة" : "Complete Management"}
              </p>
            </div>

            {/* {logo.showText && (
              <div>
                <h1 className="font-bold text-sidebar-foreground">
                  {logo.logoText}
                </h1>
                <p className="text-xs text-sidebar-foreground/60">
                  {isRTL ? 'إدارة شاملة' : 'Complete Management'}
                </p>
              </div>
            )} */}
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {isCollapsed ? (
            isRTL ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : isRTL ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {sidebarSections.map((section) => {
         //  var x = (JSON.parse(localStorage.getItem("subRole") || "null") as any )?.[section.title]?.view 
                      var create = (
                        JSON.parse(
                          localStorage.getItem("subRole") || "null",
                        ) as any
                      )?.[section.title]?.[section.pageName]; 

         //  if (x===false && section.title !== "Dashboard") return null;
         //  console.log("checking  ",x);
            return (
              <div key={section.title}>
                {section.children ? (
                  <div>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                        "hover:bg-sidebar-accent text-sidebar-foreground",
                        isActive2(section.href || "") &&
                          "bg-sidebar-primary text-sidebar-primary-foreground",
                      )}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <section.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="nav-item">
                            {isRTL ? section.titleAr : section.title}
                          </span>
                        )}
                      </div>
                      {!isCollapsed &&
                        (isRTL ? (
                          <ChevronLeft
                            className={cn(
                              "w-4 h-4 transition-transform",
                              expandedSections[section.title] &&
                                "rotate-[-90deg]",
                            )}
                          />
                        ) : (
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform",
                              expandedSections[section.title] && "rotate-90",
                            )}
                          />
                        ))}
                    </button>
                    {!isCollapsed &&
                      expandedSections[section.title] &&
                       (
                        <div className="ml-6 mt-1 space-y-1 rtl:ml-0 rtl:mr-6">
                          {section.children.map((child) => {
                            if (
                              (
                              //  child.title === "Create Invoice" ||
                               // child.title === "Add Branch" ||
                                child.title === "Add User" ||
                                child.title === "Add Customer" ||
                                child.title === "Add Entry"
                              ) &&
                              create === false
                            )
                              return null;
                            return (
                            <div key={child.title}>
                              <Link
                                to={child.href}
                                className={cn(
                                  "block px-3 py-2 text-xs rounded-lg transition-colors",
                                  "hover:bg-sidebar-accent text-sidebar-foreground",
                                  isActive2(child.href) &&
                                    "bg-sidebar-primary text-sidebar-primary-foreground",
                                  isActive(child.href) && "bg-sidebar-accent",
                                )}
                              >
                                {isRTL ? child.titleAr : child.title}
                              </Link>
                            </div>
                          )})}
                        </div>
                      )}
                  </div>
                ) : (
                  <Link
                    to={section.href}
                    className={cn(
                      "flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 text-sm rounded-lg transition-colors",
                      "hover:bg-sidebar-accent text-sidebar-foreground",
                      isActive2(section.href) &&
                        "bg-sidebar-primary text-sidebar-primary-foreground",
                    )}
                  >
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="nav-item">
                        {isRTL ? section.titleAr : section.title}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
