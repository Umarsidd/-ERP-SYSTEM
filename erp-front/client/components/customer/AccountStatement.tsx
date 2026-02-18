import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStatusLabel } from "@/lib/function";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import { Filters } from "@/components/sales/filters";

export function AccountStatement(props: {
  customer;
  invoices;
  isLoading;
  invoiceNum;
  paymentNum;
  returns;
  returnNum;
  creditNotes;
  creditNoteNum;
  statementData?: any[];
  advancedFilters?: any;
  setAdvancedFilters?: any;
  showAdvancedFilters?: boolean;
  setShowAdvancedFilters?: any;
  sort?: any;
  setSort?: any;
  hasActiveFilters?: boolean;
  clearAllFilters?: any;
}) {
  const {
    customer,
    invoices,
    isLoading,
    invoiceNum,
    paymentNum,
    returns,
    returnNum,
    creditNotes,
    creditNoteNum,
    statementData = [],
    advancedFilters,
    setAdvancedFilters,
    showAdvancedFilters,
    setShowAdvancedFilters,
    sort,
    setSort,
    hasActiveFilters,
    clearAllFilters,
  } = props;
  const { formatAmount, convertAmount, currentCurrency } = useCurrency();
  const statementRef = useRef<HTMLDivElement>(null);
  const { isRTL } = useLanguage();

  // Use statementData from props (already filtered server-side)
  const rows = statementData ?? [];

  const creditNames = [
    "sales_return",
    "sales_credit_notices",
    "purchase_return",
    "purchase_credit_notices",
  ];

  const debitNames = ["sales_payment", "purchase_payment", "OpeningBalance"];

  // Data is already filtered server-side, just apply client-side sorting if needed
  let sortedRows = [...rows].filter((r) => r.show !== false);

  // Apply sorting based on sort field
  if (sort?.field) {
    sortedRows.sort((a, b) => {
      let aVal, bVal;

      switch (sort.field) {
        case "date":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "amount":
          aVal = a.totalAmount || a.paidAmount;
          bVal = b.totalAmount || b.paidAmount;
          break;
        case "reference":
          aVal = a.elementNumber || "";
          bVal = b.elementNumber || "";
          break;
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (sort.direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  let runningBalance = 0; // Reset running balance for calculation

  // Format rows with balance calculation
  const formattedRows = sortedRows.map((r) => {
    // Determine which raw amount to use
    const baseAmount =
      debitNames.includes(r.name) || creditNames.includes(r.name)
        ? r.totalAmount
        : r.paidAmount;

    // Convert amount to system currency before calculating balance
    const convertedAmount = convertAmount(
      baseAmount,
      localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
        ? JSON.parse(r?.currency)?.code
        : (localStorage.getItem("selectedCurrency") ?? selectedCurrency),
    );

    // Negative for credit/return rows, positive otherwise
    const signedAmount = creditNames.includes(r.name)
      ? -convertedAmount
      : convertedAmount;

    runningBalance += signedAmount;

    return { ...r, signedAmount, balance: runningBalance };
  });

  useEffect(() => {
    // Update the document title using the browser API
    console.log(
      "JSON.parse(customer?.meta)?.data",
      JSON.parse(customer?.meta)?.data,
    );
  }, []);

  const printStatement = (customer) => {
    const win = window.open("", "_blank");
    if (!win) return;

    const style = `
      <style>
        body { font-family: Inter, Arial, sans-serif; padding: 20px; color: #111827; direction: ${isRTL ? "rtl" : "ltr"}; text-align: ${isRTL ? "right" : "left"}; }
        .header { text-align: center; margin-bottom: 20px; }
        h2 { margin: 0; font-size: 24px; }
        h3 { margin: 20px 0 10px 0; font-size: 18px; }
        .customer { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: ${isRTL ? "right" : "left"}; }
        th { background: #f9fafb; font-weight: 600; }
        .text-right { text-align: right; }
        .summary-table { margin-bottom: 30px; }
        .section-title { font-size: 16px; font-weight: 600; margin: 20px 0 10px 0; }
        @media print { 
          img { max-width: 100%; }
          body { padding: 10px; }
        }
      </style>
    `;

    const heading = `<div class="header"><h2>${isRTL ? "بيان حساب" : "Account Statement"}</h2><div>${isRTL ? "تقرير مفصل للحساب " : "Detailed report of account"}</div></div>`;

    const customerInfo = `
      <div class="customer">
        <strong>${customer.name}</strong><br/>
        ${customer.company ? `<div>${customer.company}</div>` : ""}
        ${customer.phone ? `<div><span>${customer.phone}</span></div>` : ""}
        ${customer.email ? `<div><span>${customer.email}</span></div>` : ""}
      </div>
    `;

    // Account Summary Table
    const summarySection = `
      <h3 class="section-title">${isRTL ? "ملخص الحساب" : "Account Summary"}</h3>
      <table class="summary-table">
        <tbody>
          <tr>
            <td><strong>${isRTL ? "الرصيد الافتتاحي" : "Opening Balance"}</strong></td>
            <td>${formatAmount(
      convertAmount(
        JSON.parse(customer.main)?.openingBalance ?? 0,
        localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      ),
    )}</td>
          </tr>
          <tr>
            <td><strong>${isRTL ? "الاجمالي" : "Total"}</strong></td>
            <td>${formatAmount(
      convertAmount(
        invoiceNum + (JSON.parse(customer.main)?.openingBalance ?? 0),
        localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      ),
    )}</td>
          </tr>
          <tr>
            <td><strong>${isRTL ? "المدفوعات" : "Payments Received"}</strong></td>
            <td>${formatAmount(
      convertAmount(
        paymentNum,
        localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      ),
    )}</td>
          </tr>
          <tr>
            <td><strong>${isRTL ? "مرتجعات" : "Returns"}</strong></td>
            <td>${formatAmount(
      convertAmount(
        returnNum,
        localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      ),
    )}</td>
          </tr>
          <tr>
            <td><strong>${isRTL ? "اشعارات دائنه" : "Credit Notes"}</strong></td>
            <td>${formatAmount(
      convertAmount(
        creditNoteNum,
        localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      ),
    )}</td>
          </tr>
          <tr>
            <td><strong>${isRTL ? "المبلغ المستحق" : "Outstanding Amount"}</strong></td>
            <td><strong>${formatAmount(
      convertAmount(
        invoiceNum +
        (JSON.parse(customer.main)?.openingBalance ?? 0) -
        paymentNum -
        returnNum -
        creditNoteNum,
        localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      ),
    )}</strong></td>
          </tr>
        </tbody>
      </table>
    `;

    // Account Statement Table
    const statementSection = `
      <h3 class="section-title">${isRTL ? "بيان الحساب" : "Account Statement"}</h3>
      <p style="margin-bottom: 10px; color: #6b7280; font-size: 12px;">${isRTL ? "تفاصيل المعاملات والرصيد" : "Transactions and running balance"}</p>
      <table>
        <thead>                   
          <tr>
            <th>${isRTL ? "التاريخ" : "Date"}</th>
            <th>${isRTL ? "المرجع" : "Reference"}</th>
            <th>${isRTL ? "المبلغ المستحق" : "Outstanding Amount"}</th>
            <th>${isRTL ? "المبلغ المدفوع" : "Paid Amount"}</th>
            <th>${isRTL ? "الرصيد" : "Balance"}</th>
          </tr>
        </thead>
        <tbody>`;

    const rows = formattedRows
      ?.map(
        (r) =>
          `<tr>
            <td>${new Date(r.createdAt).toLocaleDateString("en-US")}</td>
            <td>${getStatusLabel(r.name, isRTL) + " " + r.elementNumber}</td>
            <td>${formatAmount(
            convertAmount(
              creditNames.includes(r.name) ? r.paidAmount : r.totalAmount,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
                ? JSON.parse(r?.currency)?.code
                : (localStorage.getItem("selectedCurrency") ?? selectedCurrency),
            ),
            r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
              ? JSON.parse(r?.currency)?.symbol
              : (localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol),
          )}</td>
            <td>${formatAmount(
            convertAmount(
              debitNames.includes(r.name) || creditNames.includes(r.name)
                ? r.totalAmount
                : r.paidAmount,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
                ? JSON.parse(r?.currency)?.code
                : (localStorage.getItem("selectedCurrency") ?? selectedCurrency),
            ),
            r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
              ? JSON.parse(r?.currency)?.symbol
              : (localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol),
          )}</td>
            <td><strong>${formatAmount(
            convertAmount(
              r.balance,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
                ? JSON.parse(r?.currency)?.code
                : (localStorage.getItem("selectedCurrency") ?? selectedCurrency),
            ),
            r?.currency !== undefined && JSON.parse(r?.currency) !== undefined
              ? JSON.parse(r?.currency)?.symbol
              : (localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol),
          )}</strong></td>
          </tr>`,
      )
      .join("");

    const closing = `</tbody></table>`;

    win.document.open();
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${isRTL ? "بيان حساب" : "Account Statement"}</title>${style}</head><body>${heading}${customerInfo}${summarySection}${statementSection}${rows}${closing}</body></html>`,
    );
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

  return (
    <>
      <Card className="p-4 mb-8" ref={statementRef as any}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {isRTL ? "ملخص الحساب" : "Account Summary"}
            </h3>
            {/* <div className="text-sm text-muted-foreground">
                              {isRTL ? "ملخص الحساب" : "Account Summary"}
                            </div> */}
          </div>
          <div className="flex items-center gap-2"></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3">
                  {isRTL ? "الرصيد الافتتاحي" : "Opening Balance"}
                </td>{" "}
                <td className="px-4 py-3">
                  {" "}
                  {formatAmount(
                    convertAmount(
                      JSON.parse(customer.main)?.openingBalance ?? 0,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                  )}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3"> {isRTL ? "الاجمالي" : "Total"}</td>{" "}
                <td className="px-4 py-3">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
                  ) : (
                    formatAmount(
                      convertAmount(
                        invoiceNum +
                        (JSON.parse(customer.main)?.openingBalance ?? 0),
                        // +
                        //   (JSON.parse(customer.main)?.openingBalance ?? 0)
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                    )
                  )}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3">
                  {" "}
                  {isRTL ? "المدفوعات" : "Payments Received"}
                </td>{" "}
                <td className="px-4 py-3">
                  {invoices.toString().length > 0
                    ? formatAmount(
                      convertAmount(
                        paymentNum,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                    )
                    : formatAmount(0)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3"> {isRTL ? "مرتجعات" : "Returns"}</td>{" "}
                <td className="px-4 py-3">
                  {returns.toString().length > 0
                    ? formatAmount(
                      convertAmount(
                        returnNum,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                    )
                    : formatAmount(0)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3">
                  {" "}
                  {isRTL ? "اشعارات دائنه" : "Credit Notes"}
                </td>{" "}
                <td className="px-4 py-3">
                  {creditNotes.toString().length > 0
                    ? formatAmount(
                      convertAmount(
                        creditNoteNum,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                    )
                    : formatAmount(0)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3">
                  {" "}
                  {isRTL ? "المبلغ المستحق" : "Outstanding Amount"}
                </td>{" "}
                <td className="px-4 py-3">
                  {formatAmount(
                    convertAmount(
                      invoiceNum +
                      (JSON.parse(customer.main)?.openingBalance ?? 0) -
                      paymentNum -
                      returnNum -
                      creditNoteNum,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* <div className="mt-4 text-right">
                            <div className="text-sm">
                              {isRTL ? "العملة" : "Currency"}:{" "}
                              <span className="font-medium">
                                {customer.currency}
                              </span>
                            </div>
                          </div> */}
      </Card>

      <Card className="p-4" ref={statementRef as any}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {isRTL ? "بيان الحساب" : "Account Statement"}
            </h3>
            <div className="text-sm text-muted-foreground">
              {isRTL
                ? "تفاصيل المعاملات والرصيد"
                : "Transactions and running balance"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => printStatement(customer)}>
              {isRTL ? "طباعة البيان" : "Print Statement"}
            </Button>
          </div>
        </div>

        {/* Filters Component */}
        {advancedFilters && setAdvancedFilters && (
          <div className="mb-4">
            <Filters
              title="AccountStatement"
              setShowAdvancedFilters={setShowAdvancedFilters}
              advancedFilters={advancedFilters}
              setAdvancedFilters={setAdvancedFilters}
              showAdvancedFilters={showAdvancedFilters}
              hasActiveFilters={hasActiveFilters}
              clearAllFilters={clearAllFilters}
              sort={sort}
              setSort={setSort}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start px-4 py-2 text-left">
                  {isRTL ? "التاريخ" : "Date"}
                </th>
                <th className="text-start px-4 py-2 text-left">
                  {isRTL ? "المرجع" : "Reference"}
                </th>
                <th className="text-start px-4 py-2 text-left">
                  {isRTL ? "المبلغ المستحق" : "Outstanding Amount"}
                </th>
                <th className="text-start px-4 py-2 text-left">
                  {isRTL ? "المبلغ المدفوع" : "Paid Amount"}
                </th>
                <th className="text-start px-4 py-2 text-left">
                  {isRTL ? "الرصيد" : "Balance"}
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedRows.map((r) => (
                <tr key={r.invoiceID} className="border-b">
                  <td className="px-4 py-3">
                    {new Date(r.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusLabel(r.name, isRTL) + " " + r.elementNumber}
                  </td>
                  <td className="px-4 py-3">
                    {formatAmount(
                      convertAmount(
                        creditNames.includes(r.name)
                          ? r.paidAmount
                          : r.totalAmount,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                        r?.currency !== undefined &&
                          JSON.parse(r?.currency) !== undefined
                          ? JSON.parse(r?.currency)?.code
                          : (localStorage.getItem("selectedCurrency") ??
                            selectedCurrency),
                      ),
                      r?.currency !== undefined &&
                        JSON.parse(r?.currency) !== undefined
                        ? JSON.parse(r?.currency)?.symbol
                        : (localStorage.getItem("selectedCurrencySymbol") ??
                          selectedSymbol),
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {formatAmount(
                      convertAmount(
                        debitNames.includes(r.name) ||
                          creditNames.includes(r.name)
                          ? r.totalAmount
                          : r.paidAmount,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                        r?.currency !== undefined &&
                          JSON.parse(r?.currency) !== undefined
                          ? JSON.parse(r?.currency)?.code
                          : (localStorage.getItem("selectedCurrency") ??
                            selectedCurrency),
                      ),
                      r?.currency !== undefined &&
                        JSON.parse(r?.currency) !== undefined
                        ? JSON.parse(r?.currency)?.symbol
                        : (localStorage.getItem("selectedCurrencySymbol") ??
                          selectedSymbol),
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatAmount(
                      convertAmount(
                        r.balance,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                        r?.currency !== undefined &&
                          JSON.parse(r?.currency) !== undefined
                          ? JSON.parse(r?.currency)?.code
                          : (localStorage.getItem("selectedCurrency") ??
                            selectedCurrency),
                      ),
                      r?.currency !== undefined &&
                        JSON.parse(r?.currency) !== undefined
                        ? JSON.parse(r?.currency)?.symbol
                        : (localStorage.getItem("selectedCurrencySymbol") ??
                          selectedSymbol),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <tbody>
              {JSON.parse(customer?.meta)?.data?.map(
                (r) =>
                  r.show !== false && (
                    <tr key={r.invoiceID} className="border-b">
                      <td className="px-4 py-3">
                        {new Date(r.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusLabel(r.name, isRTL) + " " + r.elementNumber}
                      </td>
                      <td className="px-4 py-3">
                        {formatAmount(
                          convertAmount(
                            r.name === "sales_return" ||
                              r.name === "sales_credit_notices" ||
                              r.name === "purchase_return" ||
                              r.name === "purchase_credit_notices"
                              ? r.paidAmount
                              : r.totalAmount,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          r?.currency !== undefined &&
                            JSON.parse(r?.currency) !== undefined
                            ? JSON.parse(r?.currency)?.symbol
                            : (localStorage.getItem("selectedCurrencySymbol") ??
                                selectedSymbol),
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatAmount(
                          convertAmount(
                            r.name === "sales_payment" ||
                              r.name === "purchase_payment" ||
                              r.name === "sales_return" ||
                              r.name === "sales_credit_notices" ||
                              r.name === "purchase_return" ||
                              r.name === "purchase_credit_notices" ||
                              r.name === "OpeningBalance"
                              ? r.totalAmount
                              : r.paidAmount,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          r?.currency !== undefined &&
                            JSON.parse(r?.currency) !== undefined
                            ? JSON.parse(r?.currency)?.symbol
                            : (localStorage.getItem("selectedCurrencySymbol") ??
                                selectedSymbol),
                        )}
                      </td>
                    </tr>
                  ),
              )}
            </tbody> */}
          </table>
        </div>

        {/* <div className="mt-4 text-right">
                            <div className="text-sm">
                              {isRTL ? "العملة" : "Currency"}:{" "}
                              <span className="font-medium">
                                {customer.currency}
                              </span>
                            </div>
                          </div> */}
      </Card>
    </>
  );
}
