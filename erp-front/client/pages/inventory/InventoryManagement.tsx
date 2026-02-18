import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/animated-button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChartCard } from '@/components/charts/ChartCard';
import {
  Package,
  Plus,
  Settings,
  Building,
  DollarSign,
  Users,
  ShoppingCart,
  FileText,
  TrendingUp,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Warehouse,
  Tags,
  CreditCard,
  Receipt,
  RotateCcw,
  UserCheck,
  Archive,
} from 'lucide-react';

const inventorySections = [
  {
    title: 'Product Management',
    titleAr: 'إدارة ا��منتجات',
    description: 'Create and manage product catalog',
    descriptionAr: 'إنشاء وإدارة كتالوج المنتجات',
    icon: Package,
    href: '/inventory/products',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    title: 'Warehouse Permissions',
    titleAr: 'صلاحيات المستودعات',
    description: 'Manage warehouse access and permissions',
    descriptionAr: 'إدارة الوصول وصلاحيات المستودعات',
    icon: UserCheck,
    href: '/inventory/warehouse-permissions',
    gradient: 'bg-gradient-to-br from-green-500 to-green-600',
  },
  {
    title: 'Price Lists',
    titleAr: 'قوائم الأسعار',
    description: 'Configure product pricing and lists',
    descriptionAr: 'تكوين تسعير المنتجات والقوائم',
    icon: Tags,
    href: '/inventory/price-lists',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    title: 'Warehouses',
    titleAr: 'المستودعات',
    description: 'Manage warehouse locations',
    descriptionAr: 'إدارة مواقع المستودعات',
    icon: Warehouse,
    href: '/inventory/warehouses',
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
  },
  {
    title: 'Inventory Management',
    titleAr: 'إدارة المخزون',
    description: 'Track and manage stock levels',
    descriptionAr: 'تتبع وإدارة مستويات المخزون',
    icon: Archive,
    href: '/inventory/management',
    gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
  },
  {
    title: 'Inventory Settings',
    titleAr: 'إعدادات المخزون',
    description: 'Configure inventory preferences',
    descriptionAr: 'تكوين تفضيلات المخزون',
    icon: Settings,
    href: '/inventory/settings',
    gradient: 'bg-gradient-to-br from-gray-500 to-gray-600',
  },
  {
    title: 'Product Settings',
    titleAr: 'إعدادات المنتجات',
    description: 'Configure product preferences',
    descriptionAr: 'تكوين تفضيلات المنتجات',
    icon: Settings,
    href: '/inventory/product-settings',
    gradient: 'bg-gradient-to-br from-slate-500 to-slate-600',
  },
];

const purchasesSections = [
  {
    title: 'Purchase Requests',
    titleAr: 'طلبات الشراء',
    description: 'Create and manage purchase requests',
    descriptionAr: 'إنشاء وإدارة طلبات الشراء',
    icon: FileText,
    href: '/purchases/requests',
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  },
  {
    title: 'Quotation Requests',
    titleAr: 'طلبات عروض الأسعار',
    description: 'Handle supplier quotation requests',
    descriptionAr: 'التعامل مع طلبات عروض أسعار الموردين',
    icon: Receipt,
    href: '/purchases/quotation-requests',
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
  },
  {
    title: 'Purchase Quotations',
    titleAr: 'عروض أسعار الشراء',
    description: 'Manage supplier quotations',
    descriptionAr: 'إدارة عروض أسعار الموردين',
    icon: DollarSign,
    href: '/purchases/quotations',
    gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
  },
  {
    title: 'Purchase Orders',
    titleAr: 'أوامر الشراء',
    description: 'Create and track purchase orders',
    descriptionAr: 'إنشاء وتتبع أوامر الشراء',
    icon: ShoppingCart,
    href: '/purchases/orders',
    gradient: 'bg-gradient-to-br from-violet-500 to-violet-600',
  },
  {
    title: 'Purchase Invoices',
    titleAr: 'فواتير الشراء',
    description: 'Manage supplier invoices',
    descriptionAr: 'إدارة فواتير الموردين',
    icon: FileText,
    href: '/purchases/invoices',
    gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
  },
  {
    title: 'Purchase Returns',
    titleAr: 'مردودات الشراء',
    description: 'Handle purchase returns and refunds',
    descriptionAr: 'التعامل مع مردودات الشراء والاسترداد',
    icon: RotateCcw,
    href: '/purchases/returns',
    gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
  },
  {
    title: 'Debit Notices',
    titleAr: 'إشعارات مدينة',
    description: 'Manage debit note transactions',
    descriptionAr: 'إدارة معاملات الإشعارات المدينة',
    icon: CreditCard,
    href: '/purchases/debit-notices',
    gradient: 'bg-gradient-to-br from-rose-500 to-rose-600',
  },
  {
    title: 'Supplier Management',
    titleAr: 'إدارة الموردين',
    description: 'Manage supplier relationships',
    descriptionAr: 'إدارة علاقات الموردين',
    icon: Users,
    href: '/purchases/suppliers',
    gradient: 'bg-gradient-to-br from-lime-500 to-lime-600',
  },
  {
    title: 'Supplier Payments',
    titleAr: 'مدفوعات الموردين',
    description: 'Track and manage supplier payments',
    descriptionAr: 'تتبع وإدارة مدفوعات الموردين',
    icon: DollarSign,
    href: '/purchases/supplier-payments',
    gradient: 'bg-gradient-to-br from-sky-500 to-sky-600',
  },
  {
    title: 'Purchase Invoice Settings',
    titleAr: 'إعدادات فواتير الشراء',
    description: 'Configure purchase invoice preferences',
    descriptionAr: 'تكوين تفضيلات فواتير الشراء',
    icon: Settings,
    href: '/purchases/invoice-settings',
    gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
  },
  {
    title: 'Supplier Settings',
    titleAr: 'إعدادات الموردين',
    description: 'Configure supplier management preferences',
    descriptionAr: 'تكوين تفضيلات إدارة الموردين',
    icon: Settings,
    href: '/purchases/supplier-settings',
    gradient: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
  },
];

