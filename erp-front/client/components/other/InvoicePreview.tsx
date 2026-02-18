// // import React from "react";
// // import { X, Download, Printer, Send } from "lucide-react";
// // import { useCurrency } from "@/contexts/CurrencyContext";

// import { selectedCurrency } from "@/data/data"

// // interface InvoicePreviewProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   invoiceData: any;
// //   isRTL?: boolean;
// // }

// // export default function InvoicePreview({
// //   isOpen,
// //   onClose,
// //   invoiceData,
// //   isRTL = false,
// // }: InvoicePreviewProps) {
// //   const { formatAmount, convertAmount } = useCurrency();

// //   const handlePrint = () => {
// //     const printWindow = window.open("", "_blank", "width=800,height=600");
// //     if (!printWindow) return;

// //     const invoiceContent = document.getElementById("invoice-content");
// //     if (!invoiceContent) return;

// //     const printContent = `
// //       <!DOCTYPE html>
// //       <html>
// //         <head>
// //           <meta charset="UTF-8">
// //           <title>Invoice ${invoiceData.elementNumber || "Draft"}</title>
// //           <style>
// //             @page {
// //               size: A4;
// //               margin: 15mm;
// //             }

// //             body {
// //               font-family: Arial, sans-serif;
// //               line-height: 1.4;
// //               color: #333;
// //               background: white;
// //               margin: 0;
// //               padding: 0;
// //             }

// //             .invoice-content {
// //               max-width: none;
// //               margin: 0;
// //               padding: 0;
// //             }

// //             table {
// //               border-collapse: collapse;
// //               width: 100%;
// //             }

// //             th, td {
// //               border: 1px solid #333;
// //               padding: 8px;
// //               text-align: left;
// //             }

// //             th {
// //               background: #f5f5f5;
// //               font-weight: bold;
// //             }

// //             .text-right { text-align: right; }
// //             .text-center { text-align: center; }
// //             .font-bold { font-weight: bold; }
// //             .text-blue-600 { color: #2563eb; }
// //             .text-red-600 { color: #dc2626; }
// //             .text-green-600 { color: #16a34a; }
// //             .text-lg { font-size: 1.125rem; }
// //             .text-xl { font-size: 1.25rem; }
// //             .text-2xl { font-size: 1.5rem; }
// //             .text-3xl { font-size: 1.875rem; }
// //             .mb-2 { margin-bottom: 0.5rem; }
// //             .mb-4 { margin-bottom: 1rem; }
// //             .mb-6 { margin-bottom: 1.5rem; }
// //             .mb-8 { margin-bottom: 2rem; }
// //             .mt-2 { margin-top: 0.5rem; }
// //             .p-4 { padding: 1rem; }
// //             .border-t { border-top: 1px solid #333; }
// //             .border-gray-300 { border-color: #d1d5db; }
// //             .bg-gray-50 { background-color: #f9fafb; }
// //             .grid { display: grid; }
// //             .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
// //             .gap-6 { gap: 1.5rem; }
// //             .gap-8 { gap: 2rem; }
// //             .flex { display: flex; }
// //             .justify-between { justify-content: space-between; }
// //             .justify-end { justify-content: flex-end; }
// //             .items-start { align-items: flex-start; }
// //             .space-y-1 > * + * { margin-top: 0.25rem; }
// //             .space-y-2 > * + * { margin-top: 0.5rem; }
// //             .w-full { width: 100%; }
// //             .max-w-sm { max-width: 24rem; }

// //             @media print {
// //               body {
// //                 -webkit-print-color-adjust: exact !important;
// //                 color-adjust: exact !important;
// //               }
// //             }
// //           </style>
// //         </head>
// //         <body>
// //           ${invoiceContent.innerHTML}
// //         </body>
// //       </html>
// //     `;

// //     printWindow.document.write(printContent);
// //     printWindow.document.close();

// //     printWindow.onload = () => {
// //       setTimeout(() => {
// //         printWindow.print();
// //         printWindow.close();
// //       }, 500);
// //     };
// //   };

// //   if (!isOpen) return null;

