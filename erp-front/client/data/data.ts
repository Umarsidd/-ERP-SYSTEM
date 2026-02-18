export const selectedSymbol = "د.ع"; //  localStorage.getItem("selectedCurrencySymbol")
export const selectedCurrency = "IQD"; //  localStorage.getItem("selectedCurrency")

export const recurrenceList = [
  { nameAr: " اسبوعيا", name: "Weekly" },
  { nameAr: "اسبوعان", name: "2 Weeks" },

  { nameAr: "4 اسابيع", name: "4 Weeks" },

  { nameAr: "شهريا", name: "Monthly" },
  { nameAr: "شهرين", name: "2 Month" },
  { nameAr: "3 شهور", name: "3 Month" },
  { nameAr: "6 شهور", name: "6 Month" },

  { nameAr: "سنوي", name: "Yearly" },
  // { nameAr: "سنتين", name: "2 Year" },
];

export const stockOrdersList = [
  { nameAr: "اضافة", name: "Add" },
  { nameAr: "صرف", name: "Withdraw" },
  { nameAr: "تحويل مخزني", name: "Transfer" },
];

export const activeList = [
  { nameAr: "نشط", name: "Active" },
  { nameAr: "غير نشط", name: "Paused" },
];

export const roleWithdrawDepositList = [
  { nameAr: "مدير", name: "Manager" },
  { nameAr: "موظف", name: "Staff" },
];

export const withdrawDepositList = [
  { nameAr: "الكل", name: "All" },

  { nameAr: "موظف محدد", name: "Specific Employee" },
  //{ nameAr: "دور وظيفي محدد", name: "Specific Role" },
  { nameAr: "فرع محدد", name: "Specific Branch" },
];

export const categories = [
  { nameAr: "صيانة", name: "Maintenance" },
  { nameAr: "مرافق", name: "Facilities" },
  { nameAr: "مقاولة من الباطن", name: "Subcontracting" },
];

export const bankTypes = [
  { nameAr: "بنك", name: "Bank" },
  { nameAr: "خزنة", name: "Safe" },
];

export const stockRequestsStatus = [
  { nameAr: "تحت التسليم", name: "stockPending" },
  { nameAr: "تمت الموافقة", name: "stockApproved" },
  { nameAr: "مرفوض", name: "stockRejected" },
];

export const purchaseRequestsStatus = [
  { nameAr: "معلق", name: "Pending" },
  { nameAr: "موافق", name: "Approved" },
  { nameAr: "مرفوض", name: "Rejected" },
  { nameAr: "مكتمل", name: "Completed" },
  {
    name: "Draft",
    nameAr: "مسودة",
  },
];

export const sortBy = [
  // { nameAr: "عميل", name: "Customer" },
  { nameAr: "الاحدث", name: "Most Recent", field: "id" },
  { nameAr: "اسم المنتج", name: "Product Name", field: "elementNumber" },
  {
    nameAr: "كمية المخزون تصاعديا",
    name: "Inventory Ascending",
    field: "stockQuantityAsc",
  },
  {
    nameAr: "كمية المخزون تنازليا",
    name: "Inventory Descending",
    field: "stockQuantity",
  },
];

export const invoicesType = [
  // { nameAr: "عميل", name: "Customer" },
  { nameAr: "موظف", name: "Employee" },
  { nameAr: "سنوي", name: "Yearly" },
  { nameAr: "شهري", name: "Monthly" },
  { nameAr: "اسبوعي", name: "Weekly" },
  { nameAr: "يومي", name: "Daily" },
];

export const invoicesStatus = [
  { nameAr: "مدفوع", name: "Paid" },
  { nameAr: "غير مدفوع", name: "Unpaid" },
  { nameAr: "مدفوع جزئيا", name: "PartiallyPaid" },
  { nameAr: "مدفوع بالزيادة", name: "PaidByExcess" },

  {
    name: "Draft",
    nameAr: "مسودة",
  },
];

export const productUnits = [
  { nameAr: "قطعة", name: "Piece" },
  // { nameAr: "اختر الوحدة", name: "Select unit" },
  { nameAr: "كيلوغرام (كغ)", name: "Kilogram (kg)" },
  { nameAr: "غرام (غ)", name: "Gram (g)" },
  { nameAr: "رطل (رطل)", name: "Pound (lb)" },
];

