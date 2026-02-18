import Swal from "sweetalert2";


export const simpleCalculateTotals = (values) => {
  const subtotal = values.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const totalItemDiscounts = values.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    return (
      sum +
      (item.discountType === "percentage"
        ? itemSubtotal * (item.discount / 100)
        : item.discount)
    );
  }, 0);

  const total = subtotal - totalItemDiscounts;

  const totalTax = values.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount =
      item.discountType === "percentage"
        ? itemSubtotal * (item.discount / 100)
        : item.discount;
    const afterDiscount = itemSubtotal - itemDiscount;
    return sum + afterDiscount * (item.taxRate / 100);
  }, 0);

  return {
    subtotal,
    totalItemDiscounts,
    totalTax,
    total,
  };
};

export const mainFilterReport = async (advancedFilters) => {
  //       {
  //    "field": "main",
  //   "operator": "like",
  //   "value": "QUO-202509-111",
  //   "type": "json",
  //   "json_path": "$.elementNumber",
  //   "andOr":"and"
  //     }
  var filter = [];
  // if (advancedFilters?.hideZeroBalance === true) {
  //   filter.push({
  //     value: advancedFilters?.hideZeroBalance,
  //     type: "json",
  //     field: "main",
  //     operator: "warehouse_name",
  //     json_path: "$.warehouses",
  //     useFor: "hideZeroBalance",
  //     require_stock: advancedFilters?.hideZeroBalance,
  //     andOr: "and",
  //   });
  // } else {
  //   filter = filter.filter((f) => f.useFor !== "hideZeroBalance");
  // }

  if (advancedFilters?.warehouse != "" || advancedFilters?.warehouse === "main") {
    filter.push({
      value: advancedFilters?.warehouse,
      type: "json",
      field: "main",
      operator: "warehouse_name",
      json_path: "$.warehouses",
      useFor: "warehouse",
      andOr: "and",
      require_stock: advancedFilters?.hideZeroBalance,
    });
  } else {
    // Keep warehouse filter if it's explicitly set or if we are in Inventory Sheet/Movement
    // But basic filter logic removes it if not present.
    // However, function.ts logic handles adding to 'filter' array if condition met.
    // The "else" block removes it from existing filter array if it was there?
    // Wait, 'filter' var is local.
    // The issue is existing logic: `filter = filter.filter((f) => f.useFor !== "warehouse");`
    // This is weird because `filter` is empty initially (line 49).
    // Ah, `mainFilterReport` builds a NEW filter array.
    // So the `else` blocks are redundant if `filter` is empty?
    // Let's just follow the pattern.
    filter = filter.filter((f) => f.useFor !== "warehouse");
  }



  if (advancedFilters?.branch.length > 0) {
    filter.push({
      value: advancedFilters?.branch,
      type: "json",
      field: "createdBy",
      operator: "in_json_ids",
      json_path: "$.id",
      useFor: "branch",
      // value: advancedFilters.type,
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "branch");
  }

  // Customer filter
  if (advancedFilters.customer && advancedFilters.customer.id) {
    filter.push({
      field: "main",
      operator: "=",
      value: advancedFilters.customer.id,
      type: "json",
      andOr: "and",
      json_path: "$.customer.id",
      useFor: "customer"
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "customer");
  }

  // Employee filter (multiple)
  if (advancedFilters.employees && advancedFilters.employees.length > 0) {
    const employeeIds = advancedFilters.employees.map(emp => emp.id);
    // console.log("Filtering by employees:", employeeIds);
    filter.push({
      value: employeeIds,
      type: "json",
      field: "createdBy",
      operator: "in_json_ids",
      json_path: "$.id",
      useFor: "employees",
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "employees");
  }

  if (
    advancedFilters?.type === "Customer Statements" ||
    advancedFilters?.type === "Supplier Statements"
  ) {
    filter.push({
      value: advancedFilters?.type,
      type: "json",
      field: "main",
      operator: "groupby",
      json_path: "$.name",
      useFor: "Customer Statements",
      // value: advancedFilters.type,
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "Customer Statements");
  }


  if (advancedFilters?.type != "all") {
    if (advancedFilters?.type === "Customer") {
      filter.push({
        value: "",
        type: "json",
        field: "main",
        operator: "groupby",
        json_path: "$.customer.name",
        useFor: "type",
        // value: advancedFilters.type,
        andOr: "and",
      });
    } else if (advancedFilters?.type === "Employee") {
      filter.push({
        value: "",
        type: "json",
        field: "createdBy",
        operator: "groupby",
        json_path: "$.elementNumber",
        useFor: "type",
        // value: advancedFilters.type,
        andOr: "and",
      });
    } else if (advancedFilters?.type === "Daily") {
      filter.push({
        value: "",
        type: "json",
        field: "main",
        operator: "groupby",
        json_path: "$.issueDate",
        useFor: "type",
        // value: advancedFilters.type,
        andOr: "and",
      });
    } else if (advancedFilters?.type === "Weekly") {
      filter.push({
        value: "week",
        type: "json",
        field: "main",
        operator: "groupby_date",
        json_path: "$.issueDate",
        useFor: "type",
        // value: advancedFilters.type,
        andOr: "and",
      });
    } else if (advancedFilters?.type === "Monthly") {
      filter.push({
        value: "month",
        type: "json",
        field: "main",
        operator: "groupby_date",
        json_path: "$.issueDate",
        useFor: "type",
        // value: advancedFilters.type,
        andOr: "and",
      });
    } else if (advancedFilters?.type === "Yearly") {
      filter.push({
        value: "year",
        type: "json",
        field: "main",
        operator: "groupby_date",
        json_path: "$.issueDate",
        useFor: "type",
        // value: advancedFilters.type,
        andOr: "and",
      });
    }
  } else {
    filter = filter.filter((f) => f.useFor !== "type");
  }

  if (advancedFilters.search != "") {
    filter.push({
      useFor: "search",
      field: "elementNumber",
      operator: "like",
      value: advancedFilters.search,
      type: "basic",
      andOr: "and",
    });
    // Search by Customer Name (for Invoices)
    filter.push({
      useFor: "search",
      field: "main",
      operator: "like",
      value: advancedFilters.search,
      type: "json",
      json_path: "$.customer.name",
      andOr: "or",
    });
    // Search by Product Name / Item Name
    filter.push({
      useFor: "search",
      field: "main",
      operator: "like",
      value: advancedFilters.search,
      type: "json",
      json_path: "$.name",
      andOr: "or",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "search");
  }

  if (advancedFilters.status != "all") {
    filter.push({
      useFor: "status",
      field: "status",
      operator: "=",
      value: advancedFilters.status,
      type: "basic",
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "status");
  }

  if (advancedFilters.dateFrom != "") {
    filter.push({
      useFor: "date",
      field: "issueDate",
      operator: ">",
      value: advancedFilters.dateFrom,
      type: "basic",
      andOr: "and",
    });

    filter.push({
      useFor: "date",
      field: "issueDate",
      operator: "<",
      value: advancedFilters.dateTo,
      type: "basic",
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "date");
  }

  if (advancedFilters.amountFrom != "") {
    filter.push({
      useFor: "amount",
      field: "totalAmount",
      operator: ">=",
      value: advancedFilters.amountFrom,
      type: "basic",
      andOr: "and",
    });

    filter.push({
      useFor: "amount",
      field: "totalAmount",
      operator: "<=",
      value: advancedFilters.amountTo,
      type: "basic",
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "amount");
  }
  return filter;
};

export const mainFilter = async (advancedFilters) => {

  var filter = [];
  if (advancedFilters.search != "") {
    filter.push({
      useFor: "search",
      field: "elementNumber",
      operator: "like",
      value: advancedFilters.search,
      type: "basic",
      andOr: "and",
    });
    // Search by Customer Name (for Invoices)
    filter.push({
      useFor: "search",
      field: "main",
      operator: "like",
      value: advancedFilters.search,
      type: "json",
      json_path: "$.customer.name",
      andOr: "or",
    });
    // Search by Product Name / Item Name
    filter.push({
      useFor: "search",
      field: "main",
      operator: "like",
      value: advancedFilters.search,
      type: "json",
      json_path: "$.name",
      andOr: "or",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "search");
  }

  if (advancedFilters.status != "all") {
    filter.push({
      useFor: "status",
      field: "status",
      operator: "=",
      value: advancedFilters.status,
      type: "basic",
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "status");
  }
//   if (advancedFilters.barcode !== "") {
//   filter.push({
//     useFor: "barcode",
//     field: "barcode",
//     operator: "=",
//     value: advancedFilters.barcode,
//     type: "basic",
//     andOr: "and",
//   });
// } else {
//   filter = filter.filter((f) => f.useFor !== "barcode");
// }


  if (advancedFilters.dateFrom != "") {
    filter.push({
      useFor: "date",
      field: "issueDate",
      operator: ">",
      value: advancedFilters.dateFrom,
      type: "basic",
      andOr: "and",
    });

    filter.push({
      useFor: "date",
      field: "issueDate",
      operator: "<",
      value: advancedFilters.dateTo,
      type: "basic",
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "date");
  }

  if (advancedFilters.amountFrom != "") {
    filter.push({
      useFor: "amount",
      field: "totalAmount",
      operator: ">=",
      value: advancedFilters.amountFrom,
      type: "basic",
      andOr: "and",
    });

    

    filter.push({
      useFor: "amount",
      field: "totalAmount",
      operator: "<=",
      value: advancedFilters.amountTo,
      type: "basic",
      andOr: "and",
    });
  } else {
    filter = filter.filter((f) => f.useFor !== "amount");
  }
  return filter;
};

export const handleView = (data, navigate, link) => {
  navigate(`${link}`, {
    state: { viewFrom: data },
  });
};

///sales/edit
export const handleEdit = (data, navigate, link) => {
  navigate(`${link}`, {
    state: { newData: data, action: "edit" },
  });
};

export const handlePayment = (data, navigate, link, action) => {
  navigate(`${link}`, {
    state: { newData: data, action: action },
  });
};

export const handleSendToClient = async (title, text, text2, isRTL) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: isRTL ? "إرسال" : "Send",
    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
    confirmButtonColor: "hsl(184, 32%, 37%)",
  });

  if (result.isConfirmed) {
    Swal.fire({
      icon: "success",
      title: isRTL ? "تم الإرسال" : "Sent Successfully",
      text: text2,

      timer: 2000,
      showConfirmButton: false,
    });
  }
};

export const handleCopy = async (title, text, data, isRTL, navigate, link) => {
  const result = await Swal.fire({
    title: title,
    text: text,

    icon: "question",
    showCancelButton: true,
    confirmButtonText: isRTL ? "نسخ" : "Copy",
    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
    confirmButtonColor: "hsl(184, 32%, 37%)",
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  });

  if (result.isConfirmed) {
    navigate(link, {
      state: { newData: data, action: "copy" },
    });
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "stockApproved":
      return "bg- text-success border-success";
    case "stockPending":
      return "bg- text-warning border-warning";
    case "stockRejected":
      return "bg- text-destructive border-destructive";

    case "Approved":
      return "bg- text-success border-success";
    case "Pending":
      return "bg- text-warning border-warning";
    case "Rejected":
      return "bg- text-destructive border-destructive";
    case "Completed":
      return "bg- text-success border-success";
    case "Processing":
      return "bg- text-info border-info";
    case "Draft":
      return "bg- text-muted-foreground border-muted";
    case "Paid":
      return "bg- text-success border-success";
    case "Unpaid":
      return "bg- text-destructive border-destructive";
    case "Failed":
      return "bg- text-destructive border-destructive";
    case "Active":
      return "bg- text-success border-success";
    case "Paused":
      return "bg- text-warning border-warning";
    case "Main":
      return "bg- text-info border-info";
    case "PartiallyPaid":
      return "bg- text-warning border-warning";
    case "PaidByExcess":
      return "bg- text-success border-success";
    case "Returned":
      return "bg- text-info border-info";
    case "PartiallyReturned":
      return "bg- text-info border-info";

    //=========
    case "Overdue":
      return "bg- text-destructive border-destructive";

    case "Sent":
      return "bg- text-info border-info";
    case "Accepted":
      return "bg- text-success border-success";

    case "Expired":
      return "bg- text-warning border-warning";
    case "Converted":
      return "bg- text-success border-success";

    case "Issued":
      return "bg- text-info border-info";
    case "Applied":
      return "bg- text-success border-success";
    case "Cancelled":
      return "bg- text-destructive border-destructive";

    case "Refunded":
      return "bg- text-info border-info";
    case "Partial":
      return "bg- text-warning border-warning";
    default:
      return "bg- text-muted-foreground border-muted";
  }
};

export const getStatusLabel = (status: string, isRTL) => {
  const labels = {
    OpeningBalance: isRTL ? "الرصيد الافتتاحي" : "Opening Balance",
    Receivables: isRTL ? "الحسابات المستحقة" : "Receivables",
    bank_accounts: isRTL ? "الخزينة الاساسية" : "Bank Accounts",
    main_stock: isRTL ? "المخزون الرئيسي" : "Main Stock",
    expenses: isRTL ? "مصروفات اخرى" : "Expenses",
    sales_payment: isRTL ? "دفعة مبيعات" : "Sales Payment",
    purchase_payment: isRTL ? "دفعة مشتريات" : "Purchase Payment",
    sales_invoices: isRTL ? "فاتورة مبيعات" : "Sale Invoice",
    purchase_invoices: isRTL ? "فاتورة مشتريات" : "Purchase Invoices",
    sales_credit_notices: isRTL
      ? "إشعارات ائتمان المبيعات"
      : "Sales Credit Notices",
    purchase_credit_notices: isRTL
      ? "إشعارات ائتمان المشتريات"
      : "Purchase Credit Notices",
    purchase_return: isRTL
      ? "فاتورة مرتجع المشتريات"
      : "Purchase Return Invoice",
    sales_return: isRTL ? "مرتجع المبيعات" : "Sales Return",
    stockPending: isRTL ? "تحت التسليم" : "Pending",
    stockRejected: isRTL ? "مرفوض" : "Rejected",
    stockApproved: isRTL ? "تمت الموافقة" : "Completed",
    Transfer: isRTL ? "تحويل مخزني" : "Transfer",

    addStorePermission: isRTL ? "إذن إضافة مخزن" : "Add Store Permission",
    StoreDisbursementOrder: isRTL ? "أمر صرف مخزن" : "Store Disbursement Order",
    PartiallyReturned: isRTL ? "مرتجع جزئيا" : "Partially Returned",
    Returned: isRTL ? "مرتجع" : "Returned",
    PaidByExcess: isRTL ? "مدفوع بالزيادة" : "Paid By Excess",
    PartiallyPaid: isRTL ? "مدفوع جزئيا" : "Partially Paid",
    Manager: isRTL ? "مدير" : "Manager",
    Staff: isRTL ? "موظف" : "Staff",
    User: isRTL ? "مستخدم" : "User",
    Safe: isRTL ? "خزنة" : "Safe",
    Bank: isRTL ? "بنك" : "Bank",
    Main: isRTL ? "رئيسي" : "Main",
    Approved: isRTL ? "موافق" : "Approved",
    Pending: isRTL ? "معلق" : "Pending",
    Rejected: isRTL ? "مرفوض" : "Rejected",
    Completed: isRTL ? "مكتمل" : "Completed",
    Draft: isRTL ? "مسودة" : "Draft",
    Paid: isRTL ? "مدفوع" : "Paid",
    Processing: isRTL ? "قيد المعالجة" : "Processing",
    Failed: isRTL ? "فشل" : "Failed",
    Active: isRTL ? "نشط" : "Active",
    Paused: isRTL ? "متوقف" : "Paused",
    Unpaid: isRTL ? "غير مدفوع" : "Unpaid",
    //=========

    Issued: isRTL ? "اصدرت" : "Issued",
    Applied: isRTL ? "مطبق" : "Applied",
    Cancelled: isRTL ? "ملغى" : "Cancelled",
    Overdue: isRTL ? "متأخر" : "Overdue",

    Sent: isRTL ? "مرسل" : "Sent",
    Accepted: isRTL ? "مقبول" : "Accepted",
    Expired: isRTL ? "منتهي الصلاحية" : "Expired",
    Converted: isRTL ? "محول" : "Converted",

    CreditCard: isRTL ? "بطاقة ائتمان" : "Credit Card",
    BankTransfer: isRTL ? "تحويل بنكي" : "Bank Transfer",
    Cash: isRTL ? "نقدي" : "Cash",
    Check: isRTL ? "شيك" : "Check",
    PayPal: isRTL ? "باي بال" : "PayPal",

    Refunded: isRTL ? "مسترد" : "Refunded",
    Partial: isRTL ? "جزئي" : "Partial",

    Weekly: isRTL ? "أسبوعي" : "Weekly",
    Monthly: isRTL ? "شهري" : "Monthly",
    Quarterly: isRTL ? "ربع سنوي" : "Quarterly",
    Yearly: isRTL ? "سنوي" : "Yearly",
  };
  return labels[status as keyof typeof labels] || status;
};

export const getReasonLabel = (reason: string, isRTL) => {
  const labels = {
    DamagedGoods: isRTL ? "بضائع تالفة" : "Damaged Goods",
    Overcharge: isRTL ? "رسوم زائدة" : "Overcharge",
    Return: isRTL ? "إرجاع" : "Return",
    PriceAdjustment: isRTL ? "تعديل السعر" : "Price Adjustment",
    Other: isRTL ? "أخرى" : "Other",
  };
  return labels[reason as keyof typeof labels] || reason;
};

export const getProbabilityColor = (probability?: number) => {
  if (!probability) return "text-gray-500";
  if (probability >= 80) return "text-green-600";
  if (probability >= 60) return "text-blue-600";
  if (probability >= 40) return "text-yellow-600";
  return "text-red-600";
};

//=======================================