// //   // Provide default values for incomplete data
// //   const safeInvoiceData = {
// //     ...invoiceData,
// //     customer: invoiceData.customer || {
// //       name: isRTL ? "عميل غير محدد" : "Customer Not Selected",
// //       nameAr: "عميل غير محدد",
// //       email: "",
// //       phone: "",
// //       address: "",
// //       addressAr: "",
// //       taxNumber: "",
// //     },
// //     salesRep: invoiceData.salesRep || {
// //       name: isRTL ? "مندوب غير محدد" : "Sales Rep Not Selected",
// //       nameAr: "مندوب غير محدد",
// //     },
// //     paymentTerm: invoiceData.paymentTerm || {
// //       name: isRTL ? "شروط غير محددة" : "Terms Not Selected",
// //       nameAr: "شروط غير محددة",
// //     },
// //     items:
// //       invoiceData.items && invoiceData.items.length > 0
// //         ? invoiceData.items
// //         : [
// //             {
// //               productName: isRTL ? "بند تجريبي" : "Sample Item",
// //               description: isRTL
// //                 ? "بند تجريبي للمعاينة"
// //                 : "Sample item for preview",
// //               quantity: 1,
// //               unitPrice: 100,
// //               discount: 0,
// //               discountType: "percentage",
// //               taxRate: 15,
// //               total: 115,
// //             },
// //           ],
// //   };

// //   const calculateItemTotal = (item: any) => {
// //     const subtotal = item.quantity * item.unitPrice;
// //     const discountAmount =
// //       item.discountType === "percentage"
// //         ? subtotal * (item.discount / 100)
// //         : item.discount;
// //     const afterDiscount = subtotal - discountAmount;
// //     const tax = afterDiscount * (item.taxRate / 100);
// //     return afterDiscount + tax;
// //   };

// //   const calculateInvoiceTotals = () => {
// //     const subtotal = safeInvoiceData.items.reduce(
// //       (sum: number, item: any) => sum + item.quantity * item.unitPrice,
// //       0,
// //     );

// //     const totalItemDiscounts = safeInvoiceData.items.reduce(
// //       (sum: number, item: any) => {
// //         const itemSubtotal = item.quantity * item.unitPrice;
// //         return (
// //           sum +
// //           (item.discountType === "percentage"
// //             ? itemSubtotal * (item.discount / 100)
// //             : item.discount)
// //         );
// //       },
// //       0,
// //     );

// //     const afterItemDiscounts = subtotal - totalItemDiscounts;

// //     const totalTax = safeInvoiceData.items.reduce((sum: number, item: any) => {
// //       const itemSubtotal = item.quantity * item.unitPrice;
// //       const itemDiscount =
// //         item.discountType === "percentage"
// //           ? itemSubtotal * (item.discount / 100)
// //           : item.discount;
// //       const afterDiscount = itemSubtotal - itemDiscount;
// //       return sum + afterDiscount * (item.taxRate / 100);
// //     }, 0);

// //     let invoiceDiscount = 0;
// //     if (safeInvoiceData.discountType === "percentage") {
// //       invoiceDiscount =
// //         afterItemDiscounts * (safeInvoiceData.discountValue / 100);
// //     } else {
// //       invoiceDiscount = safeInvoiceData.discountValue;
// //     }

// //     const total =
// //       afterItemDiscounts +
// //       totalTax -
// //       invoiceDiscount +
// //       safeInvoiceData.shippingCost;

// //     return {
// //       subtotal,
// //       totalItemDiscounts,
// //       totalTax,
// //       invoiceDiscount,
// //       total,
// //     };
// //   };

// //   const totals = calculateInvoiceTotals();

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case "paid":
// //         return "bg-green-100 text-green-800 border-green-200";
// //       case "pending":
// //         return "bg-yellow-100 text-yellow-800 border-yellow-200";
// //       case "overdue":
// //         return "bg-red-100 text-red-800 border-red-200";
// //       case "draft":
// //         return "bg-gray-100 text-gray-800 border-gray-200";
// //       default:
// //         return "bg-gray-100 text-gray-800 border-gray-200";
// //     }
// //   };

// //   return (
// //     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //       <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
// //         {/* Header */}
// //         <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
// //           <h2 className="text-xl font-semibold text-gray-800">
// //             {isRTL ? "معاينة الفاتورة" : "Invoice Preview"}
// //           </h2>
// //           <div className="flex items-center space-x-2 rtl:space-x-reverse">
// //             <button
// //               onClick={handlePrint}
// //               className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
// //               title={isRTL ? "طباعة" : "Print"}
// //             >
// //               <Printer className="w-5 h-5" />
// //             </button>
// //             <button
// //               onClick={onClose}
// //               className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
// //             >
// //               <X className="w-5 h-5" />
// //             </button>
// //           </div>
// //         </div>