export const warehouseStatuses = [
  // { value: "", label: "Select status", labelAr: "اختر الحالة" },
  { value: "Main", label: "Main", labelAr: "رئيسي" },
  { value: "Active", label: "Active", labelAr: "نشط" },
  { value: "Inactive", label: "Inactive", labelAr: "غير نشط" },
  // { value: "Pending", label: "Pending", labelAr: "قيد الانتظار" },
];

export const productStatuses = [
  { value: "", label: "Select status", labelAr: "اختر الحالة" },
  { value: "Active", label: "Active", labelAr: "نشط" },
  { value: "Inactive", label: "Inactive", labelAr: "غير نشط" },
  { value: "Pending", label: "Pending", labelAr: "قيد الانتظار" },
];

export const statusList = [
  {
    name: "Completed",
    nameAr: "مكتمل",
  },
  {
    name: "Pending",
    nameAr: "قيد الانتظار",
  },
  {
    name: "Processing",
    nameAr: "تحت المراجعة",
  },
  {
    name: "Failed",
    nameAr: "فاشلة",
  },
  {
    name: "Draft",
    nameAr: "مسودة",
  },
];

export const paymentList = [
  {
    name: "CreditCard",
    nameAr: "بطاقة ائتمان",
  },
  {
    name: "BankTransfer",
    nameAr: "تحويل بنكي",
  },
  {
    name: "Cash",
    nameAr: "نقدي",
  },
  {
    name: "Check",
    nameAr: "شيك",
  },
  {
    name: "PayPal",
    nameAr: "باي بال",
  },
];

export const mockCustomers = [
  {
    id: "1",
    name: "Ahmed Mohamed Corporation",
    nameAr: "شركة أحمد محمد",
    email: "ahmed@company.com",
    phone: "+966 11 123 4567",
    address: "King Fahd Road, Riyadh, Saudi Arabia",
    addressAr: "طريق الملك فهد، الرياض، المملكة العربية السعودية",
    taxNumber: "123456789000003",
  },
  {
    id: "2",
    name: "Sara Ali Trading",
    nameAr: "تجارة سارة علي",
    email: "sara@trading.com",
    phone: "+971 4 987 6543",
    address: "Sheikh Zayed Road, Dubai, UAE",
    addressAr: "شارع الشيخ زايد، دبي، الإمارات العربية المتحدة",
    taxNumber: "987654321000001",
  },
  {
    id: "3",
    name: "Abdullah Tech Solutions",
    nameAr: "حلول عبدالله التقنية",
    email: "info@abdullahtech.com",
    phone: "+966 11 555 9999",
    address: "Olaya District, Riyadh, Saudi Arabia",
    addressAr: "حي العليا، الرياض، المملكة العربية السعودية",
    taxNumber: "456789123000002",
  },
];

export const mockSalesReps = [
  {
    id: "1",
    name: "Sarah Ahmed",
    nameAr: "سارة أحمد",
    email: "sarah@company.com",
    commission: 5,
  },
  {
    id: "2",
    name: "Mohamed Hassan",
    nameAr: "محمد حسن",
    email: "mohamed@company.com",
    commission: 4.5,
  },
  {
    id: "3",
    name: "Nora Mohamed",
    nameAr: "نورا محمد",
    email: "nora@company.com",
    commission: 6,
  },
];

export const mockProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    nameAr: "آيفون 15 برو ماكس",
    description: "256GB Space Black",
    price: 1200,
    category: "Electronics",
    stock: 50,
  },
  {
    id: "2",
    name: "MacBook Pro 16-inch",
    nameAr: "ماك بوك برو 16 بوصة",
    description: "M3 Pro chip, 512GB SSD",
    price: 2499,
    category: "Electronics",
    stock: 25,
  },
  {
    id: "3",
    name: "Office Chair Premium",
    nameAr: "كرسي مكتب مميز",
    description: "Ergonomic design with lumbar support",
    price: 450,
    category: "Furniture",
    stock: 100,
  },
  {
    id: "4",
    name: "Wireless Headphones",
    nameAr: "سماعات لاسلكية",
    description: "Noise cancelling, 30hr battery",
    price: 299,
    category: "Electronics",
    stock: 75,
  },
];

