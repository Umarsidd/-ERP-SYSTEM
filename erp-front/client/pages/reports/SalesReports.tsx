import React, { useState, useEffect, useRef } from "react";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  FileText,
  Printer,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  Warehouse,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { useLanguage } from "@/contexts/LanguageContext";
import { commonApi } from "@/lib/api";
import { getStatusLabel, mainFilter, mainFilterReport } from "@/lib/function";
import { StatsCards } from "@/components/sales/statsCards";
import { EmptyState } from "@/components/common/emptyState";
import { Loading } from "@/components/common/loading";
import { FiltersReports } from "@/components/sales/filtersReports";
import { TableSaleReport } from "@/components/sales/TableSaleReport";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency } from "@/data/data";
import { useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import { authApi } from "@/lib/authApi";
import { loadCustomersForFilter, loadEmployeesForFilter } from "@/lib/api_function";
import { safeJSONParse, safeGetEntityName } from "@/lib/safe_json_helper";


// Report Type Constants
const REPORT_TYPES = {
  SALES_INVOICE: "Invoice Reports",
  SALES_PAYMENT: "Payment Reports",
  PURCHASE_INVOICE: "Invoice Reports",
  PURCHASE_PAYMENT: "Payment Reports",
  CUSTOMER_STATEMENT: "Customer Statements",
  SUPPLIER_STATEMENT: "Supplier Statements",
  INVENTORY_SHEET: "Inventory Sheet",
  INVENTORY_MOVEMENT: "Inventory Movement",
  EXPENSES: "Expenses",
  RECEIVABLES: "Receipt Vouchers",
  PROFIT: "Profit Reports",
};

const REPORT_CATEGORIES = {
  SALES: "Sales Reports",
  PURCHASE: "Purchase Reports",
  ACCOUNTING: "Accounting Reports",
  INVENTORY: "Inventory Reports",
  CUSTOMER: "Customer Reports",
  SUPPLIER: "Supplier Reports",
};

// Helper function to get table name based on report category and type
const getTableName = (category: string, reportName: string): string => {
  const tableMap = {
    [REPORT_CATEGORIES.SALES]: {
      [REPORT_TYPES.SALES_INVOICE]: "sales_invoices",
      [REPORT_TYPES.SALES_PAYMENT]: "sales_payment",
      [REPORT_TYPES.PROFIT]: "sales_invoices",
    },
    [REPORT_CATEGORIES.PURCHASE]: {
      [REPORT_TYPES.PURCHASE_INVOICE]: "purchase_invoices",
      [REPORT_TYPES.PURCHASE_PAYMENT]: "purchase_payment",
    },
    [REPORT_CATEGORIES.ACCOUNTING]: {
      [REPORT_TYPES.EXPENSES]: "expenses",
      [REPORT_TYPES.RECEIVABLES]: "receivables",
    },
    [REPORT_CATEGORIES.INVENTORY]: {
      [REPORT_TYPES.INVENTORY_SHEET]: "inventory_products",
      [REPORT_TYPES.INVENTORY_MOVEMENT]: "inventory_stock_order", // Mapping to stock orders
    },
    [REPORT_CATEGORIES.CUSTOMER]: {
      [REPORT_TYPES.CUSTOMER_STATEMENT]: "user_statement",
    },
    [REPORT_CATEGORIES.SUPPLIER]: {
      [REPORT_TYPES.SUPPLIER_STATEMENT]: "user_statement",
    },
  };

  return tableMap[category]?.[reportName] || "sales_invoices";
};

// Helper function to group user_statement data by customer/supplier
const groupByCustomerSupplier = (statements: any[]) => {
  const grouped = {};

  statements.forEach((statement) => {
    const data = safeJSONParse(statement.main, null);
    if (!data) return; // Skip if parsing failed

    // Note: The field is always 'customer' in the database, even for suppliers
    const key = data.customerId || data.customer?.id;
    if (!key) return; // Skip if no valid key

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        elementNumber: safeGetEntityName(data, "customer"),
        customer_name: safeGetEntityName(data, "customer"),
        totalAmount: 0,
        paidAmount: 0,
        returnAmount: 0,
        creditNoteAmount: 0,
        balance: 0,
        transactions: [],
        main: JSON.stringify({
          customer: data.customer,
          paidAmount: 0,
          returnAmount: 0,
          creditNoteAmount: 0,
        }),
      };
    }

    // Aggregate amounts based on transaction type
    const amount = data.totalAmount || 0;
    const paidAmount = data.paidAmount || 0;
    const returnAmount = data.returnAmount || 0;
    const creditNoteAmount = data.creditNoteAmount || 0;

    // For invoices, add to totalAmount
    if (data.name === "sales_invoices" || data.name === "purchase_invoices") {
      grouped[key].totalAmount += amount;
    }
    // For payments, add to paidAmount
    else if (data.name === "sales_payment" || data.name === "purchase_payment") {
      grouped[key].paidAmount += amount;
    }
    // For returns, add to returnAmount
    else if (data.name === "sales_return" || data.name === "purchase_return") {
      grouped[key].returnAmount += amount;
    }
    // For credit notes, add to creditNoteAmount
    else if (data.name === "sales_credit_notices" || data.name === "purchase_credit_notices") {
      grouped[key].creditNoteAmount += amount;
    }

    grouped[key].transactions.push(data);
  });

  // Calculate balance for each customer/supplier
  Object.values(grouped).forEach((group: any) => {
    group.balance = group.totalAmount - group.paidAmount - group.returnAmount - group.creditNoteAmount;
    // Update main field with aggregated data
    const mainData = safeJSONParse(group.main, {}) as any;
    mainData.paidAmount = group.paidAmount;
    mainData.returnAmount = group.returnAmount;
    mainData.creditNoteAmount = group.creditNoteAmount;
    group.main = JSON.stringify(mainData);
  });

  return Object.values(grouped);
};

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
  ],
};