// //         {/* Invoice Content */}
// //         <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
// //           <div
// //             id="invoice-content"
// //             className="p-8 bg-white text-black"
// //             dir={isRTL ? "rtl" : "ltr"}
// //           >
// //             {/* Company Header */}
// //             <div className="flex justify-between items-start mb-8">
// //               <div>
// //                 <h1 className="text-3xl font-bold text-blue-600 mb-2">
// //                   {isRTL ? "شركة النظام المتكامل" : "ERP System Company"}
// //                 </h1>
// //                 <div className="text-gray-600 space-y-1">
// //                   <p>
// //                     {isRTL
// //                       ? "الرياض، المملكة الع��بية السعودية"
// //                       : "Riyadh, Saudi Arabia"}
// //                   </p>
// //                   <p>
// //                     {isRTL
// //                       ? "هاتف: +966 11 555 0000"
// //                       : "Phone: +966 11 555 0000"}
// //                   </p>
// //                   <p>
// //                     {isRTL
// //                       ? "البريد: info@erpsystem.sa"
// //                       : "Email: info@erpsystem.sa"}
// //                   </p>
// //                 </div>
// //               </div>
// //               <div className="text-right rtl:text-left">
// //                 <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                   {isRTL ? "فـــاتـــورة" : "INVOICE"}
// //                 </h2>
// //                 <div className="space-y-2">
// //                   <p className="font-semibold text-lg">
// //                     {safeInvoiceData.elementNumber}
// //                   </p>
// //                   <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-blue-100 text-blue-800 border-blue-200">
// //                     {isRTL ? "مسودة" : "Draft"}
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Invoice Details */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
// //               {/* Bill To */}
// //               <div>
// //                 <h3 className="text-lg font-semibold text-gray-800 mb-3">
// //                   {isRTL ? "فاتورة إلى:" : "Bill To:"}
// //                 </h3>
// //                 <div className="space-y-2 text-gray-600">
// //                   <p className="font-semibold text-gray-800">
// //                     {isRTL
// //                       ? safeInvoiceData.customer.name
// //                       : safeInvoiceData.customer.name}
// //                   </p>
// //                   <p>{safeInvoiceData.customer.email}</p>
// //                   <p>{safeInvoiceData.customer.phone}</p>
// //                   <p>
// //                     {isRTL
// //                       ? safeInvoiceData.customer.addressAr
// //                       : safeInvoiceData.customer.address}
// //                   </p>
// //                   <p>
// //                     {isRTL ? "الرقم الضر��بي:" : "Tax ID:"}{" "}
// //                     {safeInvoiceData.customer.taxNumber}
// //                   </p>
// //                 </div>
// //               </div>

