import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, User, Calendar, DollarSign, Percent } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import { getStatusLabel } from "@/lib/function";
import React from "react";

export function TableSaleReport(props: {
  main: any;
  setIsRefreshing: any;
  type: any;
  advancedFilters: any;
  reportType?: string;
  sectionTitle?: string;
  totals?: any;
  setMain?: any;
}) {
  const {
    main,
    setIsRefreshing,
    type,
    advancedFilters,
    reportType,
    sectionTitle,
    totals,
    setMain,
  } = props;

  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();

  const isWithinRange = (d: Date, start: string, end: string) => {
    if (start && d < new Date(start)) return false;
    if (end && d > new Date(end)) return false;
    return true;
  };

  const getCreatedById = (r: any) => JSON.parse(r?.createdBy)?.id; // adjust if nested differently

  const matchesBranches = (
    r: any,
    selected: Array<{ id: number; name: string }>,
  ) => {
    if (!selected.length) return true; // no filter => include all
    const createdId = getCreatedById(r);

    console.log("matchesBranches createdId, selected", createdId, selected);
    return selected.some((b) => Number(b.id) === Number(createdId));
  };

  const creditNames = [
    "sales_return",
    "sales_credit_notices",
    "purchase_return",
    "purchase_credit_notices",
  ];

  const debitNames = ["sales_payment", "purchase_payment", "OpeningBalance"];

  const getSymbol = (r: any) =>
    r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
      ? JSON.parse(r?.currency)?.symbol
      : (localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol);

  const currencyCode =
    localStorage.getItem("selectedCurrency") ?? selectedCurrency;

  return (
    <div className="overflow-x-">
      {reportType === "Customer Statements" ||
        reportType === "Supplier Statements" ? (
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "التاريخ" : "Date"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "المرجع" : "Reference"}</span>
                </button>
              </th>{" "}
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "المبلغ المستحق" : "Amount Due"}</span>
                </button>
              </th>{" "}
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "المبلغ المدفوع" : "Amount Paid"}</span>
                </button>
              </th>{" "}
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "الرصيد" : "Balance"}</span>
                </button>
              </th>{" "}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {main &&
              main.map((data1) => {
                let runningBalance = 0; // reset per customer

                return (
                  <React.Fragment key={data1?.id}>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-foreground">
                              {data1?.customer_name}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {data1?.items?.map((data2) => {
                      var rows = [];

                      rows = JSON.parse(data2?.meta)?.data?.filter(
                        (r: any) => r.show !== false,
                      ) ?? [];

                      const filteredRows = rows.filter((r: any) => {
                        const inDateRange = isWithinRange(
                          new Date(r.createdAt),
                          advancedFilters.dateFrom,
                          advancedFilters.dateTo,
                        );
                        const inBranch = matchesBranches(
                          r,
                          advancedFilters.branch,
                        ); // uses createdBy.id
                        return inDateRange && inBranch;
                      });
                      console.log("filteredRows", filteredRows);

                      return filteredRows.map((r: any) => {
                        const baseAmount =
                          debitNames.includes(r.name) ||
                            creditNames.includes(r.name)
                            ? r.totalAmount
                            : r.paidAmount;

                        const signedAmount = creditNames.includes(r.name)
                          ? -baseAmount
                          : baseAmount;
                        runningBalance += signedAmount;

                        return (
                          <tr key={r.invoiceID} className="border-b">
                            <td className="px-4 py-3">
                              {new Date(r.createdAt).toLocaleDateString(
                                "en-US",
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusLabel(r.name, isRTL) +
                                " " +
                                r.elementNumber}
                            </td>
                            <td className="px-4 py-3">
                              {formatAmount(
                                convertAmount(
                                  creditNames.includes(r.name)
                                    ? r.paidAmount
                                    : r.totalAmount,
                                  currencyCode,
                                ),
                                getSymbol(r),
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {formatAmount(
                                convertAmount(
                                  debitNames.includes(r.name) ||
                                    creditNames.includes(r.name)
                                    ? r.totalAmount
                                    : r.paidAmount,
                                  currencyCode,
                                ),
                                getSymbol(r),
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {formatAmount(
                                convertAmount(runningBalance, currencyCode),
                                getSymbol(r),
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })}

                    <tr className="w-4 h-8">
                      <td className="px-2 py-2" />
                    </tr>
                    <tr className="w-4 h-8">
                      <td className="px-2 py-2" />
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      ) : reportType === "Inventory Movement" ? (
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "التاريخ" : "Date"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "المرجع" : "Reference"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "النوع" : "Type"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "عدد العناصر" : "Items Count"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "من مستودع" : "From Warehouse"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "إلى مستودع" : "To Warehouse"}</span>
                </button>
              </th>

            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {main?.map((data) => {
              const mainData = JSON.parse(data.main || "{}");
              const items = JSON.parse(data.items || "[]");
              return (
                <tr key={data.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-foreground">
                        {new Date(data.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-medium text-foreground">
                        {data.elementNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-foreground">
                        {getStatusLabel(mainData.type, isRTL)}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-foreground">
                        {items.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-foreground">
                        {mainData.warehousesFrom || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-foreground">
                        {mainData.warehousesTo || "-"}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>{" "}
        </table>
      ) : reportType === "Inventory Sheet" ? (
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "الكود" : "Code"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "الاسم" : "Name"}</span>
                </button>
              </th>{" "}
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "الباركود" : "Barcode"}</span>
                </button>
              </th>{" "}
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "العدد بالنطام" : "System Count"}</span>
                </button>
              </th>{" "}
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "الكمية" : "Quantity"}</span>
                </button>
              </th>{" "}
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "ملاحظات" : "Notes"}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {main?.map((data) => (
              <tr key={data.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-2 py-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-medium text-foreground">
                      {data.sku}
                    </span>
                  </div>
                </td>

                <td className="px-2 py-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-medium text-foreground">
                      {data.elementNumber}
                    </span>
                  </div>
                </td>

                <td className="px-2 py-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div>
                      <span className="text-foreground">
                        {JSON.parse(data.main)?.barcode}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-medium text-foreground">
                      {data.stockQuantity}
                    </span>
                  </div>
                </td>

                <td className="px-2 py-2">
                  <input
                    type="number"
                    step="1"
                    value={data?.currentStockQuantity}
                    onChange={(e) => {
                      setMain((prev) =>
                        prev.map((p, i) =>
                          p.id === data.id
                            ? {
                              ...p,
                              currentStockQuantity: e.target.value,
                            }
                            : p,
                        ),
                      );

                      console.log("main.main", main);
                    }}
                    className="w- px-3 py-2 border rounded-md"
                  />
                </td>

                <td className="px-2 py-2">
                  <input
                    //type="number"
                    step="1"
                    value={data?.note}
                    onChange={(e) => {
                      setMain((prev) =>
                        prev.map((p, i) =>
                          p.id === data.id
                            ? {
                              ...p,
                              note: e.target.value,
                            }
                            : p,
                        ),
                      );

                      console.log("main.main345345", main);
                    }}
                    className="w- px-3 py-2 border rounded-md"
                  />
                </td>
              </tr>
            ))}
          </tbody>{" "}
        </table>
      ) : (
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>{isRTL ? "رقم الفاتورة" : "Invoice #"}</span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>
                    {advancedFilters?.type !== "Customer" &&
                      advancedFilters?.type !== "Employee"
                      ? isRTL
                        ? "موظف"
                        : "Employee"
                      : isRTL
                        ? "التاريخ"
                        : "Date"}
                  </span>
                </button>
              </th>
              <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                  <span>
                    {advancedFilters?.type === "Customer"
                      ? isRTL
                        ? "موظف"
                        : "Employee"
                      : sectionTitle === "Purchase Reports"
                        ? isRTL
                          ? "المورد"
                          : "Supplier"
                        : isRTL
                          ? "العميل"
                          : "Customer"}
                  </span>
                </button>
              </th>
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>{isRTL ? "المنتجات" : "Products"}</span>
                  </button>
                </th>
              )}
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>{isRTL ? "الكمية" : "Quantity"}</span>
                  </button>
                </th>
              )}
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>
                      {isRTL ? "سعر شراء الوحدة" : "Unit Purchase Price"}
                    </span>
                  </button>
                </th>
              )}
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>{isRTL ? "سعر الشراء" : "Purchase Price"}</span>
                  </button>
                </th>
              )}
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>
                      {isRTL ? "سعر بيع الوحدة" : "Unit Selling Price"}
                    </span>
                  </button>
                </th>
              )}
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>{isRTL ? "سعر البيع" : "Selling Price"}</span>
                  </button>
                </th>
              )}
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>{isRTL ? "الخصم" : "Discount"}</span>
                  </button>
                </th>
              )}
              {reportType === "Profit Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>{isRTL ? "الربح" : "Profit"}</span>
                  </button>
                </th>
              )}

              {reportType !== "Payment Reports" &&
                reportType !== "Profit Reports" &&
                reportType !== "Daily Entries" &&
                reportType !== "Receipt Vouchers" &&
                reportType !== "Expenses" && (
                  <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                    <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                      <span>{isRTL ? "المبلغ المدفوع" : "Paid Amount"}</span>
                    </button>
                  </th>
                )}
              {reportType !== "Payment Reports" &&
                reportType !== "Profit Reports" &&
                reportType !== "Daily Entries" &&
                reportType !== "Receipt Vouchers" &&
                reportType !== "Expenses" && (
                  <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                    <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                      <span>
                        {isRTL ? "المبلغ المرتجع" : "Refunded Amount"}
                      </span>
                    </button>
                  </th>
                )}
              {reportType === "Payment Reports" && (
                <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                  <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                    <span>{isRTL ? "طريقة الدفع" : "Payment Method"}</span>
                  </button>
                </th>
              )}
              {reportType !== "Profit Reports" &&
                reportType !== "Daily Entries" && (
                  <th className="px-2 py-2 text-left rtl:text-right text-sm font-medium text-muted-foreground">
                    <button className="flex items-center space-x-1 rtl:space-x-reverse hover:text-foreground">
                      <span>{isRTL ? "المبلغ الكلي" : "Total Amount"}</span>
                    </button>
                  </th>
                )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {main &&
              main?.map((data1) => (
                <>
                  <tr
                    key={data1?.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {" "}
                    <td className="px-2 py-2">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-foreground">
                            {data1?.customer_name}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {data1?.items?.map((data) => (
                    <tr
                      key={data.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-2 py-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {data.elementNumber}
                          </span>
                        </div>
                      </td>

                      {advancedFilters?.type !== "Customer" &&
                        advancedFilters?.type !== "Employee" ? (
                        <td className="px-2 py-2">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="text-foreground">
                                {JSON.parse(data.createdBy)?.name}
                              </span>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <td className="px-2 py-2">
                          <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                JSON.parse(data.main)?.issueDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {reportType !== "Payment Reports" &&
                            reportType !== "Daily Entries" &&
                            reportType !== "Receipt Vouchers" &&
                            reportType !== "Expenses" && (
                              <div className="text-xs text-muted-foreground">
                                {type === "sales"
                                  ? isRTL
                                    ? "الاستحقاق:"
                                    : "Due:"
                                  : isRTL
                                    ? "تاريخ الاستلام:"
                                    : "Delivery Date:"}
                                {new Date(
                                  JSON.parse(data.main)?.dueDate,
                                ).toLocaleDateString()}
                              </div>
                            )}
                        </td>
                      )}

                      <td className="px-2 py-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-foreground">
                              {advancedFilters?.type === "Customer"
                                ? JSON.parse(data.createdBy)?.name
                                : JSON.parse(data.main)?.customer?.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground">
                              {data.productName}
                            </p>
                          ))
                            // .join(", ")
                          }
                        </td>
                      )}

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground text-">
                              <span>{data.quantity}</span>{" "}
                              <span> {data.unitName}</span>{" "}
                            </p>
                          ))}
                        </td>
                      )}

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground text- ">
                              {data.originalUnitPrice2}
                            </p>
                          ))}
                        </td>
                      )}

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2 ">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground">
                              {data.unitPrice2}
                            </p>
                          ))}
                        </td>
                      )}

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground text- ">
                              {data.originalUnitPrice}
                            </p>
                          ))}
                        </td>
                      )}

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2 ">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground">
                              {data.total}
                            </p>
                          ))}
                        </td>
                      )}

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2 ">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground flex items-center">
                              {data.discount}{" "}
                              {data.discountType === "percentage" ? (
                                <Percent className="  w-4 h-4" />
                              ) : (
                                <DollarSign className="  w-4 h-4" />
                              )}
                            </p>
                          ))}
                        </td>
                      )}

                      {reportType === "Profit Reports" && (
                        <td className="px-2 py-2 ">
                          {JSON.parse(data?.main)?.items?.map((data) => (
                            <p className="font-semibold text-foreground">
                              {data.total - (data?.unitPrice2 ?? 0)}
                            </p>
                          ))}
                        </td>
                      )}

                      {reportType !== "Payment Reports" &&
                        reportType !== "Profit Reports" &&
                        reportType !== "Daily Entries" &&
                        reportType !== "Receipt Vouchers" &&
                        reportType !== "Expenses" && (
                          <td className="px-2 py-2">
                            <span className="font-semibold text-foreground">
                              {formatAmount(
                                convertAmount(
                                  JSON.parse(data?.main)?.paidAmount ?? 0,
                                  localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                                ),
                                ((JSON.parse(data.main)?.currency &&
                                  JSON.parse(JSON.parse(data.main)?.currency)
                                    ?.symbol) ||
                                  localStorage.getItem(
                                    "selectedCurrencySymbol",
                                  )) ??
                                selectedSymbol,
                              )}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {isRTL
                                ? JSON.parse(data.main)?.paymentMethodAr
                                : JSON.parse(data.main)?.paymentMethod}
                            </div>
                          </td>
                        )}

                      {reportType !== "Payment Reports" &&
                        reportType !== "Profit Reports" &&
                        reportType !== "Daily Entries" &&
                        reportType !== "Receipt Vouchers" &&
                        reportType !== "Expenses" && (
                          <td className="px-2 py-2">
                            <span className="font-semibold text-foreground">
                              {formatAmount(
                                convertAmount(
                                  JSON.parse(data?.main)?.returnAmount ?? 0,
                                  localStorage.getItem("selectedCurrency") ??
                                  selectedCurrency,
                                ),
                                ((JSON.parse(data.main)?.currency &&
                                  JSON.parse(JSON.parse(data.main)?.currency)
                                    ?.symbol) ||
                                  localStorage.getItem(
                                    "selectedCurrencySymbol",
                                  )) ??
                                selectedSymbol,
                              )}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {isRTL
                                ? JSON.parse(data.main)?.paymentMethodAr
                                : JSON.parse(data.main)?.paymentMethod}
                            </div>
                          </td>
                        )}

                      {reportType === "Payment Reports" && (
                        <td className="px-2 py-2">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="text-foreground">
                                {JSON.parse(data.main)?.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {reportType !== "Profit Reports" && (
                        <td className="px-2 py-2">
                          <span className="font-semibold text-foreground">
                            {formatAmount(
                              convertAmount(
                                data?.totalAmount ?? 0,
                                localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                              ),
                              ((JSON.parse(data.main)?.currency &&
                                JSON.parse(JSON.parse(data.main)?.currency)
                                  ?.symbol) ||
                                localStorage.getItem(
                                  "selectedCurrencySymbol",
                                )) ??
                              selectedSymbol,
                            )}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {isRTL
                              ? JSON.parse(data.main)?.paymentMethodAr
                              : JSON.parse(data.main)?.paymentMethod}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                  <tr
                    key={data1?.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-2 py-2">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div>
                          <span className="text-foreground">
                            {isRTL ? "المجموع " : "Total"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2"></td>
                    <td className="px-2 py-2"></td>
                    {reportType === "Payment Reports" ||
                      (reportType === "Profit Reports" && (
                        <td className="px-2 py-2"></td>
                      ))}

                    {reportType === "Profit Reports" && (
                      <td className="px-2 py-2"></td>
                    )}
                    {reportType === "Profit Reports" && (
                      <td className="px-2 py-2"></td>
                    )}
                    {reportType !== "Payment Reports" &&
                      reportType !== "Profit Reports" &&
                      reportType !== "Daily Entries" &&
                      reportType !== "Receipt Vouchers" &&
                      reportType !== "Expenses" && (
                        <td className="px-2 py-2">
                          <span className="font-semibold text-foreground">
                            {formatAmount(
                              convertAmount(
                                data1?.paidAmount ?? 0,
                                localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                              ),
                              ((data1?.currency &&
                                JSON.parse(data1?.currency)?.symbol) ||
                                localStorage.getItem(
                                  "selectedCurrencySymbol",
                                )) ??
                              selectedSymbol,
                            )}
                          </span>
                        </td>
                      )}
                    {reportType !== "Payment Reports" &&
                      reportType !== "Profit Reports" &&
                      reportType !== "Daily Entries" &&
                      reportType !== "Receipt Vouchers" &&
                      reportType !== "Expenses" && (
                        <td className="px-2 py-2">
                          <span className="font-semibold text-foreground">
                            {formatAmount(
                              convertAmount(
                                data1?.returnAmount ?? 0,
                                localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                              ),
                              ((data1?.currency &&
                                JSON.parse(data1?.currency)?.symbol) ||
                                localStorage.getItem(
                                  "selectedCurrencySymbol",
                                )) ??
                              selectedSymbol,
                            )}
                          </span>
                        </td>
                      )}
                    {reportType !== "Profit Reports" && (
                      <td className="px-2 py-2">
                        <span className="font-semibold text-foreground">
                          {formatAmount(
                            convertAmount(
                              data1?.totalAmount ?? 0,
                              localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                            ),
                            ((data1?.currency &&
                              JSON.parse(data1?.currency)?.symbol) ||
                              localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                          )}
                        </span>
                      </td>
                    )}
                    {reportType === "Profit Reports" && (
                      <td className="px-2 py-2">
                        <span className="font-semibold text-foreground">
                          {formatAmount(
                            convertAmount(
                              totals?.unitPrice2 ?? 0,
                              localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                            ),
                            ((data1?.currency &&
                              JSON.parse(data1?.currency)?.symbol) ||
                              localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                          )}
                        </span>
                      </td>
                    )}
                    {reportType === "Profit Reports" && (
                      <td className="px-2 py-2"></td>
                    )}
                    {reportType === "Profit Reports" && (
                      <td className="px-2 py-2">
                        <span className="font-semibold text-foreground">
                          {formatAmount(
                            convertAmount(
                              totals?.unitPrice ?? 0,
                              localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                            ),
                            ((data1?.currency &&
                              JSON.parse(data1?.currency)?.symbol) ||
                              localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                          )}
                        </span>
                      </td>
                    )}
                    {reportType === "Profit Reports" && (
                      <td className="px-2 py-2"></td>
                    )}
                    {reportType === "Profit Reports" && (
                      <td className="px-2 py-2">
                        <span className="font-semibold text-foreground">
                          {formatAmount(
                            convertAmount(
                              totals?.profit ?? 0,
                              localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                            ),
                            ((data1?.currency &&
                              JSON.parse(data1?.currency)?.symbol) ||
                              localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                          )}
                        </span>
                      </td>
                    )}
                  </tr>

                  <tr className="w-4 h-8">
                    <td className="px-2 py-2"></td>
                  </tr>
                  <tr className="w-4 h-8">
                    <td className="px-2 py-2"></td>
                  </tr>
                </>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
