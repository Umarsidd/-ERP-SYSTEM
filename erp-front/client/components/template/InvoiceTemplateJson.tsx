import React from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  User,
} from "lucide-react";
import { getStatusColor, getStatusLabel } from "@/lib/function";
import { MainIcon } from "../common/mainIcon";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";

export function UnifiedInvoiceTemplateJson({
  invoice,
  isRTL = false,
  mode = "view",
  className = "",
}) {
  const { formatAmount, convertAmount } = useCurrency();

  const containerClasses = {
    view: "bg-white text-black p-4 sm:p-6 lg:p-8 rounded-lg border border-border",
    print: "bg-white text-black print-invoice",
    pdf: "bg-white text-black",
    preview: "bg-white text-black p-8",
  };

  return (
    <>
      <style>{`
        @media print {
          .print-invoice {
            margin: 0 !important;
            padding: 15mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }

        .mobile-responsive {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
        }

        /* Compact table styles */
        .compact-table {
          font-size: 0.8rem;
        }
        
        .compact-table th,
        .compact-table td {
          padding: 0.35rem 0.5rem !important;
        }
        
        .compact-table th {
          font-size: 0.75rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .mobile-responsive {
            font-size: 13px;
          }
          .mobile-responsive h1 {
            font-size: 20px !important;
          }
          .mobile-responsive h2 {
            font-size: 18px !important;
          }
          .mobile-responsive .invoice-header {
            flex-direction: column !important;
            gap: 12px;
          }
          .mobile-responsive .invoice-details {
            grid-template-columns: 1fr !important;
            gap: 12px;
          }
          .mobile-responsive table {
            font-size: 11px;
          }
        }
      `}</style>

      <div
        className={`${containerClasses[mode]} ${className} mobile-responsive`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Company Header - Compact */}
        <div className="flex flex-col space-y-2 mb-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 sm:mb-5 invoice-header">
          <div className="flex-1 mx-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
              {JSON.parse(localStorage.getItem("logo"))?.logoText || ""}
            </h1>
            <div className="text-gray-600 space-y-0 text-xs sm:text-sm">
              {JSON.parse(localStorage.getItem("logo"))?.logoAddress && (
                <p>{JSON.parse(localStorage.getItem("logo"))?.logoAddress}</p>
              )}
              {(JSON.parse(localStorage.getItem("logo"))?.logoPhone || JSON.parse(localStorage.getItem("logo"))?.logoPhone2) && (
                <p>
                  {JSON.parse(localStorage.getItem("logo"))?.logoPhone && (
                    <span>{JSON.parse(localStorage.getItem("logo"))?.logoPhone}</span>
                  )}
                  {JSON.parse(localStorage.getItem("logo"))?.logoPhone2 && (
                    <span>{JSON.parse(localStorage.getItem("logo"))?.logoPhone ? " - " : ""}{JSON.parse(localStorage.getItem("logo"))?.logoPhone2}</span>
                  )}
                </p>
              )}
              {JSON.parse(localStorage.getItem("logo"))?.logoEmail && (
                <p>{JSON.parse(localStorage.getItem("logo"))?.logoEmail}</p>
              )}
            </div>
          </div>

          <div className="flex-1 mt-0">
            {JSON.parse(localStorage.getItem("logo"))?.logoUrl && (
              <img
                src={JSON.parse(localStorage.getItem("logo"))?.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            )}
          </div>

          <div className="text-left sm:text-right rtl:text-right sm:rtl:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
              {isRTL ? "فـــاتـــورة" : "INVOICE"}
            </h2>
            <div className="space-y-1">
              <p className="font-semibold text-xs sm:text-sm">
                {invoice.elementNumber || ""}
              </p>
              {invoice.status && (
                <div
                  className={`inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
                >
                  <MainIcon icon={invoice.status} />
                  <span>{getStatusLabel(invoice.status, isRTL)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details - Compact */}
        <div className="grid grid-cols-1 gap-3 mb-4 sm:gap-4 sm:mb-5 lg:grid-cols-2 invoice-details">
          {/* Bill To */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 flex items-center">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
              {isRTL ? "فاتورة إلى:" : "Bill To:"}
            </h3>
            <div className="space-y-1 text-gray-600 text-xs sm:text-sm">
              {JSON.parse(invoice.main)?.customer?.name && (
                <p className="font-semibold text-gray-800 break-words">
                  {JSON.parse(invoice.main)?.customer?.name}
                </p>
              )}
              {JSON.parse(invoice.main).customer?.email && (
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                  <span className="break-all">
                    {JSON.parse(invoice.main).customer?.email}
                  </span>
                </div>
              )}
              {JSON.parse(invoice.main)?.customer?.phone && (
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                  <span className="break-words">
                    {JSON.parse(invoice.main)?.customer?.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 flex items-center">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
              {isRTL ? "تفاصيل الفاتورة:" : "Invoice Details:"}
            </h3>
            <div className="space-y-1 text-gray-600 text-xs sm:text-sm">
              {JSON.parse(invoice.main)?.issueDate && (
                <div className="flex justify-between items-start">
                  <span className="flex-shrink-0">
                    {isRTL ? "تاريخ الإصدار:" : "Issue Date:"}
                  </span>
                  <span className="font-medium text-right">
                    {new Date(
                      JSON.parse(invoice.main)?.issueDate,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              {JSON.parse(invoice.main)?.dueDate && (
                <div className="flex justify-between items-start">
                  <span className="flex-shrink-0">
                    {invoice.tableName == "purchase_invoices"
                      ? isRTL
                        ? "تاريخ التسليم:"
                        : "Delivery Date:"
                      : isRTL
                        ? "تاريخ الاستحقاق:"
                        : "Due Date:"}
                  </span>
                  <span className="font-medium text-right">
                    {new Date(
                      JSON.parse(invoice.main)?.dueDate,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              {JSON.parse(invoice.main)?.paymentTerm && (
                <div className="flex justify-between items-start">
                  <span className="flex-shrink-0">
                    {isRTL ? "شروط الدفع:" : "Payment Terms:"}
                  </span>
                  <span className="font-medium text-right break-words">
                    {JSON.parse(invoice.main)?.paymentTerm}
                    <span className="flex-shrink-0">
                      {isRTL ? " يوم " : " day "}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table - Compact */}
        <div className="mb-4 sm:mb-5">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
            {isRTL ? "بنود الفاتورة" : "Invoice Items"}
          </h3>

          {/* Mobile View - Card Layout */}
          <div className="space-y-4 sm:hidden">
            {JSON.parse(invoice.main)?.items?.map((item, index) => (
              <div
                key={item.id || index}
                className="border border-gray-300 rounded-lg p-4 bg-gray-50"
              >
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm break-words">
                      {item.productName || item.description}
                    </p>
                    {item.productName && item.description && (
                      <p className="text-xs text-gray-500 break-words">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">
                        {isRTL ? "الكمية:" : "Qty:"}
                      </span>
                      <span className="font-medium ml-2">
                        {item.quantity} {item.unitName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {isRTL ? "الضريبة:" : "Tax:"}
                      </span>
                      <span className="font-medium ml-2">{item.taxRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {isRTL ? "السعر:" : "Price:"}
                      </span>
                      <span className="font-medium ml-2">
                        {formatAmount(
                          convertAmount(
                            item.unitPrice,
                            localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                          ),
                          ((JSON.parse(invoice.main)?.currency &&
                            JSON.parse(JSON.parse(invoice.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                          selectedSymbol,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {isRTL ? "الإجمالي:" : "Total:"}
                      </span>
                      <span className="font-semibold ml-2 text-primary">
                        {formatAmount(
                          convertAmount(
                            item.total,
                            localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                          ),
                          ((JSON.parse(invoice.main)?.currency &&
                            JSON.parse(JSON.parse(invoice.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                          selectedSymbol,
                        )}
                      </span>
                    </div>
                  </div>
                  {item.discount && item.discount > 0 ? (
                    <div className="text-xs text-red-600">
                      <span>{isRTL ? "خصم:" : "Discount:"}</span>
                      <span className="ml-2">
                        {item.discountType === "percentage"
                          ? `${item.discount}%`
                          : formatAmount(
                            convertAmount(
                              item.discount,
                              localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                            ),
                            ((JSON.parse(invoice.main)?.currency &&
                              JSON.parse(JSON.parse(invoice.main)?.currency)
                                ?.symbol) ||
                              localStorage.getItem(
                                "selectedCurrencySymbol",
                              )) ??
                            selectedSymbol,
                          )}
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table Layout - Compact */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border border-gray-300 compact-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-1.5 text-left rtl:text-right font-semibold">
                    {isRTL ? "الاسم" : "Name"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold w-16">
                    {isRTL ? "الكمية" : "Qty"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left font-semibold w-20">
                    {isRTL ? "السعر" : "Price"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold w-16">
                    {isRTL ? "خصم" : "Discount"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold w-14">
                    {isRTL ? "ضريبة %" : "Tax %"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left font-semibold w-20">
                    {isRTL ? "الإجمالي" : "Total"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {JSON.parse(invoice.main)?.items?.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-2 py-1.5">
                      <div>
                        <div className="font-medium break-words text-xs">
                          {item.productName || item.description}
                        </div>
                        {item.productName && item.description && (
                          <div className="text-[10px] text-gray-500 break-words">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      {item.quantity} {item.unitName}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left">
                      {formatAmount(
                        convertAmount(
                          item.unitPrice,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        ((JSON.parse(invoice.main)?.currency &&
                          JSON.parse(JSON.parse(invoice.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-3 text-center lg:px-4">
                      {item.discount && item.discount > 0 ? (
                        <span className="text-red-600">
                          {item.discountType === "percentage"
                            ? `${item.discount}%`
                            : formatAmount(
                              convertAmount(
                                item.discount,
                                localStorage.getItem("selectedCurrency") ??
                                selectedCurrency,
                              ),
                              ((JSON.parse(invoice.main)?.currency &&
                                JSON.parse(JSON.parse(invoice.main)?.currency)
                                  ?.symbol) ||
                                localStorage.getItem(
                                  "selectedCurrencySymbol",
                                )) ??
                              selectedSymbol,
                            )}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      {item.taxRate}%
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left font-semibold">
                      {formatAmount(
                        convertAmount(
                          item.total,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        ((JSON.parse(invoice.main)?.currency &&
                          JSON.parse(JSON.parse(invoice.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals - Compact with Enhanced Visual Hierarchy */}
        <div className="flex justify-end mb-4 sm:mb-5">
          <div className="w-full max-w-xs">
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{isRTL ? "المجموع الفرعي:" : "Subtotal:"}</span>
                <span className="font-medium">
                  {formatAmount(
                    convertAmount(
                      JSON.parse(invoice.main).amount?.subtotal,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                    ((JSON.parse(invoice.main)?.currency &&
                      JSON.parse(JSON.parse(invoice.main)?.currency)?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                    selectedSymbol,
                  )}
                </span>
              </div>
              {JSON.parse(invoice.main).amount?.totalItemDiscounts > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>{isRTL ? "خصومات البنود:" : "Item Discounts:"}</span>
                  <span className="font-medium">
                    -
                    {formatAmount(
                      convertAmount(
                        JSON.parse(invoice.main)?.amount?.totalItemDiscounts,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      ((JSON.parse(invoice.main)?.currency &&
                        JSON.parse(JSON.parse(invoice.main)?.currency)
                          ?.symbol) ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{isRTL ? "الضريبة:" : "Tax:"}</span>
                <span className="font-medium">
                  {formatAmount(
                    convertAmount(
                      JSON.parse(invoice.main)?.amount?.totalTax,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                    ((JSON.parse(invoice.main)?.currency &&
                      JSON.parse(JSON.parse(invoice.main)?.currency)?.symbol) ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                    selectedSymbol,
                  )}
                </span>
              </div>
              {JSON.parse(invoice.main)?.amount?.discount > 0 ? (
                <div className="flex justify-between text-red-600">
                  <span>{isRTL ? "خصم الفاتورة:" : "Invoice Discount:"}</span>
                  <span className="font-medium">
                    -
                    {formatAmount(
                      convertAmount(
                        JSON.parse(invoice.main)?.amount?.discount,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      ((JSON.parse(invoice.main)?.currency &&
                        JSON.parse(JSON.parse(invoice.main)?.currency)
                          ?.symbol) ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              ) : (
                <></>
              )}
              {
                //  JSON.parse(invoice.main).shippingCost > 0 &&
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "الشحن:" : "Shipping:"}</span>
                  <span className="font-medium">
                    {formatAmount(
                      convertAmount(
                        JSON.parse(invoice.main)?.shippingCost,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      ((JSON.parse(invoice.main)?.currency &&
                        JSON.parse(JSON.parse(invoice.main)?.currency)
                          ?.symbol) ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              }
              <div className="border-t border-gray-300 pt-1.5 mt-1.5">
                <div className="flex justify-between text-sm sm:text-base font-bold text-gray-800">
                  <span>{isRTL ? "الإجمالي:" : "Total:"}</span>
                  <span className="text-blue-600">
                    {formatAmount(
                      convertAmount(
                        JSON.parse(invoice.main)?.amount?.total,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      ((JSON.parse(invoice.main)?.currency &&
                        JSON.parse(JSON.parse(invoice.main)?.currency)
                          ?.symbol) ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              </div>
              {/* Paid Amount / Deposit */}
              {JSON.parse(invoice.main).depositAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "المبلغ المدفوع:" : "Paid Amount:"}</span>
                  <span className="font-medium">
                    -
                    {formatAmount(
                      convertAmount(
                        JSON.parse(invoice.main).depositAmount,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      ((JSON.parse(invoice.main)?.currency &&
                        JSON.parse(JSON.parse(invoice.main)?.currency)
                          ?.symbol) ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              )}

              {/* Amount Due - Most prominent */}
              {JSON.parse(invoice.main).depositAmount > 0 ? (
                <div className="border-t-2 border-green-600 pt-1.5 mt-1.5">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-green-600">
                    <span>{isRTL ? "المبلغ المستحق:" : "Amount Due:"}</span>
                    <span>
                      {formatAmount(
                        convertAmount(
                          JSON.parse(invoice.main).amount.total -
                          JSON.parse(invoice.main).depositAmount,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        ((JSON.parse(invoice.main)?.currency &&
                          JSON.parse(JSON.parse(invoice.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-t-2 border-green-600 pt-1.5 mt-1.5">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-green-600">
                    <span>{isRTL ? "المبلغ المستحق:" : "Amount Due:"}</span>
                    <span>
                      {formatAmount(
                        convertAmount(
                          JSON.parse(invoice.main)?.amount?.total,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        ((JSON.parse(invoice.main)?.currency &&
                          JSON.parse(JSON.parse(invoice.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {JSON.parse(invoice.main).shippingAddress && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
              {isRTL ? "معلومات الشحن:" : "Shipping Information:"}
            </h4>
            <div className="text-xs sm:text-sm text-gray-600">
              {JSON.parse(invoice.main).shippingMethod && (
                <p>
                  <strong>{isRTL ? "طريقة الشحن:" : "Method:"}</strong>{" "}
                  {JSON.parse(invoice.main).shippingMethod}
                </p>
              )}
              <p>
                <strong>{isRTL ? "العنوان:" : "Address:"}</strong>{" "}
                {isRTL
                  ? JSON.parse(invoice.main).shippingAddressAr ||
                  JSON.parse(invoice.main).shippingAddress
                  : JSON.parse(invoice.main).shippingAddress}
              </p>
            </div>
          </div>
        )}

        {/* Notes and Terms */}
        <div className="grid grid-cols-1 px-4 gap-6 sm:gap-8 lg:grid-cols-2 mb-6 sm:mb-8">
          {(JSON.parse(invoice.main).notes ||
            JSON.parse(invoice.main).notesAr) && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  {isRTL ? "ملاحظات:" : "Notes:"}
                </h3>
                <div className="text-gray-600 text-sm sm:text-base break-words">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: isRTL
                        ? JSON.parse(invoice.main).notesAr ||
                        JSON.parse(invoice.main).notes ||
                        ""
                        : JSON.parse(invoice.main).notes ||
                        JSON.parse(invoice.main).notesAr ||
                        "",
                    }}
                  />
                </div>
              </div>
            )}
          {(JSON.parse(invoice.main).terms ||
            JSON.parse(invoice.main).termsAr) && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  {isRTL ? "الشروط والأحكام:" : "Terms & Conditions:"}
                </h3>
                <div className="text-gray-600 text-sm sm:text-base break-words">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: isRTL
                        ? JSON.parse(invoice.main).termsAr ||
                        JSON.parse(invoice.main).terms ||
                        "الدفع مستحق خلال 30 يوماً من تاريخ الفاتورة. قد تُطبق رسوم تأخير."
                        : JSON.parse(invoice.main).terms ||
                        JSON.parse(invoice.main).termsAr ||
                        "Payment is due within 30 days of invoice date. Late fees may apply.",
                    }}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 sm:pt-6 text-center text-gray-500">
          <p className="text-xs sm:text-sm">
            {isRTL ? "شكراً لتعاملكم معنا" : "Thank you for your business"}
          </p>
          <p className="text-xs mt-2">
            {isRTL
              ? "تم إنشاؤه بواسطة نظام إدارة الموارد"
              : "Generated by ERP Management System"}{" "}
            - {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </>
  );
}