// //               {/* Invoice Info */}
// //               <div>
// //                 <h3 className="text-lg font-semibold text-gray-800 mb-3">
// //                   {isRTL ? "تفاصيل الفاتورة:" : "Invoice Details:"}
// //                 </h3>
// //                 <div className="space-y-2 text-gray-600">
// //                   <div className="flex justify-between">
// //                     <span>{isRTL ? "تاريخ الإصدار:" : "Issue Date:"}</span>
// //                     <span className="font-medium">
// //                       {new Date(safeInvoiceData.issueDate).toLocaleDateString()}
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span>{isRTL ? "تاريخ الاستحقاق:" : "Due Date:"}</span>
// //                     <span className="font-medium">
// //                       {new Date(safeInvoiceData.dueDate).toLocaleDateString()}
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span>{isRTL ? "مندوب المبيعات:" : "Sales Rep:"}</span>
// //                     <span className="font-medium">
// //                       {isRTL
// //                         ? safeInvoiceData.salesRep.nameAr
// //                         : safeInvoiceData.salesRep.name}
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span>{isRTL ? "شروط الدفع:" : "Payment Terms:"}</span>
// //                     <span className="font-medium">
// //                       {isRTL
// //                         ? safeInvoiceData.paymentTerm.nameAr
// //                         : safeInvoiceData.paymentTerm.name}
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Items Table */}
// //             <div className="mb-8">
// //               <h3 className="text-lg font-semibold text-gray-800 mb-4">
// //                 {isRTL ? "بنود الفاتورة" : "Invoice Items"}
// //               </h3>
// //               <div className="overflow-x-auto">
// //                 <table className="w-full border border-gray-300 text-sm">
// //                   <thead className="bg-gray-50">
// //                     <tr>
// //                       <th className="border border-gray-300 px-3 py-2 text-left rtl:text-right font-semibold">
// //                         {isRTL ? "الوصف" : "Description"}
// //                       </th>
// //                       <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-20">
// //                         {isRTL ? "الكمية" : "Qty"}
// //                       </th>
// //                       <th className="border border-gray-300 px-3 py-2 text-right rtl:text-left font-semibold w-24">
// //                         {isRTL ? "السعر" : "Price"}
// //                       </th>
// //                       <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-20">
// //                         {isRTL ? "خصم" : "Discount"}
// //                       </th>
// //                       <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-20">
// //                         {isRTL ? "ضريب�� %" : "Tax %"}
// //                       </th>
// //                       <th className="border border-gray-300 px-3 py-2 text-right rtl:text-left font-semibold w-24">
// //                         {isRTL ? "الإجمالي" : "Total"}
// //                       </th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {safeInvoiceData.items.map((item: any, index: number) => (
// //                       <tr
// //                         key={index}
// //                         className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
// //                       >
// //                         <td className="border border-gray-300 px-3 py-2">
// //                           <div>
// //                             <div className="font-medium">
// //                               {item.productName || item.description}
// //                             </div>
// //                             {item.productName && item.description && (
// //                               <div className="text-xs text-gray-500">
// //                                 {item.description}
// //                               </div>
// //                             )}
// //                           </div>
// //                         </td>
// //                         <td className="border border-gray-300 px-3 py-2 text-center">
// //                           {item.quantity}
// //                         </td>
// //                         <td className="border border-gray-300 px-3 py-2 text-right rtl:text-left">
// //                           {formatAmount(convertAmount(item.unitPrice, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency))}
// //                         </td>
// //                         <td className="border border-gray-300 px-3 py-2 text-center">
// //                           {item.discount > 0 && (
// //                             <span className="text-red-600">
// //                               {item.discountType === "percentage"
// //                                 ? `${item.discount}%`
// //                                 : formatAmount(
// //                                     convertAmount(item.discount, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency),
// //                                   )}
// //                             </span>
// //                           )}
// //                         </td>
// //                         <td className="border border-gray-300 px-3 py-2 text-center">
// //                           {item.taxRate}%
// //                         </td>
// //                         <td className="border border-gray-300 px-3 py-2 text-right rtl:text-left font-semibold">
// //                           {formatAmount(
// //                             convertAmount(calculateItemTotal(item), localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency),
// //                           )}
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             </div>