export const mockPaymentTerms = [
  {
    id: "1",
    name: "Due on Receipt",
    nameAr: "عند الاستلام",
    days: 0,
  },

  {
    id: "2",
    name: "Net 60",
    nameAr: "60 يوم",
    days: 60,
  },
  {
    id: "3",
    name: "Net 15",
    nameAr: "15 يوم",
    days: 15,
  },

  {
    id: "4",
    name: "Net 30",
    nameAr: "30 يوم",
    days: 30,
  },
];

export interface Permission {
  [section: string]: {
    [operation: string]: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  nameAr: string;
  permissions: Permission;
  description: string;
  descriptionAr: string;
  createdAt: string;
}

export interface FormData {
  id?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  permissions: Permission;
}

export const siteSections = {
  Inventory: {
    name: "Inventory",
    nameAr: "المخزون",
    icon: "📦",
    operations: [
      "addNewProduct",
      //  "viewAllProducts",
      "viewHisProducts",
      "editAndDeleteAllProducts",
      "editAndDeleteHisProducts",
      "priceListDisplay",
      "addEditPriceList",
      "deletePriceList",

      "addStockOrder",
      "updateStockOrder",
      "displayStockOrder",

      "approvalRejectionOrder",
    ],
  },
  Sales: {
    name: "Sales",
    nameAr: "المبيعات",
    icon: "💰",
    operations: [
      "createInvoicesAllCustomers",
      "createInvoicesHisCustomers",
      "deletingAndEditingAllInvoices",
      "deletingAndEditingHisInvoices",
      //"viewAllInvoices",
      "viewHisInvoices",
      "invoiceDateModification",
      "addPaymentHisInvoices",
      "addPaymentAllInvoices",
      "deletingAndEditingAllPayments",
      "deletingAndEditingHisPayments",

      "addPriceQuoteAllCustomers",
      "addPriceQuoteHisCustomers",
      // "viewAllPriceQuotes",
      "viewHisPriceQuotes",
      "deletingAndEditingAllPriceQuotes",
      "deletingAndEditingHisPriceQuotes",

      "addingCreditNoticeForAllCustomers",
      "addingCreditNoticeForHisCustomers",
      //"viewingAllCreditNotices",
      "viewingHisCreditNotices",
      "deletingAndEditingAllCreditNotices",
      "deletingAndEditingHisCreditNotices",
    ],
  },

  Purchases: {
    name: "Purchases",
    nameAr: "المشتريات",
    icon: "🛒",
    operations: [
      "createInvoicesAllCustomers",
      "createInvoicesHisCustomers",
      "deletingAndEditingAllInvoices",
      "deletingAndEditingHisInvoices",
      //   "viewAllInvoices",
      "viewHisInvoices",
      "invoiceDateModification",
      "addPaymentHisInvoices",
      "addPaymentAllInvoices",
      "deletingAndEditingAllPayments",
      "deletingAndEditingHisPayments",

      "addPriceQuoteAllCustomers",
      "addPriceQuoteHisCustomers",
      /// "viewAllPriceQuotes",
      "viewHisPriceQuotes",
      "deletingAndEditingAllPriceQuotes",
      "deletingAndEditingHisPriceQuotes",

      "addingCreditNoticeForAllCustomers",
      "addingCreditNoticeForHisCustomers",
      // "viewingAllCreditNotices",
      "viewingHisCreditNotices",
      "deletingAndEditingAllCreditNotices",
      "deletingAndEditingHisCreditNotices",

      "addNewSuppliers",
      // "viewAllSuppliers",
      "viewHisSuppliers",
      "editAndDeleteAllSuppliers",
      "editAndDeleteHisSuppliers",
      // "viewAllActivityLogs",
      // "viewHisActivityLog",
    ],
  },

  Finance: {
    name: "Finance",
    nameAr: "المالية",
    icon: "💵",
    operations: [
      "addingExpenses",
      "editAndDeleteAllExpenses",
      "editAndDeleteHisExpenses",
      //"viewAllExpenses",
      "viewHisExpenses",

      // "viewHisPrivateClosets",
      // "editVirtualTreasury",

      "addingReceipts",
      "editAndDeleteAllReceipts",
      "editAndDeleteHisReceipts",
      // "viewAllReceipts",
      "viewHisReceipts",
    ],
  },

  Accounts: {
    name: "Accounts",
    nameAr: "المحاسبة",
    icon: "📊",
    operations: [
      "addingEntry",
      "editAndDeleteAllEntry",
      "editAndDeleteHisEntry",
      //  "viewAllEntry",
      "viewHisEntry",
      // "costCenterManagement",
      // "costCentersPresentation",
    ],
  },
  Users: {
    name: "Users",
    nameAr: "المستخدمون",
    icon: "👥",
    operations: [
      "addNewUser",
      "editAndDeleteUser",
      "addNewRole",
      "roleModification",
    ],
  },

  Customers: {
    name: "Customers",
    nameAr: "العملاء",
    icon: "👤",
    operations: [
      "addNewCustomer",
      // "viewAllCustomers",
      "viewHisCustomers",
      "editAndDeleteAllCustomers",
      "editAndDeleteHisCustomers",
      // "viewAllActivityLogs",
      //   "viewHisActivityLog",
    ],
  },
  // suppliers: {
  //   name: "Suppliers",
  //   nameAr: "الموردون",
  //   icon: "🚚",
  //   operations: ["view", "create", "update", "delete"],
  // },
  // Reports: {
  //   name: "Reports",
  //   nameAr: "التقارير",
  //   icon: "📈",
  //   operations: ["view", "create", "update", "delete"],
  // },
  // Settings: {
  //   name: "Settings",
  //   nameAr: "الإعدادات",
  //   icon: "⚡",
  //   operations: ["view", "create", "update", "delete"],
  // },

  // Branches: {
  //   name: "Branches",
  //   nameAr: "الفروع",
  //   icon: "🏢",
  //   operations: ["view", "create", "update", "delete"],
  // },

  // Installments: {
  //   name: "Installments",
  //   nameAr: "الأقساط",
  //   icon: "🗓️",
  //   operations: ["view", "create", "update", "delete"],
  // },
};
export const SAMPLE_ROLES: Role[] = [
  {
    id: "role_1",
    name: "Editor",
    nameAr: "مدير النظام",
    description: "Full system access",
    descriptionAr: "الوصول الكامل للنظام",
    permissions: Object.keys(siteSections).reduce((acc, section) => {
      acc[section] = Object.fromEntries(
        siteSections[section as keyof typeof siteSections].operations.map(
          (op) => [op, true],
        ),
      );
      return acc;
    }, {} as Permission),
    createdAt: "2024-01-01",
  },
  {
    id: "role_2",
    name: "Sales Manager",
    nameAr: "مدير المبيعات",
    description: "Manages sales operations",
    descriptionAr: "إدارة عمليات المبيعات",
    permissions: {
      Inventory: {
        create: true,
        update: true,
        delete: false,
        view: true,
      },
    },
    createdAt: "2024-01-10",
  },
];

export const operationTranslations: {
  [key: string]: { name: string; nameAr: string };
} = {
  addingEntry: {
    name: "Adding entry",
    nameAr: "إضافة قيد",
  },
  editAndDeleteAllEntry: {
    name: "Edit and delete all entries",
    nameAr: "تعديل وحذف كل القيود",
  },

  editAndDeleteHisEntry: {
    name: "Edit and delete his entries",
    nameAr: "تعديل وحذف القيود الخاصة به",
  },

  viewAllEntry: {
    name: "View all entries",
    nameAr: "عرض جميع القيود",
  },
  viewHisEntry: {
    name: "View his entries",
    nameAr: "عرض قيوده الخاصة به",
  },

  costCenterManagement: {
    name: "Cost Center Management",
    nameAr: "إدارة مراكز التكلفة",
  },
  costCentersPresentation: {
    name: "Cost Centers Presentation",
    nameAr: "عرض مراكز التكلفة",
  },

  addingExpenses: {
    name: "Adding expenses",
    nameAr: "إضافة مصروف",
  },
  editAndDeleteAllExpenses: {
    name: "Edit and delete all expenses",
    nameAr: "تعديل وحذف كل المصروفات",
  },

  editAndDeleteHisExpenses: {
    name: "Edit and delete his expenses",
    nameAr: "تعديل وحذف المصروفات الخاصة به",
  },

  viewAllExpenses: {
    name: "View all expenses",
    nameAr: "عرض جميع المصروفات",
  },
  viewHisExpenses: {
    name: "View his expenses",
    nameAr: "عرض مصروفاته الخاصة به",
  },

  viewHisPrivateClosets: {
    name: "View his private closets",
    nameAr: "عرض خزائنه الخاصة",
  },

  editVirtualTreasury: {
    name: "Edit virtual treasury",
    nameAr: "تعديل الخزينة الافتراضية",
  },

  addingReceipts: {
    name: "Adding receipts",
    nameAr: "إضافة إيصال",
  },
  editAndDeleteAllReceipts: {
    name: "Edit and delete all receipts",
    nameAr: "تعديل وحذف كل الإيصالات",
  },

  editAndDeleteHisReceipts: {
    name: "Edit and delete his receipts",
    nameAr: "تعديل وحذف الإيصالات الخاصة به",
  },

  viewAllReceipts: {
    name: "View all receipts",
    nameAr: "عرض جميع الإيصالات",
  },
  viewHisReceipts: {
    name: "View his receipts",
    nameAr: "عرض إيصالاته الخاصة به",
  },

  approvalRejectionOrder: {
    name: "Approval of Stock Order request / Rejection of Stock Order request",
    nameAr: "الموافقة على الطلب المخزني/ رفض الطلب المخزني",
  },

  addNewSuppliers: {
    name: "Add a new supplier",
    nameAr: "إضافة مورد جديد",
  },

  viewAllSuppliers: {
    name: "View all suppliers",
    nameAr: "عرض جميع الموردين",
  },

  viewHisSuppliers: {
    name: "View his suppliers",
    nameAr: "عرض الموردين الذين تم إنشائهم",
  },

  editAndDeleteAllSuppliers: {
    name: "Edit and delete all suppliers",
    nameAr: "تعديل وحذف جميع الموردين",
  },

  editAndDeleteHisSuppliers: {
    name: "Edit and delete his suppliers",
    nameAr: "تعديل وحذف الموردين الخاصة به",
  },

  // viewAllActivityLogs: {
  //   name: "View all activity logs",
  //   nameAr: "عرض جميع سجلات الأنشطة",
  // },

  // viewHisActivityLog: {
  //   name: "View his activity log",
  //   nameAr: "عرض سجل نشاطه",
  // },

  /////
  addStockOrder: {
    name: "Add stock order",
    nameAr: "إضافة إذن مخزني",
  },
  updateStockOrder: {
    name: "Update stock order",
    nameAr: "تعديل الإذن المخزني",
  },
  displayStockOrder: {
    name: "Display stock order",
    nameAr: "عرض الإذن المخزني",
  },

  addNewUser: {
    name: "Add a new user",
    nameAr: "إضافة مستخدم جديد",
  },

  editAndDeleteUser: {
    name: "Edit and delete user",
    nameAr: "تعديل وحذف المستخدم",
  },

  addNewRole: {
    name: "Add a new role",
    nameAr: "إضافة دور وظيفي جديد",
  },

  roleModification: {
    name: "Role modification",
    nameAr: "تعديل دور وظيفي",
  },

  addNewCustomer: {
    name: "Add a new customer",
    nameAr: "إضافة عميل جديد",
  },

  viewAllCustomers: {
    name: "View all customers",
    nameAr: "عرض جميع العملاء",
  },

  viewHisCustomers: {
    name: "View his customers",
    nameAr: "عرض عملائه",
  },

  editAndDeleteAllCustomers: {
    name: "Edit and delete all customers",
    nameAr: "تعديل وحذف جميع العملاء",
  },

  editAndDeleteHisCustomers: {
    name: "Edit and delete his customers",
    nameAr: "تعديل وحذف العملاء الخاصة به",
  },

  viewAllActivityLogs: {
    name: "View all activity logs",
    nameAr: "عرض جميع سجلات الأنشطة",
  },

  viewHisActivityLog: {
    name: "View his activity log",
    nameAr: "عرض سجل نشاطه",
  },

  deletePriceList: {
    name: "Delete price list",
    nameAr: "حذف قوائم ألاسعار",
  },

  priceListDisplay: {
    name: "Price list display",
    nameAr: "عرض قوائم ألاسعار",
  },

  addEditPriceList: {
    name: "Add/Edit Price List",
    nameAr: "إضافة/تعديل قوائم ألاسعار",
  },

  editAndDeleteHisProducts: {
    name: "Edit and delete his products",
    nameAr: "تعديل وحذف المنتجات الخاصة به",
  },

  editAndDeleteAllProducts: {
    name: "Edit and delete all products",
    nameAr: "تعديل وحذف كل المنتجات",
  },

  addNewProduct: {
    name: "Add a new product",
    nameAr: "إضافة منتج جديد",
  },

  viewHisProducts: {
    name: "View his products",
    nameAr: "عرض المنتجات الخاصة به",
  },
  viewAllProducts: {
    name: "View all products",
    nameAr: "عرض كل المنتجات",
  },

  createInvoicesAllCustomers: {
    name: "Add invoices for all customers",
    nameAr: "إضافة فواتير لكل العملاء",
  },
  createInvoicesHisCustomers: {
    name: "Add invoices for his customers",
    nameAr: "إضافه فواتير للعملاء الخاصة به",
  },

  deletingAndEditingAllInvoices: {
    name: "Edit and delete all invoices",
    nameAr: "تعديل وحذف كل الفواتير",
  },

  deletingAndEditingHisInvoices: {
    name: "Edit and delete his invoices",
    nameAr: "تعديل وحذف الفواتير الخاصة به",
  },

  viewAllInvoices: { name: "View all invoices", nameAr: "عرض جميع الفواتير" },
  viewHisInvoices: {
    name: "View his invoices",
    nameAr: "عرض فواتيره الخاصة به",
  },

  invoiceDateModification: {
    name: "The invoice date cannot be modified",
    nameAr: "لايمكن تعديل تاريخ الفاتورة",
  },

  addPaymentHisInvoices: {
    name: "Add payment to his invoices",
    nameAr: "إضافة عمليات دفع للفواتير الخاصه به",
  },
  addPaymentAllInvoices: {
    name: "Add payment for all invoices",
    nameAr: "إضافة عمليات دفع لكل الفواتير",
  },

  deletingAndEditingAllPayments: {
    name: "Delete and edit all payments",
    nameAr: "تعديل وحذف جميع المدفوعات",
  },
  deletingAndEditingHisPayments: {
    name: "Delete and edit his payments",
    nameAr: "تعديل وحذف المدفوعات الخاصة به",
  },

  addPriceQuoteAllCustomers: {
    name: "Add a price quote for all customers",
    nameAr: "إضافة عرض سعر لكل العملاء",
  },
  addPriceQuoteHisCustomers: {
    name: "Add a price quote for his customers",
    nameAr: "إضافه عرض سعر للعملاء الخاصة به",
  },

  viewAllPriceQuotes: {
    name: "View all price quotes",
    nameAr: "عرض جميع عروض الأسعار",
  },
  viewHisPriceQuotes: {
    name: "View his price quotes",
    nameAr: "عرض عروض الأسعار الخاصة به",
  },

  deletingAndEditingAllPriceQuotes: {
    name: "Edit and delete price quotes",
    nameAr: "تعديل وحذف عروض الأسعار",
  },
  deletingAndEditingHisPriceQuotes: {
    name: "Edit and delete his price quotes",
    nameAr: "تعديل وحذف عروض اﻷسعار الخاصة به",
  },

  addingCreditNoticeForAllCustomers: {
    name: "Adding credit notice for all customers",
    nameAr: "إضافة إشعار مدين لجميع العملاء",
  },
  addingCreditNoticeForHisCustomers: {
    name: "Adding credit notice for his customers",
    nameAr: "إضافة إشعار مدين جديد لعملائه فقط",
  },

  viewingAllCreditNotices: {
    name: "Viewing all credit notices",
    nameAr: "عرض جميع الإشعارات المدينة",
  },
  viewingHisCreditNotices: {
    name: "Viewing his credit notices",
    nameAr: "عرض الإشعارات المدينة الخاصه به فقط",
  },

  deletingAndEditingAllCreditNotices: {
    name: "Deleting and editing all credit notices",
    nameAr: "تعديل وحذف جميع الإشعارات المدينة",
  },
  deletingAndEditingHisCreditNotices: {
    name: "Deleting and editing his credit notices",
    nameAr: "تعديل وحذف الإشعارات المدينة الخاصة به",
  },

  // delete: { name: "Delete", nameAr: "حذف" },
  // deleteHisInvoices: {
  //   name: "Delete Own Invoices",
  //   nameAr: "حذف فواتيره الخاصة به",
  // },
};

export const emptyForm: FormData = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  permissions: Object.keys(siteSections).reduce((acc, section) => {
    acc[section] = Object.fromEntries(
      siteSections[section as keyof typeof siteSections].operations.map(
        (op) => [op, false],
      ),
    );
    return acc;
  }, {} as Permission),
};

