import { useState, useEffect } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  ShoppingCart,
  Users,
  Package,
  Calculator,
  UserCheck,
  BarChart3,
  DollarSign,
  TrendingUp,
  Building2,
  Calendar,
  Clock,
  Target,
  Plus,
  FileText,
  CreditCard,
  UserPlus,
  ClipboardList,
  Briefcase,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@assets/logo4.png";
import { commonApi } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency } from "@/data/data";
import { authApi } from "@/lib/authApi";

// Sales Dashboard Quick Actions
const salesQuickActions = [
  {
    title: "Create Sales Invoice",
    titleAr: "إنشاء فاتورة مبيعات",
    description: "Generate a new sales invoice",
    descriptionAr: "إنشاء فاتورة مبيعات جديدة",
    icon: FileText,
    href: "/sales/invoices/create-invoice",
    gradient: "bg-gradient-to-br from-green-500 to-green-600",
  },

  {
    title: "New Customer",
    titleAr: "عميل جديد",
    description: "Add a new customer to the system",
    descriptionAr: "إضافة عميل جديد إلى النظام",
    icon: UserPlus,
    href: "/customers/new",
    gradient: "bg-gradient-to-br from-cyan-600 to-cyan-700",
  },
  {
    title: "Add New Entry",
    titleAr: " إضافة قيد جديد",
    description: " Record a new accounting entry",
    descriptionAr: "تسجيل إدخال محاسبي جديد",
    icon: Briefcase,
    href: "/accounts/daily-entries/add-entry",
    gradient: "bg-gradient-to-br from-violet-600 to-violet-700",
  },
  {
    title: "Add New Product",
    titleAr: "اضافة منتج جديد",
    description: "Start a new sales transaction",
    descriptionAr: "بدء معاملة بيع جديدة",
    icon: ShoppingCart,
    href: "/inventory/products/new",
    gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  },
];

const statsData2 = [
  {
    title: "Total Sales",
    titleAr: "إجمالي المبيعات",
    value: "$0",
    change: "+12.5%",
    changeType: "increase" as const,
    icon: DollarSign,
    color: "bg-gradient-to-br from-green-500 to-green-600",
  },
  {
    title: "Customers",
    titleAr: "العملاء النشطون",
    value: "0",
    change: "+8.2%",
    changeType: "increase" as const,
    icon: Users,
    color: "bg-gradient-to-br from-cyan-600 to-cyan-700",
  },
  {
    title: "Pending Orders",
    titleAr: "الطلبات المعلقة",
    value: "0",
    change: "-5.4%",
    changeType: "decrease" as const,
    icon: Clock,
    color: "bg-gradient-to-br from-violet-600 to-violet-700",
  },
  {
    title: "Products",
    titleAr: "المنتجات",
    value: "0",
    change: "+15.3%",
    changeType: "increase" as const,
    icon: Target,
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  },
];

// Pre-configured chart data
const salesChartData2 = {
  labels: [],
  datasets: [
    {
      label: "Sales",
      data: [],
      borderColor: "hsl(184, 32%, 37%)",
      backgroundColor: "hsla(184, 32%, 37%, 0.1)",
      fill: true,
    },
    // {
    //   label: 'Target',
    //   data: [15000, 20000, 18082, 24000, 25000, 28082],
    //   borderColor: 'hsl(142, 76%, 36%)',
    //   backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
    //   fill: false,
    //   borderDash: [5, 5],
    // },
  ],
};