const expenseChartData2 = {
  labels: ["Paid", "Partially Paid", "Unpaid"],
  datasets: [
    {
      data: [],
      backgroundColor: [
        // "hsl(231, 69%, 59%)",
        "hsl(142 76% 36%)",
        "hsl(38 92% 50%)",
        //  "hsl(199, 89%, 48%)",
        "hsl(0, 84%, 60%)",
      ],
      borderWidth: 0,
    },
  ],
};

export default function SalesReports() {
  const { isRTL } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [totals, setTotals] = useState({});
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [counts, setCounts] = useState({
    paid_count: 0,
    unpaid_count: 0,
    partially_paid_count: 0,
  });

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 500;
  const [totalElements, setTotalElements] = useState(0);
  const [includeCharts, setIncludeCharts] = useState(false);
  const location = useLocation();
  const [expenseChartData, setExpenseChartData] = useState(expenseChartData2);
  const [salesChartData, setSalesChartData] = useState(salesChartData2);


  // helpers

  const { formatAmount, convertAmount } = useCurrency();

  const [sort, setSort] = useState({
    field: "id",
    direction: "desc",
    type: "basic",
    json_path: "$.elementNumber",
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    paymentMethod: "all",
    salesPerson: "all",
    dateFrom: "",
    dateTo: "",
    amountFrom: "",
    amountTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    // NEW: Enhanced filters
    paymentStatus: "all",      // Paid, Unpaid, PartiallyPaid
    transactionType: "all",     // Invoice, Payment, Return, CreditNote
    type:
      location.state?.viewFrom?.name === "Inventory Sheet" || location.state?.viewFrom?.name === "Inventory Movement"
        ? "all"
        : location.state?.viewFrom?.name === "Customer Statements"
          ? "Customer Statements"
          : location.state?.viewFrom?.name === "Supplier Statements"
            ? "Supplier Statements"
            : "Customer",
    branch: [],
    warehouse:
      location.state?.viewFrom?.name === "Inventory Sheet" || location.state?.viewFrom?.name === "Inventory Movement" ? "main" : "",
    hideZeroBalance: false,
    customer: null,
    employees: [],
  });

  useEffect(() => {
    loadInvoices();
  }, [currentPage, advancedFilters, sort, isRefreshing]);

  useEffect(() => {
    // Load customers and employees for filters
    loadCustomersForFilter(setCustomers, "customer");
    loadEmployeesForFilter(setEmployees);
  }, []);

  const loadInvoices = async () => {
    try {
      console.log("advancedFilters", advancedFilters);
      //   setLoading(true);
      var filter = await mainFilterReport(advancedFilters);

      // Check if this is a Customer or Supplier Statement report
      const isCustomerStatement = location.state?.viewFrom?.name === REPORT_TYPES.CUSTOMER_STATEMENT;
      const isSupplierStatement = location.state?.viewFrom?.name === REPORT_TYPES.SUPPLIER_STATEMENT;

      if (isCustomerStatement || isSupplierStatement) {
        // NEW: Use user_statement table for Customer/Supplier reports
        // Note: The field is always called 'customer' in the database, even for suppliers

        // Check user permissions
        if (
          ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Customers?.viewHisCustomers === true &&
            isCustomerStatement) ||
          (isSupplierStatement &&
            (JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Purchases?.viewHisSuppliers === true)
        ) {
          filter.push({
            field: "createdBy",
            operator: "=",
            value: JSON.parse(
              CryptoJS.AES.decrypt(
                localStorage.getItem("user"),
                import.meta.env.VITE_SECRET,
              ).toString(CryptoJS.enc.Utf8),
            )?.user?.id,
            type: "json",
            andOr: "and",
            json_path: "$.id",
          });
        }

        // Fetch from user_statement table
        var result = await commonApi.getAll(
          currentPage,
          itemsPerPage,
          filter,
          sort,
          "user_statement",  // Use user_statement table
          {
            target_currency: "IQD",
          },
        );

        // Group data by customer/supplier
        const groupedData = groupByCustomerSupplier(result.data || []);
        result.data = groupedData;

      } else {
        // Use getTableName function for cleaner table selection
        const tableName = getTableName(
          location.state?.viewFrom?.title,
          location.state?.viewFrom?.name
        );

        var result = await commonApi.getAll(
          currentPage,
          itemsPerPage,
          filter,
          sort,
          tableName,
          {
            target_currency: "IQD",
          },
        );
      }
      console.log("result", result);

      // setTotalElements(result.total);
      setInvoices(result.data);
      setCounts(result.counts);
      setTotals(result.totals || {});
      var x = result.counts.paid_count;
      var y = result.counts.unpaid_count;
      var z = result.counts.partially_paid_count;

      const uniqueByDate = [
        ...new Map(
          result.data.map((item) => [
            location.state?.viewFrom?.name === "Inventory Sheet"
              ? item.createdAt
              : item.customer_name,
            item,
          ]),
        ).values(),
      ];

      setExpenseChartData((prevData) => {
        const newData = { ...prevData };
        newData.datasets[0].data = [x, z, y];
        return newData;
      });

      setSalesChartData((prevData) => {
        const newData = { ...prevData };
        const labels = uniqueByDate.map((item: any) =>
          location.state?.viewFrom?.name === "Inventory Sheet"
            ? item.createdAt
            : item.customer_name,
        );

        newData.labels = labels;

        newData.datasets[0].data = result.data.map((item: any) =>
          convertAmount(
            parseFloat(item.totalAmount) || 0,
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            //(JSON.parse(item.main)?.currency &&
            //  JSON.parse(JSON.parse(item.main)?.currency)?.code) ||
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          ),
        );
        return newData;
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setAdvancedFilters({
      search: "",
      status: "all",
      category: "all",
      paymentMethod: "all",
      salesPerson: "all",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
      dueDateFrom: "",
      dueDateTo: "",
      paymentStatus: "all",
      transactionType: "all",
      type:
        location.state?.viewFrom?.name === "Inventory Sheet"
          ? "all"
          : "Customer",
      branch: [],
      warehouse:
        location.state?.viewFrom?.name === "Inventory Sheet" ? "main" : "",
      hideZeroBalance: false,
      customer: null,
      employees: [],
    });
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const hasActiveFilters = Object.values(advancedFilters).some(
    (value) => value !== "all" && value !== "",
  );

  //const [filteredData, setFilteredData] = useState<SalesData[]>(sampleSalesData);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const reportType = location.state?.viewFrom?.name;
      const reportCategory = location.state?.viewFrom?.title;

      // Determine if this is a purchase or sales report
      const isPurchase = reportCategory === "Purchase Reports";
      const isCustomerStatement = reportType === "Customer Statements";
      const isSupplierStatement = reportType === "Supplier Statements";
      const isPaymentReport = reportType === "Payment Reports";

      let excelData;
      let sheetName;
      let fileName;

      // Customer/Supplier Statements
      if (isCustomerStatement || isSupplierStatement) {
        excelData = invoices.map((item) => ({
          [isRTL ? "الاسم" : "Name"]: item.elementNumber || item.customer_name,
          [isRTL ? "إجمالي المبلغ" : "Total Amount"]: formatAmount(
            convertAmount(
              item.totalAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "المبلغ المدفوع" : "Paid Amount"]: formatAmount(
            convertAmount(
              item.paidAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "المبلغ المرتجع" : "Return Amount"]: formatAmount(
            convertAmount(
              item.returnAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "مبلغ الإشعار الدائن" : "Credit Note Amount"]: formatAmount(
            convertAmount(
              item.creditNoteAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "الرصيد" : "Balance"]: formatAmount(
            convertAmount(
              item.balance || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
        }));
        sheetName = isCustomerStatement ? "Customer Statements" : "Supplier Statements";
        fileName = `${isCustomerStatement ? "customer" : "supplier"}-statements-${new Date().toISOString().split("T")[0]}.xlsx`;
      }
      // Payment Reports
      else if (isPaymentReport) {
        excelData = invoices.map((item) => ({
          [isRTL ? "رقم الدفع" : "Payment No"]: item.elementNumber,
          [isRTL ? "التاريخ" : "Date"]: item.issueDate || item.createdAt,
          [isPurchase ? (isRTL ? "المورد" : "Supplier") : (isRTL ? "العميل" : "Customer")]:
            safeGetEntityName(safeJSONParse(item.main, {}), "customer"),
          [isRTL ? "المبلغ" : "Amount"]: formatAmount(
            convertAmount(
              item.totalAmount,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "طريقة الدفع" : "Payment Method"]: (safeJSONParse(item.main, {}) as any)?.paymentMethod || "-",
        }));
        sheetName = isPurchase ? "Purchase Payments" : "Sales Payments";
        fileName = `${isPurchase ? "purchase" : "sales"}-payments-${new Date().toISOString().split("T")[0]}.xlsx`;
      }
      // Invoice Reports (Sales/Purchase)
      else {
        excelData = invoices.map((item) => ({
          [isRTL ? "رقم الفاتورة" : "Invoice No"]: item.elementNumber,
          [isRTL ? "تاريخ الإصدار" : "Issue Date"]: item.issueDate,
          [isRTL ? "تاريخ الاستحقاق" : "Due Date"]: item.dueDate,
          [isPurchase ? (isRTL ? "المورد" : "Supplier") : (isRTL ? "العميل" : "Customer")]:
            safeGetEntityName(safeJSONParse(item.main, {}), "customer"),
          [isRTL ? "المبلغ" : "Amount"]: formatAmount(
            convertAmount(
              item.totalAmount,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "المبلغ المدفوع" : "Paid Amount"]: formatAmount(
            convertAmount(
              (safeJSONParse(item?.main, {}) as any)?.paidAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "المبلغ المرتجع" : "Return Amount"]: formatAmount(
            convertAmount(
              (safeJSONParse(item?.main, {}) as any)?.returnAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          ),
          [isRTL ? "الحالة" : "Status"]: item.status,
        }));
        sheetName = isPurchase ? "Purchase Report" : "Sales Report";
        fileName = `${isPurchase ? "purchase" : "sales"}-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      }

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Export to Excel failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const buildSimpleTableHtml = (data) => {
    const reportType = location.state?.viewFrom?.name;
    const reportCategory = location.state?.viewFrom?.title;
    const isPurchase = reportCategory === "Purchase Reports";
    const isCustomerStatement = reportType === "Customer Statements";
    const isSupplierStatement = reportType === "Supplier Statements";
    const isPaymentReport = reportType === "Payment Reports";

    let headers;
    let title;

    // Customer/Supplier Statements
    if (isCustomerStatement || isSupplierStatement) {
      headers = [
        isRTL ? "الاسم" : "Name",
        isRTL ? "إجمالي المبلغ" : "Total Amount",
        isRTL ? "المبلغ المدفوع" : "Paid Amount",
        isRTL ? "المبلغ المرتجع" : "Return Amount",
        isRTL ? "مبلغ الإشعار الدائن" : "Credit Note Amount",
        isRTL ? "الرصيد" : "Balance",
      ];
      title = isCustomerStatement
        ? (isRTL ? "كشف حساب العملاء" : "Customer Statements")
        : (isRTL ? "كشف حساب الموردين" : "Supplier Statements");
    }
    // Payment Reports
    else if (isPaymentReport) {
      headers = [
        isRTL ? "رقم الدفع" : "Payment No",
        isRTL ? "التاريخ" : "Date",
        isPurchase ? (isRTL ? "المورد" : "Supplier") : (isRTL ? "العميل" : "Customer"),
        isRTL ? "المبلغ" : "Amount",
        isRTL ? "طريقة الدفع" : "Payment Method",
      ];
      title = isPurchase
        ? (isRTL ? "تقرير مدفوعات المشتريات" : "Purchase Payments Report")
        : (isRTL ? "تقرير مدفوعات المبيعات" : "Sales Payments Report");
    }
    // Invoice Reports (Sales/Purchase)
    else {
      headers = [
        isRTL ? "رقم الفاتورة" : "Invoice No",
        isRTL ? "تاريخ الإصدار" : "Issue Date",
        isRTL ? "تاريخ الاستحقاق" : "Due Date",
        isPurchase ? (isRTL ? "المورد" : "Supplier") : (isRTL ? "العميل" : "Customer"),
        isRTL ? "المبلغ" : "Amount",
        isRTL ? "المبلغ المدفوع" : "Paid Amount",
        isRTL ? "المبلغ المرتجع" : "Return Amount",
        isRTL ? "الحالة" : "Status",
      ];
      title = isPurchase
        ? (isRTL ? "تقرير المشتريات" : "Purchase Report")
        : (isRTL ? "تقرير المبيعات" : "Sales Report");
    }

    const style = `
      <style>
        body { font-family: Inter, Arial, sans-serif; padding: 16px; direction: ${isRTL ? "rtl" : "ltr"}; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: ${isRTL ? "right" : "left"}; }
        th { background: #f9fafb; font-weight: bold; }
        img.chart { max-width: 60%; height: auto; display: block; margin: 12px auto; }
        h2 { text-align: center; margin-bottom: 20px; }
      </style>
    `;

    const headerRow = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;

    let bodyRows;

    // Customer/Supplier Statements
    if (isCustomerStatement || isSupplierStatement) {
      bodyRows = data
        .flatMap((groupItem) => {
          // For Customer/Supplier Statements, use the summary row
          // But ensure we handle the data structure correctly
          const itemsToProcess = (Array.isArray(groupItem.items) && groupItem.items.length > 0)
            ? [groupItem]  // Use the summary for statements
            : [groupItem];

          return itemsToProcess.map((item) => `<tr>
        <td>${item.elementNumber || item.customer_name || "-"}</td>
        <td>${formatAmount(
            convertAmount(
              item.totalAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          )}</td>
        <td>${formatAmount(
            convertAmount(
              item.paidAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          )}</td>
        <td>${formatAmount(
            convertAmount(
              item.returnAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          )}</td>
        <td>${formatAmount(
            convertAmount(
              item.creditNoteAmount || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          )}</td>
        <td>${formatAmount(
            convertAmount(
              item.balance || 0,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          )}</td>
      </tr>`);
        })
        .join("");
    }
    // Payment Reports
    else if (isPaymentReport) {
      bodyRows = data
        .flatMap((groupItem) => {
          // Check if this is grouped data with items array
          const itemsToProcess = (Array.isArray(groupItem.items) && groupItem.items.length > 0)
            ? groupItem.items
            : [groupItem];

          return itemsToProcess.map((item) => {
            let mainData: any = {};
            try {
              if (typeof item.main === "string") {
                mainData = JSON.parse(item.main);
              } else if (typeof item.main === "object" && item.main !== null) {
                mainData = item.main;
              }
            } catch (e) {
              // ignore error
            }

            const elementNumber = item.elementNumber || mainData.elementNumber || "-";
            const issueDate = item.issueDate || item.createdAt || mainData.issueDate;
            const customerName = safeGetEntityName(mainData, isPurchase ? "supplier" : "customer");
            const paymentMethod = mainData.paymentMethod || "-";
            const totalAmount = item.totalAmount || 0;

            return `<tr>
        <td>${elementNumber}</td>
        <td>${issueDate ? new Date(issueDate).toLocaleDateString(isRTL ? "ar-SA" : "en-US") : "-"}</td>
        <td>${customerName}</td>
        <td>${formatAmount(
              convertAmount(
                totalAmount,
                localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              ),
            )}</td>
        <td>${paymentMethod}</td>
      </tr>`;
          });
        })
        .join("");
    }
    // Invoice Reports (Sales/Purchase)
    else {
      bodyRows = data
        .flatMap((groupItem) => {
          // Check if this is a grouped item (has 'items' array)
          const itemsToProcess = (Array.isArray(groupItem.items) && groupItem.items.length > 0)
            ? groupItem.items
            : [groupItem];

          return itemsToProcess.map((item) => {
            let mainData: any = {};
            try {
              if (typeof item.main === "string") {
                mainData = JSON.parse(item.main);
              } else if (typeof item.main === "object" && item.main !== null) {
                mainData = item.main;
              }
            } catch (e) {
              // ignore error
            }

            // Exact paths from TableView.tsx
            const elementNumber = mainData.elementNumber || "-";
            const customerName = mainData.customer?.name || "Unknown";

            const issueDate = mainData.issueDate
              ? new Date(mainData.issueDate).toLocaleDateString(isRTL ? "ar-SA" : "en-US")
              : "-";

            const dueDate = mainData.dueDate
              ? new Date(mainData.dueDate).toLocaleDateString(isRTL ? "ar-SA" : "en-US")
              : "-";

            const status = item.status || mainData.status;
            const totalAmount = item.totalAmount || item.total_amount || 0;
            // For list items, paid/return might be in mainData or item props
            const paidAmount = mainData.paidAmount || item.paidAmount || 0;
            const returnAmount = mainData.returnAmount || item.returnAmount || 0;

            return `<tr>
          <td>${elementNumber}</td>
          <td>${issueDate}</td>
          <td>${dueDate}</td>
          <td>${customerName}</td>
          <td>${formatAmount(
              convertAmount(
                totalAmount,
                localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              ),
            )}</td>
          <td>${formatAmount(
              convertAmount(
                paidAmount,
                localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              ),
            )}</td>
          <td>${formatAmount(
              convertAmount(
                returnAmount,
                localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              ),
            )}</td>
          <td>${getStatusLabel(status, isRTL)}</td>
        </tr>`;
          });
        })
        .join("");
    }

    return `${style}<h2>${title}</h2><table>${headerRow}${bodyRows}</table>`;
  };

  const handlePrint = async () => {
    const reportType = location.state?.viewFrom?.name;
    const reportCategory = location.state?.viewFrom?.title;
    const isPurchase = reportCategory === "Purchase Reports";

    let reportTitle;
    if (reportType === "Customer Statements") {
      reportTitle = isRTL ? "كشف حساب العملاء" : "Customer Statements";
    } else if (reportType === "Supplier Statements") {
      reportTitle = isRTL ? "كشف حساب الموردين" : "Supplier Statements";
    } else if (reportType === "Payment Reports") {
      reportTitle = isPurchase
        ? (isRTL ? "تقرير مدفوعات المشتريات" : "Purchase Payments Report")
        : (isRTL ? "تقرير مدفوعات المبيعات" : "Sales Payments Report");
    } else {
      reportTitle = isPurchase
        ? (isRTL ? "تقرير المشتريات" : "Purchase Report")
        : (isRTL ? "تقرير المبيعات" : "Sales Report");
    }

    const win = window.open("", "_blank");
    if (!win) return;
    const html = `<!doctype html><html lang="${isRTL ? "ar" : "en"}" dir="${isRTL ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${reportTitle}</title></head><body>${buildSimpleTableHtml(invoices)}</body></html>`;
    win.document.open();
    win.document.write(html);

    if (includeCharts && reportRef.current) {
      const canvases = Array.from(
        reportRef.current.querySelectorAll("canvas"),
      ) as HTMLCanvasElement[];
      for (const canvas of canvases) {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          const img = win.document.createElement("img");
          img.className = "chart";
          img.src = dataUrl;
          win.document.body.appendChild(img);
        } catch (err) {
          console.warn("Chart canvas not accessible for print:", err);
        }
      }
    }

    win.document.close();
    setTimeout(() => {
      try {
        win.focus();
        win.print();
        win.close();
      } catch (err) {
        console.error("Print failed:", err);
      }
    }, 500);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Create a temporary container for rendering
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "210mm"; // A4 width
      tempContainer.style.background = "white";
      tempContainer.style.color = "black";

      const htmlContent = buildSimpleTableHtml(invoices);
      tempContainer.innerHTML = htmlContent;

      document.body.appendChild(tempContainer);

      // Wait for any potential rendering
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const reportType = location.state?.viewFrom?.name;
      const reportCategory = location.state?.viewFrom?.title;
      const isPurchase = reportCategory === "Purchase Reports";
      const fileName = `${isPurchase ? "purchase" : "sales"
        }-report-${new Date().toISOString().split("T")[0]}.pdf`;

      pdf.save(fileName);

    } catch (error) {
      console.error("Export PDF failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* <Link
            to="/reports"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link> */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL
                ? location.state?.viewFrom?.titleAr
                : location.state?.viewFrom?.title}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? location.state?.viewFrom?.nameAr
                : location.state?.viewFrom?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* <div
            onClick={() => {
              setIncludeCharts(!includeCharts);
            }}
            className={`flex items-center ${includeCharts ? "bg-muted" : "bg-green-600 "} rounded-lg px-3 py-2 cursor-pointer hover:opacity-80 transition-colors `}
          >


            <label className={`text-sm mx-2 font-medium  ${includeCharts ? "text-foreground" : "text-white" }`}>
              {isRTL ? "تضمين المخططات" : "Include Charts"}
            </label>
          </div> */}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{isRTL ? "طباعة" : "Print"}</span>
          </button>

          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isRTL ? "إكسل" : "Excel"}</span>
          </button>

          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{isRTL ? "PDF" : "PDF"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {location.state?.viewFrom?.name !== "Payment Reports" &&
        location.state?.viewFrom?.name !== "Customer Statements" &&
        location.state?.viewFrom?.name !== "Supplier Statements" &&
        location.state?.viewFrom?.title !== "Accounting Reports" &&
        location.state?.viewFrom?.title !== "Inventory Reports" && (
          <StatsCards
            data={[
              {
                title: isRTL ? "إجمالي الفواتير" : "Total Invoices",
                value: totalElements,
                icon: <DollarSign className="w-8 h-8 text-primary" />,
              },
              {
                title: isRTL ? "الفواتير المدفوعة" : "Paid Invoices",
                value: counts?.paid_count || 0,
                icon: <CheckCircle className="w-8 h-8 text-success" />,
              },
              {
                title: isRTL ? "الفواتير المعلقة" : "Pending Invoices",
                value: counts?.partially_paid_count || 0,
                icon: <Clock className="w-8 h-8 text-warning" />,
              },
              {
                title: isRTL ? "الفواتير الغير مدفوعة" : "Unpaid Invoices",
                value: counts?.unpaid_count || 0,
                icon: <AlertCircle className="w-8 h-8 text-destructive" />,
              },
            ]}
          />
        )}

      {/* Charts */}
      {!loading && (
        <div
          className={`grid grid-cols-1 ${location.state?.viewFrom?.name !== "Customer Statements" &&
            location.state?.viewFrom?.name !== "Supplier Statements" &&
            location.state?.viewFrom?.title !== "Inventory Reports" &&
            location.state?.viewFrom?.name !== "Payment Reports" &&
            location.state?.viewFrom?.title !== "Accounting Reports"
            ? "lg:grid-cols-2"
            : ""
            } gap-6`}
        >
          <ChartCard
            title=""
            titleAr=""
            type="line"
            data={salesChartData}
            isRTL={isRTL}
            height={400}
          />

          {location.state?.viewFrom?.name !== "Payment Reports" &&
            location.state?.viewFrom?.name !== "Customer Statements" &&
            location.state?.viewFrom?.name !== "Supplier Statements" &&
            location.state?.viewFrom?.title !== "Accounting Reports" &&
            location.state?.viewFrom?.title !== "Inventory Reports" && (
              <ChartCard
                title=""
                titleAr=""
                type="doughnut"
                data={expenseChartData}
                isRTL={isRTL}
                height={400}
              />
            )}
        </div>
      )}

      <FiltersReports
        title={location.state?.viewFrom?.name}
        sectionTitle={location.state?.viewFrom?.title}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        sort={sort}
        setSort={setSort}
        customers={customers}
        employees={employees}
      />

      {/* Invoices Display */}
      {loading ? (
        <Loading
          title={isRTL ? "جاري تحميل الفواتير..." : "Loading invoices..."}
        />
      ) : (
        /* Table View */
        <div className="bg-card border border-border rounded-lg overflow-auto">
          <TableSaleReport
            type="sales"
            sectionTitle={location.state?.viewFrom?.title}
            setIsRefreshing={setIsRefreshing}
            main={invoices}
            advancedFilters={advancedFilters}
            reportType={location.state?.viewFrom?.name}
            totals={totals}
            setMain={setInvoices}


          />
          {/* Pagination */}
          {/* <Pagination
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalElements={totalElements}
          /> */}
        </div>
      )}
      {/* Empty State */}
      {invoices.length === 0 && loading == false && (
        <EmptyState
          clearAllFilters={clearAllFilters}
          title={isRTL ? "لا توجد فواتير" : "No invoices found"}
          description={
            isRTL
              ? "لم يتم العثور على فواتير تطابق معايير البحث."
              : "No invoices match your search criteria."
          }
          other={isRTL ? "مسح الفلاتر" : "Clear Filters"}
        />
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .space-y-6, .space-y-6 * { visibility: visible; }
          .space-y-6 { position: absolute; left: 0; top: 0; width: 100%; }
          /* hide everything except the simple printed table in the new window flow; keep this for fallback */
          button { display: none !important; }
          .bg-card { background: white !important; border: 1px solid #e5e7eb !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