const inventoryStats = [
  {
    title: 'Total Products',
    titleAr: 'إجمالي المنتجات',
    value: '2,847',
    change: '+45 this month',
    changeType: 'increase' as const,
    icon: Package,
    color: 'bg-primary',
  },
  {
    title: 'Low Stock Items',
    titleAr: 'المواد منخفضة المخزون',
    value: '23',
    change: '-8 from last week',
    changeType: 'decrease' as const,
    icon: AlertCircle,
    color: 'bg-warning',
  },
  {
    title: 'Purchase Orders',
    titleAr: 'أوامر الشراء',
    value: '156',
    change: '+12% this month',
    changeType: 'increase' as const,
    icon: ShoppingCart,
    color: 'bg-success',
  },
  {
    title: 'Total Suppliers',
    titleAr: 'إجمالي الموردين',
    value: '89',
    change: '+6 new suppliers',
    changeType: 'increase' as const,
    icon: Users,
    color: 'bg-info',
  },
];

const inventoryData = {
  labels: ['In Stock', 'Low Stock', 'Out of Stock', 'On Order'],
  datasets: [
    {
      data: [65, 15, 8, 12],
      backgroundColor: [
        'hsl(142, 76%, 36%)',
        'hsl(38, 92%, 50%)',
        'hsl(0, 84%, 60%)',
        'hsl(199, 89%, 48%)',
      ],
      borderWidth: 0,
    },
  ],
};

const purchaseTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Purchase Orders',
      data: [25, 32, 28, 41, 35, 48],
      borderColor: 'hsl(231, 69%, 59%)',
      backgroundColor: 'hsla(231, 69%, 59%, 0.1)',
      fill: true,
    },
    {
      label: 'Delivered',
      data: [20, 28, 25, 38, 32, 45],
      borderColor: 'hsl(142, 76%, 36%)',
      backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
      fill: true,
    },
  ],
};

const recentActivities = [
  {
    id: 1,
    type: 'product',
    titleEn: 'New product "Wireless Headphones" added to inventory',
    titleAr: 'تمت إضافة منتج جديد "سماعات لاسلكية" للمخزون',
    time: '10 minutes ago',
    timeAr: 'منذ 10 دقائق',
  },
  {
    id: 2,
    type: 'purchase',
    titleEn: 'Purchase Order #PO-2024-089 received from TechCorp',
    titleAr: 'تم استلام أمر الشراء #PO-2024-089 من TechCorp',
    time: '45 minutes ago',
    timeAr: 'منذ 45 دقيقة',
  },
  {
    id: 3,
    type: 'supplier',
    titleEn: 'New supplier "Global Electronics" registered',
    titleAr: 'تم تسجيل مورد جديد "Global Electronics"',
    time: '2 hours ago',
    timeAr: 'منذ ساعتين',
  },
  {
    id: 4,
    type: 'warehouse',
    titleEn: 'Stock level alert: 5 items below minimum threshold',
    titleAr: 'تنبيه مستوى المخزون: 5 عناصر أقل من الحد الأدنى',
    time: '3 hours ago',
    timeAr: 'منذ 3 ساعات',
  },
];

export default function InventoryManagement() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const language = localStorage.getItem('language');
    setIsRTL(language === 'ar');
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'إدارة المخزون والمشتريات الشاملة' : 'Comprehensive Inventory & Purchases Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL 
              ? 'إدارة شاملة للمنتجات والمستودعات والموردين وأوامر الشراء'
              : 'Complete management of products, warehouses, suppliers, and purchase orders'
            }
          </p>
        </div>
        <Link
          to="/inventory/products/new"
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isRTL ? 'منتج جديد' : 'New Product'}</span>
        </Link>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventoryStats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            {...stat}
            isRTL={isRTL}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Inventory Status Distribution"
          titleAr="توزيع حالة المخزون"
          type="doughnut"
          data={inventoryData}
          isRTL={isRTL}
          height={300}
        />
        <ChartCard
          title="Purchase Trends"
          titleAr="اتجاهات الشراء"
          type="line"
          data={purchaseTrendData}
          isRTL={isRTL}
          height={300}
        />
      </div>

      {/* Inventory Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? 'إدارة المخزون' : 'Inventory Management'}
          </h2>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            {isRTL ? 'عرض الكل' : 'View All'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {inventorySections.map((section, index) => (
            <AnimatedButton
              key={section.title}
              {...section}
              isRTL={isRTL}
              delay={index * 100}
            />
          ))}
        </div>
      </div>

      {/* Purchases Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? 'إدارة المشتريات' : 'Purchases Management'}
          </h2>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            {isRTL ? 'عرض الكل' : 'View All'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {purchasesSections.map((section, index) => (
            <AnimatedButton
              key={section.title}
              {...section}
              isRTL={isRTL}
              delay={index * 100}
            />
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {isRTL ? 'ملخص المخزون' : 'Inventory Summary'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium">{isRTL ? 'المنتجات المتوفرة' : 'Available Products'}</span>
              </div>
              <span className="text-lg font-bold text-success">2,456</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span className="font-medium">{isRTL ? 'تحتاج إعادة طلب' : 'Need Reorder'}</span>
              </div>
              <span className="text-lg font-bold text-warning">23</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Warehouse className="w-5 h-5 text-info" />
                <span className="font-medium">{isRTL ? 'المستودعات النشطة' : 'Active Warehouses'}</span>
              </div>
              <span className="text-lg font-bold text-info">8</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {isRTL ? 'ملخص المشتريات' : 'Purchases Summary'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="font-medium">{isRTL ? 'أوامر الشراء النشطة' : 'Active Purchase Orders'}</span>
              </div>
              <span className="text-lg font-bold text-primary">45</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium">{isRTL ? 'تم التسليم' : 'Delivered'}</span>
              </div>
              <span className="text-lg font-bold text-success">112</span>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-muted/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-medium text-foreground block">{isRTL ? 'إجمالي المشتريات' : 'Total Purchases'}</span>
                <span className="text-lg font-bold text-foreground">$186,750</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {isRTL ? 'ملخص الموردين' : 'Suppliers Summary'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium">{isRTL ? 'موردون نشطون' : 'Active Suppliers'}</span>
              </div>
              <span className="text-lg font-bold text-success">67</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Users className="w-5 h-5 text-info" />
                <span className="font-medium">{isRTL ? 'موردون جدد' : 'New Suppliers'}</span>
              </div>
              <span className="text-lg font-bold text-info">6</span>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-muted/30 rounded-lg">
              <Target className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-medium text-foreground block">{isRTL ? 'متوسط التقييم' : 'Average Rating'}</span>
                <span className="text-lg font-bold text-foreground">4.7/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">
            {isRTL ? 'النشاط الأخير في المخزون والمشتريات' : 'Recent Inventory & Purchases Activity'}
          </h3>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            {isRTL ? 'عرض الكل' : 'View All'}
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'product' ? 'bg-primary/10' :
                  activity.type === 'purchase' ? 'bg-success/10' :
                  activity.type === 'supplier' ? 'bg-info/10' : 'bg-warning/10'
                }`}>
                  {activity.type === 'product' && <Package className="w-4 h-4 text-primary" />}
                  {activity.type === 'purchase' && <ShoppingCart className="w-4 h-4 text-success" />}
                  {activity.type === 'supplier' && <Users className="w-4 h-4 text-info" />}
                  {activity.type === 'warehouse' && <AlertCircle className="w-4 h-4 text-warning" />}
                </div>
                <span className="text-sm text-foreground">
                  {isRTL ? activity.titleAr : activity.titleEn}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isRTL ? activity.timeAr : activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