export default function Index() {
  const { isRTL } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [isLoading3, setIsLoading3] = useState(true);
  const [isLoading4, setIsLoading4] = useState(true);
  const [statsData, setStatsData] = useState(statsData2);
  //const [expenseChartData, setExpenseChartData] = useState(expenseChartData2);
  const [salesChartData, setSalesChartData] = useState(salesChartData2);

  // const [customers, setCustomers] = useState([]);
  //   const [invoicesTotalAmount, setInvoicesTotalAmount] = useState([]);
  //     const [invoices, setInvoices] = useState([]);
  // const [stockOrders, setStockOrders] = useState([]);
  // const [products, setProducts] = useState([]);
  // const [totalElementsProducts, setTotalElementsProducts] = useState(0);
  const { formatAmount, convertAmount } = useCurrency();

  const loadInventoryProducts = async () => {
    try {
      setIsLoading4(true);

      var result = await commonApi.getAll(
        1,
        111,
        [],
        {
          field: "id",
          direction: "desc",
          type: "basic",
          json_path: "$.elementNumber",
        },
        "inventory_products",
      );
      //   console.log("inventory_products", result.data);

      // setTotalElementsProducts(result.total);
      setStatsData((prevStats) =>
        prevStats.map((stat) =>
          stat.title === "Products"
            ? { ...stat, value: result.total.toString() }
            : stat,
        ),
      );
      // setProducts(result.data);
    } catch (error) {
    } finally {
      setIsLoading4(false);
    }
  };

  const loadInventoryStockOrder = async () => {
    try {
      setIsLoading3(true);

      var result = await commonApi.getAll(
        1,
        111,
        [],
        {
          field: "id",
          direction: "desc",
          type: "basic",
          json_path: "$.elementNumber",
        },
        "inventory_stock_order",
      );
      //   console.log("inventory_stock_order", result.data);
      //  setStockOrders(result.data);
      const pendingOrders = result.data.filter(
        (order) => order.status === "stockPending",
      );
      setStatsData((prevStats) =>
        prevStats.map((stat) =>
          stat.title === "Pending Orders"
            ? { ...stat, value: pendingOrders.length.toString() }
            : stat,
        ),
      );
    } catch (error) {
    } finally {
      setIsLoading3(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setIsLoading(true);

      var result = await commonApi.getAll(
        1,
        111,
        [],
        {
          field: "id",
          direction: "desc",
          type: "basic",
          json_path: "$.elementNumber",
        },
        "sales_invoices",
      );
      //  console.log("result sales_invoices", result.data);

      if (result.data && result.data.length > 0) {
        // setInvoices(result.data);
        setStatsData((prevStats) =>
          prevStats.map((stat) =>
            stat.title === "Total Sales"
              ? {
                ...stat,
                value: `${result.data.reduce(
                  (sum: number, invoice: any) =>
                    sum +
                    convertAmount(
                      parseFloat(invoice.totalAmount || 0),
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                      ((JSON.parse(invoice.main)?.currency &&
                        JSON.parse(JSON.parse(invoice.main)?.currency)
                          ?.code) ||
                        localStorage.getItem("selectedCurrency")) ??
                      selectedCurrency,
                    ),
                  0,
                )}`,
              }
              : stat,
          ),
        );
        const uniqueByDate = [
          ...new Map(result.data.map((item) => [item.issueDate, item])).values(),
        ];
        setSalesChartData((prevData) => {
          const newData = { ...prevData };
          const labels = uniqueByDate.map((item: any) =>
            new Date(item.issueDate).toLocaleDateString(),
          );

          newData.labels = labels;
          newData.datasets[0].data = uniqueByDate.map((item: any) =>
            convertAmount(
              parseFloat(item.totalAmount) || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              ((JSON.parse(item.main)?.currency &&
                JSON.parse(JSON.parse(item.main)?.currency)?.code) ||
                localStorage.getItem("selectedCurrency")) ??
              selectedCurrency,
            ),
          );
          return newData;
        });

      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setIsLoading2(true);
      var result = await authApi.getAll(
        1,
        111,
        [],
        {
          field: "id",
          direction: "desc",
          type: "basic",
          json_path: "$.elementNumber",
        },
        "users",
        "customer",
      );
      //  console.log("result loadCustomers", result.data);

      if (result.data && result.data.length > 0) {
        // setCustomers(result.data);

        setStatsData((prevStats) =>
          prevStats.map((stat) =>
            stat.title === "Customers"
              ? { ...stat, value: result.data.length.toString() }
              : stat,
          ),
        );
      }
    } catch (error) {
    } finally {
      setIsLoading2(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadInvoices();
    loadInventoryStockOrder();
    loadInventoryProducts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center flex justify-center space-x-2 rtl:space-x-reverse text-primary">
          <img src={logo} alt="logo" className="w-16 h-16 object-contain" />

          {/* <Building2 className="w-8 h-8" /> */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">
            {isRTL
              ? "نظام إدارة الأعمال الشامل"
              : "Complete Business Management System"}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isRTL
            ? "منصة شاملة لإدارة جميع جوانب أعمالك من المبيعات والمشتريات إلى الموارد البشرية والمحاسبة"
            : "A comprehensive platform to manage all aspects of your business from sales and purchases to human resources and accounting"}
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={stat.title}
            {...stat}
            isRTL={isRTL}
            delay={index * 100}
            isLoading={isLoading}
            isLoading2={isLoading2}
            isLoading3={isLoading3}
            isLoading4={isLoading4}
          />
        ))}
      </div>

      {/* Sales Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isRTL ? "الاقسام الاساسية" : "Main Sections"}
            </h2>
            <p className="text-muted-foreground">
              {isRTL
                ? " الوصول السريع إلى الوحدات الرئيسية"
                : "Quick access to main modules"}
            </p>
          </div>
          {/* <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors">
            {isRTL ? "عرض الكل" : "View All"}
          </button> */}
        </div>

        {/* Sales Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {salesQuickActions.map((action, index) => (
            <AnimatedButton
              key={action.title}
              {...action}
              isRTL={isRTL}
              delay={index * 100}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isRTL ? " الرسوم البيانية للمبيعات" : "Sales Charts"}
            </h2>
          </div>
        </div>

        {/* Sales Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {!isLoading && <ChartCard
            title=""
            titleAr=""
            type="line"
            data={salesChartData}
            isRTL={isRTL}
            height={500}
          />}
          {/* <ChartCard
            title=""
            titleAr=""
            type="doughnut"
            data={expenseChartData}
            isRTL={isRTL}
            height={300}
          /> */}

          {/* <ChartCard
            title="Expense Distribution"
            titleAr="توزيع المصروفات"
            type="bar"
            data={hrChartData}
            isRTL={isRTL}
            height={300}
          /> */}
        </div>
      </div>
    </div>
  );
}