// //             {/* Totals */}
// //             <div className="flex justify-end mb-8">
// //               <div className="w-full max-w-sm">
// //                 <div className="space-y-2 text-sm">
// //                   <div className="flex justify-between">
// //                     <span>{isRTL ? "المجموع الفرعي:" : "Subtotal:"}</span>
// //                     <span className="font-medium">
// //                       {formatAmount(convertAmount(totals.subtotal, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency))}
// //                     </span>
// //                   </div>
// //                   {totals.totalItemDiscounts > 0 && (
// //                     <div className="flex justify-between text-red-600">
// //                       <span>
// //                         {isRTL ? "خصومات البنود:" : "Item Discounts:"}
// //                       </span>
// //                       <span className="font-medium">
// //                         -
// //                         {formatAmount(
// //                           convertAmount(totals.totalItemDiscounts, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency),
// //                         )}
// //                       </span>
// //                     </div>
// //                   )}
// //                   <div className="flex justify-between">
// //                     <span>{isRTL ? "الضريبة:" : "Tax:"}</span>
// //                     <span className="font-medium">
// //                       {formatAmount(convertAmount(totals.totalTax, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency))}
// //                     </span>
// //                   </div>
// //                   {totals.invoiceDiscount > 0 && (
// //                     <div className="flex justify-between text-red-600">
// //                       <span>
// //                         {isRTL ? "خصم الفاتورة:" : "Invoice Discount:"}
// //                       </span>
// //                       <span className="font-medium">
// //                         -
// //                         {formatAmount(
// //                           convertAmount(totals.invoiceDiscount, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency),
// //                         )}
// //                       </span>
// //                     </div>
// //                   )}
// //                   {safeInvoiceData.shippingCost > 0 && (
// //                     <div className="flex justify-between">
// //                       <span>{isRTL ? "الشحن:" : "Shipping:"}</span>
// //                       <span className="font-medium">
// //                         {formatAmount(
// //                           convertAmount(safeInvoiceData.shippingCost, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency),
// //                         )}
// //                       </span>
// //                     </div>
// //                   )}
// //                   <div className="border-t border-gray-300 pt-2">
// //                     <div className="flex justify-between text-lg font-bold">
// //                       <span>{isRTL ? "الإجمالي:" : "Total:"}</span>
// //                       <span className="text-blue-600">
// //                         {formatAmount(convertAmount(totals.total, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency))}
// //                       </span>
// //                     </div>
// //                   </div>
// //                   {safeInvoiceData.depositAmount > 0 && (
// //                     <>
// //                       <div className="flex justify-between text-sm text-gray-600">
// //                         <span>{isRTL ? "المبلغ المدفوع:" : "Deposit:"}</span>
// //                         <span className="font-medium">
// //                           -
// //                           {formatAmount(
// //                             convertAmount(safeInvoiceData.depositAmount, localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency),
// //                           )}
// //                         </span>
// //                       </div>
// //                       <div className="flex justify-between text-lg font-bold text-green-600">
// //                         <span>{isRTL ? "المبلغ المتبقي:" : "Amount Due:"}</span>
// //                         <span>
// //                           {formatAmount(
// //                             convertAmount(
// //                               totals.total - safeInvoiceData.depositAmount,
// //                               localStorage.getItem("selectedCurrency") ??
//                             selectedCurrency,
// //                             ),
// //                           )}
// //                         </span>
// //                       </div>
// //                     </>
// //                   )}
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Shipping Information */}
// //             {safeInvoiceData.shippingAddress && (
// //               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
// //                 <h4 className="font-semibold text-gray-800 mb-2">
// //                   {isRTL ? "معلومات الشحن:" : "Shipping Information:"}
// //                 </h4>
// //                 <div className="text-sm text-gray-600">
// //                   <p>
// //                     <strong>{isRTL ? "طريقة الشحن:" : "Method:"}</strong>{" "}
// //                     {safeInvoiceData.shippingMethod}
// //                   </p>
// //                   <p>
// //                     <strong>{isRTL ? "العنوان:" : "Address:"}</strong>{" "}
// //                     {safeInvoiceData.shippingAddress}
// //                   </p>
// //                 </div>
// //               </div>
// //             )}

// //             {/* Notes and Terms */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
// //               {safeInvoiceData.notes && (
// //                 <div>
// //                   <h4 className="font-semibold text-gray-800 mb-2">
// //                     {isRTL ? "ملاحظات:" : "Notes:"}
// //                   </h4>
// //                   <div
// //                     className="text-sm text-gray-600"
// //                     dangerouslySetInnerHTML={{ __html: safeInvoiceData.notes }}
// //                   />
// //                 </div>
// //               )}
// //               {safeInvoiceData.terms && (
// //                 <div>
// //                   <h4 className="font-semibold text-gray-800 mb-2">
// //                     {isRTL ? "الشروط والأحكام:" : "Terms & Conditions:"}
// //                   </h4>
// //                   <div
// //                     className="text-sm text-gray-600"
// //                     dangerouslySetInnerHTML={{ __html: safeInvoiceData.terms }}
// //                   />
// //                 </div>
// //               )}
// //             </div>

// //             {/* Footer */}
// //             <div className="border-t border-gray-300 pt-6 text-center text-gray-500">
// //               <p className="text-sm">
// //                 {isRTL ? "شكراً لتعاملكم معنا" : "Thank you for your business"}
// //               </p>
// //               <p className="text-xs mt-2">
// //                 {isRTL
// //                   ? "تم إنشاؤه بواسطة نظام إدارة الموارد"
// //                   : "Generated by ERP Management System"}{" "}
// //                 - {new Date().toLocaleDateString()}
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <style>{`
// //         @media print {
// //           .fixed {
// //             position: static !important;
// //           }
// //           .bg-black\\/50 {
// //             background: transparent !important;
// //           }
// //           .shadow-2xl {
// //             box-shadow: none !important;
// //           }
// //           .max-h-\\[90vh\\] {
// //             max-height: none !important;
// //           }
// //           .overflow-hidden {
// //             overflow: visible !important;
// //           }
// //           .overflow-y-auto {
// //             overflow: visible !important;
// //           }
// //           .max-h-\\[calc\\(90vh-80px\\)\\] {
// //             max-height: none !important;
// //           }
// //           button {
// //             display: none !important;
// //           }
// //           .border-b.border-gray-200.bg-gray-50 {
// //             display: none !important;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }
