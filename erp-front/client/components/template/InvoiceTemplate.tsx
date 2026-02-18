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

import { MainIcon } from "../common/mainIcon";
import { getStatusColor, getStatusLabel } from "@/lib/function";
import { calculateTotals, calculateItemTotal } from "@/lib/products_function";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";

export function UnifiedInvoiceTemplate({
  invoice,
  isRTL = false,
  mode = "view",
  className = "",
}) {
  const { formatAmount, convertAmount } = useCurrency();

  const totals = calculateTotals(invoice);

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
            padding: 10mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid;
            font-size: 11px !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print-invoice table {
            font-size: 10px !important;
          }
          .print-invoice table th,
          .print-invoice table td {
            padding: 4px 6px !important;
            line-height: 1.3 !important;
          }
          .print-invoice h1 {
            font-size: 18px !important;
            margin-bottom: 4px !important;
          }
          .print-invoice h2 {
            font-size: 16px !important;
            margin-bottom: 4px !important;
          }
          .print-invoice h3 {
            font-size: 13px !important;
            margin-bottom: 6px !important;
          }
          .print-invoice .invoice-header {
            margin-bottom: 12px !important;
          }
          .print-invoice .invoice-details {
            margin-bottom: 12px !important;
            gap: 12px !important;
          }
          .print-terms-hidden {
            display: none !important;
          }
        }

        .mobile-responsive {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          .mobile-responsive {
            font-size: 14px;
          }
          .mobile-responsive h1 {
            font-size: 24px !important;
          }
          .mobile-responsive h2 {
            font-size: 20px !important;
          }
          .mobile-responsive .invoice-header {
            flex-direction: column !important;
            gap: 20px;
          }
          .mobile-responsive .invoice-details {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
          .mobile-responsive table {
            font-size: 12px;
          }
        }
      `}</style>

      <div
        className={`${containerClasses[mode]} ${className} mobile-responsive`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Company Header */}
        <div className="flex flex-col space-y-4 mb-6 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 sm:mb-8 invoice-header">
          <div className="flex-1 mx-3">
            <h1 className="text-2xl sm:text-3xl font-bold text- mb-">
              {JSON.parse(localStorage.getItem("logo"))?.logoText}
            </h1>
            <div className="text-gray-600 space-y- text-sm sm:text-base">
              <p>{JSON.parse(localStorage.getItem("logo"))?.logoAddress}</p>
              <p>
                {" "}
                <span>
                  {JSON.parse(localStorage.getItem("logo"))?.logoPhone}
                </span>
                {JSON.parse(localStorage.getItem("logo"))?.logoPhone2 && (
                  <span>
                    - {JSON.parse(localStorage.getItem("logo"))?.logoPhone2}
                  </span>
                )}
              </p>
              <p>{JSON.parse(localStorage.getItem("logo"))?.logoEmail}</p>
            </div>
          </div>

          <div className=" flex-1 mt-">
            {JSON.parse(localStorage.getItem("logo"))?.logoUrl && (
              <img
                src={JSON.parse(localStorage.getItem("logo"))?.logoUrl}
                alt="Logo"
                className="w-20  object-contain rounded- mx- "
              />
            )}
          </div>
          <div className="text-left sm:text-right rtl:text-right sm:rtl:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {isRTL ? "فـــاتـــورة" : "INVOICE"}
            </h2>
            <div className="space-y-2">
              <p className="font-semibold text-sm sm:text-lg">
                {invoice.elementNumber}
              </p>
              <div
                className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(invoice.status)}`}
              >
                <MainIcon icon={invoice.status} />
                <span>{getStatusLabel(invoice.status, isRTL)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 gap-6 mb-6 sm:gap-8 sm:mb-8 lg:grid-cols-2 invoice-details">
          {/* Bill To */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {isRTL ? "فاتورة إلى:" : "Bill To:"}
            </h3>
            <div className="space-y-2 text-gray-600 text-sm sm:text-base">
              <p className="font-semibold text-gray-800 break-words">
                {isRTL
                  ? invoice.customer.name || invoice.customer.name
                  : invoice.customer.name}
              </p>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-all">{invoice.customer.email}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-words">{invoice.customer.phone}</span>
              </div>
              {/* <div className="flex items-start space-x-2 rtl:space-x-reverse">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                <span className="break-words">
                  {isRTL
                    ? invoice.customer.addressAr || invoice.customer.address
                    : invoice.customer.address}
                </span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Hash className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-words">
                  {isRTL ? "الرقم الضريبي:" : "Tax ID:"}{" "}
                  {invoice.customer.taxNumber}
                </span>
              </div> */}
            </div>
          </div>

          {/* Invoice Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {isRTL ? "تفاصيل الفاتورة:" : "Invoice Details:"}
            </h3>
            <div className="space-y-2 text-gray-600 text-sm sm:text-base">
              <div className="flex justify-between items-start">
                <span className="flex-shrink-0">
                  {isRTL ? "تاريخ الإصدار:" : "Issue Date:"}
                </span>
                <span className="font-medium text-right">
                  {new Date(
                    invoice.date || invoice.issueDate || new Date(),
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="flex-shrink-0">
                  {invoice.saleOrPurchase == "purchase"
                    ? isRTL
                      ? "تاريخ التسليم:"
                      : "Delivery Date:"
                    : isRTL
                      ? "تاريخ الاستحقاق:"
                      : "Due Date:"}
                </span>
                <span className="font-medium text-right">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              {/* {(invoice.salesRep || invoice.salesPerson) && (
                <div className="flex justify-between items-start">
                  <span className="flex-shrink-0">
                    {isRTL ? "مندوب المبيعات:" : "Sales Rep:"}
                  </span>
                  <span className="font-medium text-right break-words">
                    {isRTL
                      ? invoice.salesRep?.nameAr ||
                        invoice.salesPersonAr ||
                        invoice.salesRep?.name ||
                        invoice.salesPerson
                      : invoice.salesRep?.name ||
                        invoice.salesPerson ||
                        invoice.salesRep?.nameAr ||
                        invoice.salesPersonAr}
                  </span>
                </div>
              )} */}
              {invoice.paymentTerm && (
                <div className="flex justify-between items-start">
                  <span className="flex-shrink-0">
                    {isRTL ? "شروط الدفع:" : "Payment Terms:"}
                  </span>
                  <span className="font-medium text-right break-words">
                    {invoice.paymentTerm}
                    <span className="flex-shrink-0">
                      {isRTL ? " يوم " : " day "}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "بنود الفاتورة" : "Invoice Items"}
          </h3>

          {/* Mobile View - Card Layout */}
          <div className="space-y-4 sm:hidden">
            {invoice.items.map((item, index) => (
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
                          (JSON.parse(invoice?.currency)?.symbol ||
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
                            item.total || calculateItemTotal(item),
                            localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                          ),
                          (JSON.parse(invoice?.currency)?.symbol ||
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
                            (JSON.parse(invoice?.currency)?.symbol ||
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

          {/* Desktop View - Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-2 py-1.5 text-left rtl:text-right font-semibold text-xs">
                    {isRTL ? "الاسم" : "Name"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold w-16 text-xs">
                    {isRTL ? "الكمية" : "Qty"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left font-semibold w-20 text-xs">
                    {isRTL ? "السعر" : "Price"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold w-16 text-xs">
                    {isRTL ? "خصم" : "Disc."}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-center font-semibold w-14 text-xs">
                    {isRTL ? "ضرائب %" : "Tax %"}
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left font-semibold w-20 text-xs">
                    {isRTL ? "الإجمالي" : "Total"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-2 py-1.5 text-xs">
                      <div>
                        <div className="font-medium break-words">
                          {item.productName || item.description}
                        </div>
                        {item.productName && item.description && (
                          <div className="text-[10px] text-gray-500 break-words">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-xs">
                      {item.quantity} {item.unitName}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left text-xs">
                      {formatAmount(
                        convertAmount(
                          item.unitPrice,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        (JSON.parse(invoice?.currency)?.symbol ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-xs">
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
                              (JSON.parse(invoice?.currency)?.symbol ||
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
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-xs">
                      {item.taxRate}%
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right rtl:text-left font-semibold text-xs">
                      {formatAmount(
                        convertAmount(
                          item.total || calculateItemTotal(item),
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        (JSON.parse(invoice?.currency)?.symbol ||
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

        {/* Totals */}
        <div className="flex justify-end mb-6 sm:mb-8">
          <div className="w-full max-w-sm">
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between text-gray-600">
                <span>{isRTL ? "المجموع الفرعي:" : "Subtotal:"}</span>
                <span className="font-medium">
                  {formatAmount(
                    convertAmount(
                      totals.subtotal,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                    (JSON.parse(invoice?.currency)?.symbol ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                    selectedSymbol,
                  )}
                </span>
              </div>
              {totals.totalItemDiscounts > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>{isRTL ? "خصومات البنود:" : "Item Discounts:"}</span>
                  <span className="font-medium">
                    -
                    {formatAmount(
                      convertAmount(
                        totals.totalItemDiscounts,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      (JSON.parse(invoice?.currency)?.symbol ||
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
                      totals.totalTax,
                      localStorage.getItem("selectedCurrency") ??
                      selectedCurrency,
                    ),
                    (JSON.parse(invoice?.currency)?.symbol ||
                      localStorage.getItem("selectedCurrencySymbol")) ??
                    selectedSymbol,
                  )}
                </span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>{isRTL ? "خصم الفاتورة:" : "Invoice Discount:"}</span>
                  <span className="font-medium">
                    -
                    {formatAmount(
                      convertAmount(
                        totals.discount,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      (JSON.parse(invoice?.currency)?.symbol ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              )}
              {
                <div className="flex justify-between text-gray-600">
                  <span>{isRTL ? "الشحن:" : "Shipping:"}</span>
                  <span className="font-medium">
                    {formatAmount(
                      convertAmount(
                        invoice.shippingCost,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      (JSON.parse(invoice?.currency)?.symbol ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              }
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                  <span>{isRTL ? "الإجمالي:" : "Total:"}</span>
                  <span className="text-primary">
                    {formatAmount(
                      convertAmount(
                        totals.total,
                        localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      ),
                      (JSON.parse(invoice?.currency)?.symbol ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                      selectedSymbol,
                    )}
                  </span>
                </div>
              </div>
              {invoice.depositAmount && invoice.depositAmount > 0 ? (
                <>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-blue-600 font-medium">{isRTL ? "المبلغ المدفوع:" : "Deposit Amount:"}</span>
                    <span className="font-semibold text-blue-600">
                      {formatAmount(
                        convertAmount(
                          invoice.depositAmount,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        (JSON.parse(invoice?.currency)?.symbol ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base mt-1">
                    <span className="text-blue-600 font-medium">{isRTL ? "المبلغ المتبقي:" : "Remaining Amount:"}</span>
                    <span className="font-bold text-blue-600">
                      {formatAmount(
                        convertAmount(
                          totals.total - invoice.depositAmount,
                          localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        ),
                        (JSON.parse(invoice?.currency)?.symbol ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                      )}
                    </span>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {invoice.shippingAddress && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
              {isRTL ? "معلومات الشحن:" : "Shipping Information:"}
            </h4>
            <div className="text-xs sm:text-sm text-gray-600">
              {invoice.shippingMethod && (
                <p>
                  <strong>{isRTL ? "طريقة الشحن:" : "Method:"}</strong>{" "}
                  {invoice.shippingMethod}
                </p>
              )}
              <p>
                <strong>{isRTL ? "العنوان:" : "Address:"}</strong>{" "}
                {isRTL
                  ? invoice.shippingAddressAr || invoice.shippingAddress
                  : invoice.shippingAddress}
              </p>
            </div>
          </div>
        )}

        {/* Notes and Terms */}
        <div className={`grid grid-cols-1 px-4 gap-6 sm:gap-8 lg:grid-cols-2 mb-6 sm:mb-8 ${mode === 'print' ? 'print-terms-hidden' : ''}`}>
          {(invoice.notes || invoice.notesAr) && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                {isRTL ? "ملاحظات:" : "Notes:"}
              </h3>
              <div className="text-gray-600 text-sm sm:text-base break-words">
                <div
                  dangerouslySetInnerHTML={{
                    __html: isRTL
                      ? invoice.notesAr || invoice.notes || ""
                      : invoice.notes || invoice.notesAr || "",
                  }}
                />
              </div>
            </div>
          )}
          {(invoice.terms || invoice.termsAr) && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                {isRTL ? "الشروط والأحكام:" : "Terms & Conditions:"}
              </h3>
              <div className="text-gray-600 text-sm sm:text-base break-words">
                <div
                  dangerouslySetInnerHTML={{
                    __html: isRTL
                      ? invoice.termsAr ||
                      invoice.terms ||
                      "الدفع مستحق خلال 30 يوماً من تاريخ الفاتورة. قد تُطبق رسوم تأخير."
                      : invoice.terms ||
                      invoice.termsAr ||
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
