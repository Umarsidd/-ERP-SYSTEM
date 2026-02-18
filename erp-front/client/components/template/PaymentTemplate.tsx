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
  CreditCard,
  Banknote,
  Wallet,
  Receipt,
  DollarSign,
} from "lucide-react";
import { MainIcon } from "../common/mainIcon";
import { getStatusColor, getStatusLabel } from "@/lib/function";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import CryptoJS from "crypto-js";

export function UnifiedPaymentTemplate({
  payment,
  isRTL = false,
  mode = "view",
  className = "",
}) {
  const { formatAmount, convertAmount } = useCurrency();

  const containerClasses = {
    view: "bg-white text-black p-4 sm:p-6 lg:p-8 rounded-lg border border-border",
    print: "bg-white text-black print-receipt",
    pdf: "bg-white text-black",
    preview: "bg-white text-black p-8",
  };

  return (
    <>
      <style>{`
        @media print {
          .print-receipt {
            margin: 0 !important;
            padding: 20mm !important;
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
          .mobile-responsive .receipt-header {
            flex-direction: column !important;
            gap: 20px;
          }
          .mobile-responsive .receipt-details {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
        }
      `}</style>

      <div
        className={`${containerClasses[mode]} ${className} mobile-responsive`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Company Header */}
        <div className="flex flex-col space-y-4 mb-6 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 sm:mb-8 receipt-header">
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
              {isRTL ? "إيصـــال دفـــع" : "PAYMENT RECEIPT"}
            </h2>
            <div className="space-y-2">
              <p className="font-semibold text-sm sm:text-lg">
                {payment.elementNumber}
              </p>
              <div
                className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(payment.status)}`}
              >
                <MainIcon icon={payment.status} />

                <span>{getStatusLabel(payment.status, isRTL)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 gap-6 mb-6 sm:gap-8 sm:mb-8 lg:grid-cols-2 receipt-details">
          {/* Customer Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {isRTL ? "تم التحصيل بواسطة" : "Collected By"}
            </h3>
            <div className="space-y-2 text-gray-600 text-sm sm:text-base">
              <p className="font-semibold text-gray-800 break-words">
                {isRTL
                  ? JSON.parse(payment.main).customer.name
                  : JSON.parse(payment.main).customer.name}
              </p>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-all">
                  {JSON.parse(payment.main).customer.email}
                </span>
              </div>
              {JSON.parse(payment.main).customer.phone && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="break-words">
                    {JSON.parse(payment.main).customer.phone}
                  </span>
                </div>
              )}
              {/* <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Hash className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-words">
                  {isRTL ? "نوع العميل:" : "Customer Type:"}{" "}
                  {isRTL
                    ? payment.customerType === "business"
                      ? "شركة"
                      : "فرد"
                    : payment.customerType === "business"
                      ? "Business"
                      : "Individual"}
                </span>
              </div> */}
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {isRTL ? "تفاصيل الدفع:" : "Payment Details:"}
            </h3>
            <div className="space-y-2 text-gray-600 text-sm sm:text-base">
              <div className="flex justify-between items-start">
                <span className="flex-shrink-0">
                  {isRTL ? "تاريخ الدفع:" : "Payment Date:"}
                </span>
                <span className="font-medium text-right">
                  {payment.issueDate}
                </span>
              </div>
              {/* <div className="flex justify-between items-start">
                <span className="flex-shrink-0">
                  {isRTL ? "تاريخ الاستحقاق:" : "Due Date:"}
                </span>
                <span className="font-medium text-right">
                  {payment.dueDate.toLocaleDateString()}
                </span>
              </div> */}
              <div className="flex justify-between items-start">
                <span className="flex-shrink-0 flex items-center">
                  {<MainIcon icon={JSON.parse(payment.main).paymentMethod} />}
                  <span className="ml-2">
                    {isRTL ? "طريقة الدفع:" : "Payment Method:"}
                  </span>
                </span>
                <span className="font-medium text-right break-words">
                  {getStatusLabel(
                    JSON.parse(payment.main).paymentMethod,
                    isRTL,
                  )}
                </span>
              </div>
              {JSON.parse(payment.main).transactionId && (
                <div className="flex justify-between items-start">
                  <span className="flex-shrink-0">
                    {isRTL ? "معرف المعاملة:" : "Transaction ID:"}
                  </span>
                  <span className="font-medium text-right break-words font-mono text-xs">
                    {JSON.parse(payment.main).transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2" />
            {isRTL ? "ملخص المبلغ" : "Amount Summary"}
          </h3>

          {/* Mobile View - Card Layout */}
          <div className="space-y-4 sm:hidden">
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      {isRTL ? "المبلغ الإجمالي:" : "Gross Amount:"}
                    </span>
                    <span className="font-medium ml-2 text-blue-600">
                      {JSON.parse(payment.main)?.amount}
                    </span>
                  </div>

                  {/* <div>
                      <span className="text-gray-600">
                        {isRTL ? "الرسوم:" : "Fees:"}
                      </span>
                      <span className="font-medium ml-2 text-red-600">
                        {JSON.parse(payment.main).amount.toFixed(2)}
                      </span>
                    </div>
        
                  <div className="col-span-2 border-t pt-2">
                    <span className="text-gray-800 font-semibold">
                      {isRTL ? "صافي المبلغ:" : "Net Amount:"}
                    </span>
                    <span className="font-bold ml-2 text-green-600 text-lg">
                      {JSON.parse(payment.main).amount.toFixed(2)}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View - Table Layout */}
          <div className="hidden sm:block">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">
                    {isRTL ? "المبلغ الإجمالي:" : "Gross Amount:"}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {formatAmount(
                      convertAmount(
                        payment.totalAmount,
                        localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                      ),

                      ((JSON.parse(payment.main)?.currency &&
                        JSON.parse(JSON.parse(payment.main)?.currency)
                          ?.symbol) ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                    )}
                  </span>
                </div>

                {/* <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">
                      {isRTL ? "الرسوم:" : "Transaction Fees:"}
                    </span>
                    <span className="font-semibold text-red-600">
                      {JSON.parse(payment.main).amount.toFixed(2)}
                    </span>
                  </div>
          
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-gray-800">
                      {isRTL ? "صافي المبلغ:" : "Net Amount:"}
                    </span>
                    <span className="text-green-600">
                      {JSON.parse(payment.main).amount.toFixed(2)}
                    </span>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {JSON.parse(payment.main).notes && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              {isRTL ? "ملاحظات:" : "Notes:"}
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm sm:text-base break-words">
                {JSON.parse(payment.main).notes}
              </p>
            </div>
          </div>
        )}

        {/* Additional Information */}
        {/* <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 mb-6 sm:mb-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              {isRTL ? "تفاصيل إضافية:" : "Additional Details:"}
            </h3>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isRTL ? "الفئة:" : "Category:"}
                </span>
                <span className="font-medium">
                  {isRTL
                    ? payment.category === "invoice"
                      ? "فاتورة"
                      : payment.category === "subscription"
                        ? "اشتراك"
                        : payment.category === "deposit"
                          ? "إيداع"
                          : "استرداد"
                    : payment.category === "invoice"
                      ? "Invoice"
                      : payment.category === "subscription"
                        ? "Subscription"
                        : payment.category === "deposit"
                          ? "Deposit"
                          : "Refund"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isRTL ? "معرف الدفعة:" : "Payment ID:"}
                </span>
                <span className="font-medium font-mono text-xs">
                  {payment.id}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
              {isRTL ? "الحالة والتوقيت:" : "Status & Timing:"}
            </h3>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isRTL ? "الحالة:" : "Status:"}
                </span>
                <span
                  className={`font-medium ${
                    payment.status === "completed"
                      ? "text-green-600"
                      : payment.status === "pending"
                        ? "text-yellow-600"
                        : payment.status === "failed"
                          ? "text-red-600"
                          : payment.status === "refunded"
                            ? "text-blue-600"
                            : "text-orange-600"
                  }`}
                >
                  {getStatusLabel(payment.status, isRTL)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isRTL ? "وقت المعالجة:" : "Processing Time:"}
                </span>
                <span className="font-medium">{payment.issueDate}</span>
              </div>
            </div>
          </div>
        </div> */}

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