//     const upload = async (
//       files: FileList | null,
//     ) => {
//       if (!files) return;

//       // setIsUploading(true);
//       const formData = new FormData();

//       Array.from(files).forEach((file) => {
//         formData.append("files[]", file);
//       });

//       try {
//         const response = await axios.post(
//           "http://localhost:8082/api/upload",
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           },
//         );
//    //     console.log("attachments", response.data.files);
// return response.data.files;
//       } catch (error) {
//         console.error("Upload error:", error);
//       } finally {

//       }

//     };

//   const validationSchema = Yup.object().shape({
//     elementNumber: Yup.string().required(
//       isRTL ? "رقم الفاتورة مطلوب" : "Invoice number is required",
//     ),
//     customerId: Yup.string().required(
//       isRTL ? "اختيار العميل مطلوب" : "Customer selection is required",
//     ),
//     salesRepId: Yup.string().required(
//       isRTL ? "مندوب المبيعات مطلوب" : "Sales representative is required",
//     ),
//     paymentTermId: Yup.string().required(
//       isRTL ? "شروط الدفع مطلوبة" : "Payment terms are required",
//     ),
//     issueDate: Yup.date().required(
//       isRTL ? "تاريخ الإصدار مطلوب" : "Issue date is required",
//     ),
//     dueDate: Yup.date()
//       .min(
//         Yup.ref("issueDate"),
//         isRTL
//           ? "يجب أن يكون تاريخ الاستحقاق بعد تاريخ الإصدار"
//           : "Due date must be after issue date",
//       )
//       .required(isRTL ? "تاريخ الاستحقاق مطلوب" : "Due date is required"),
//     items: Yup.array()
//       .of(
//         Yup.object().shape({
//           productId: Yup.string(), // Optional - user can type custom description
//           description: Yup.string().required(
//             isRTL ? "الوصف مطلوب" : "Description is required",
//           ),
//           quantity: Yup.number()
//             .min(
//               0.01,
//               isRTL
//                 ? "يجب أن تكون الكمية أكبر من 0"
//                 : "Quantity must be greater than 0",
//             )
//             .required(isRTL ? "الكمية مطلوبة" : "Quantity is required"),
//           unitPrice: Yup.number()
//             .min(
//               0,
//               isRTL
//                 ? "يجب أن يكون سعر الوحدة إيجابياً"
//                 : "Unit price must be positive",
//             )
//             .required(isRTL ? "سعر الوحدة مطلوب" : "Unit price is required"),
//           discount: Yup.number().min(
//             0,
//             isRTL ? "يجب أن يكون الخصم إيجابياً" : "Discount must be positive",
//           ),
//           taxRate: Yup.number()
//             .min(0)
//             .max(
//               100,
//               isRTL
//                 ? "لا يمكن أن يتجاوز معدل الضريبة 100%"
//                 : "Tax rate cannot exceed 100%",
//             ),
//         }),
//       )
//       .min(
//         1,
//         isRTL ? "مطلوب عنصر واحد على الأقل" : "At least one item is required",
//       ),
//     //taxRate: Yup.number().min(0).max(100, "Tax rate cannot exceed 100%"),
//     discountValue: Yup.number().min(
//       0,
//       isRTL ? "يجب أن يكون الخصم إيجابياً" : "Discount must be positive",
//     ),
//     shippingCost: Yup.number().min(
//       0,
//       isRTL
//         ? "يجب أن تكون تكلفة الشحن إيجابية"
//         : "Shipping cost must be positive",
//     ),
//     depositAmount: Yup.number().min(
//       0,
//       isRTL
//         ? "يجب أن يكون مبلغ الإيداع إيجابياً"
//         : "Deposit amount must be positive",
//     ),
//   });
