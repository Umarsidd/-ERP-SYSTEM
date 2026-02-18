import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import { getStatusLabel } from "@/lib/function";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CryptoJS from "crypto-js";

export const printUnifiedInvoice = (
  invoice,
  isRTL = false,
  tableName,
  formatAmount,
  convertAmount,
  title = null // Added title parameter
) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;

  // Default title logic if not provided
  const docTitle = title || (isRTL ? "فـــاتـــورة" : "INVOICE");

  const printContent = `
    <!DOCTYPE html>
    <html dir="${isRTL ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8">
        <title>${isRTL ? "طباعة" : "Print"} - ${invoice.elementNumber}</title>
        <style>
        @media print {
            @page {
                size: A4;
                margin: 0.5cm;
            }
            body { 
                margin: 0; 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.3;
            color: #1f2937;
            background: white;
            margin: 0;
            padding: 20px;
            direction: ${isRTL ? "rtl" : "ltr"};
            font-size: 12px;
          }

          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
          }

          .company-info h1 {
            color: #111827;
            font-size: 20px;
            margin: 0 0 5px 0;
            font-weight: 700;
          }

          .company-info p {
            margin: 2px 0;
            color: #4b5563;
            font-size: 11px;
          }

          .invoice-title {
            text-align: ${isRTL ? "left" : "right"};
          }

          .invoice-title h2 {
            font-size: 24px;
            margin: 0 0 5px 0;
            color: #111827;
            font-weight: 700;
            text-transform: uppercase;
          }

          .invoice-number {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 5px;
            color: #374151;
          }

          .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 600;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .invoice-details {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 25px;
          }
          
          .invoice-details > div {
            flex: 1;
          }

          .section-title {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }

          .section-content {
            color: #4b5563;
            font-size: 11px;
          }

          .section-content p {
            margin: 0 0 4px 0;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            border-bottom: 1px dashed #f3f4f6;
            padding-bottom: 2px;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }

          .detail-row .label {
            color: #6b7280;
          }

          .detail-row .value {
            font-weight: 600;
            color: #111827;
          }

          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
            font-size: 11px;
          }

          th {
            background: #f9fafb;
            color: #111827;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
            padding: 8px 6px;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
          }

          td {
            padding: 6px;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
            vertical-align: top;
          }

          .text-center { text-align: center; }
          .text-right { text-align: ${isRTL ? "left" : "right"}; }
          .font-bold { font-weight: 600; }
          .text-red-600 { color: #dc2626; }

          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .totals-table {
            width: 280px;
            border-collapse: collapse;
          }

          .totals-table td {
            padding: 4px 0;
            border-bottom: 1px solid #f3f4f6;
          }

          .totals-table .total-row td {
            border-top: 1px solid #e5e7eb;
            border-bottom: none;
            font-weight: 700;
            font-size: 13px;
            color: #111827;
            padding-top: 8px;
          }

          .notes-section {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            page-break-inside: avoid;
          }

          .notes-section h4 {
            font-size: 12px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 5px 0;
          }

          .notes-section p {
            color: #6b7280;
            font-size: 10px;
            margin: 0;
            line-height: 1.4;
          }

          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 10px;
            position: fixed;
            bottom: 0;
            width: 100%;
            background: white;
          }
        </style>
      </head>
      <body>
        <div class="invoice-content">
          <!-- Company Header -->
          <div class="invoice-header">
            <div class="company-info">
              <h1>${JSON.parse(localStorage.getItem("logo"))?.logoText}</h1>
              <p>${JSON.parse(localStorage.getItem("logo"))?.logoAddress}</p>
              <p><span>${JSON.parse(localStorage.getItem("logo"))?.logoPhone}</span>  ${JSON.parse(localStorage.getItem("logo"))?.logoPhone2 && `<span> - ${JSON.parse(localStorage.getItem("logo"))?.logoPhone2}</span>`}</p>
              <p>${JSON.parse(localStorage.getItem("logo"))?.logoEmail}</p>
            </div>

            <div class="flex-1 text-center px-4">
              ${JSON.parse(localStorage.getItem("logo"))?.logoUrl
      ? `<img src="${JSON.parse(localStorage.getItem("logo"))?.logoUrl}" alt="Logo" style="max-height: 70px; max-width: 150px; object-fit: contain;" />`
      : ""}
            </div>
            
            <div class="invoice-title">
              <h2>${docTitle}</h2>
              <div class="invoice-number"># ${invoice.elementNumber}</div>
              <div class="status-badge">${getStatusLabel(invoice.status, isRTL)}</div>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <!-- Details -->
            <div>
              <h3 class="section-title">${isRTL ? "تفاصيل الفاتورة" : "Invoice Details"}</h3>
              <div class="section-content">
                 <div class="detail-row">
                  <span class="label">${isRTL ? "تاريخ الإصدار:" : "Issue Date:"}</span>
                  <span class="value">${new Date(invoice.date || invoice.issueDate || new Date()).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="label">${tableName == "purchase_invoices" ? (isRTL ? "تاريخ التسليم:" : "Delivery Date:") : isRTL ? "تاريخ الاستحقاق:" : "Due Date:"}</span>
                  <span class="value">${new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                 ${invoice?.paymentTerm ? `
                 <div class="detail-row">
                  <span class="label">${isRTL ? "شروط الدفع:" : "Payment Terms:"}</span>
                  <span class="value">${invoice?.paymentTerm} ${isRTL ? "يوم" : "Days"}</span>
                </div>` : ""}
              </div>
            </div>

            <!-- Bill To -->
            <div>
              <h3 class="section-title">${isRTL ? "فاتورة إلى" : "Bill To"}</h3>
              <div class="section-content">
                <p style="font-weight: 700; color: #111827;">${invoice?.customer?.name}</p>
                ${invoice?.customer?.email ? `<p>${invoice?.customer?.email}</p>` : ""}
                ${invoice?.customer?.phone ? `<p>${invoice?.customer?.phone}</p>` : ""}
                ${invoice?.customer?.taxNumber ? `<p>${isRTL ? "الرقم الضريبي:" : "Tax ID:"} ${invoice?.customer?.taxNumber}</p>` : ""}
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div>
            <table>
              <thead>
                <tr>
                  <th style="width: 40%; text-align: ${isRTL ? "right" : "left"}">${isRTL ? "تفاصيل الصنف" : "Item Details"}</th>
                  <th class="text-center" style="width: 10%">${isRTL ? "الكمية" : "Qty"}</th>
                  <th class="text-right" style="width: 15%">${isRTL ? "السعر" : "Price"}</th>
                  <th class="text-center" style="width: 10%">${isRTL ? "خصم" : "Disc."}</th>
                  <th class="text-center" style="width: 10%">${isRTL ? "ضريبة" : "Tax"}</th>
                  <th class="text-right" style="width: 15%">${isRTL ? "الإجمالي" : "Total"}</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item, index) => `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${item.productName || item.description}</div>
                      ${item.productName && item.description ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">${item.description}</div>` : ""}
                    </td>
                    <td class="text-center">${item.quantity} ${item.unitName || ''}</td>
                    <td class="text-right">${formatAmount(convertAmount(item.unitPrice, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
                    <td class="text-center">
                      ${item.discount && item.discount > 0 ? `<span class="text-red-600">${item.discountType === "percentage" ? `${item.discount}%` : formatAmount(convertAmount(item.discount, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</span>` : "-"}
                    </td>
                    <td class="text-center">${item.taxRate}%</td>
                    <td class="text-right font-bold">${formatAmount(convertAmount(item.total || calculateItemTotal(item), localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>${isRTL ? "المجموع الفرعي" : "Subtotal"}</td>
                <td class="text-right">${formatAmount(convertAmount(invoice.amount.subtotal, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>
              ${invoice.amount.totalItemDiscounts > 0 ? `
              <tr>
                <td class="text-red-600">${isRTL ? "خصومات البنود" : "Item Discounts"}</td>
                <td class="text-right text-red-600">-${formatAmount(convertAmount(invoice.amount.totalItemDiscounts, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>` : ""}
              <tr>
                <td>${isRTL ? "الضريبة" : "Tax"}</td>
                <td class="text-right">${formatAmount(convertAmount(invoice.amount.totalTax, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>
              ${invoice.amount.invoiceDiscount > 0 ? `
              <tr>
                <td class="text-red-600">${isRTL ? "خصم إضافي" : "Extra Discount"}</td>
                <td class="text-right text-red-600">-${formatAmount(convertAmount(invoice.amount.invoiceDiscount, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>` : ""}
              ${invoice.shippingCost && invoice.shippingCost > 0 ? `
              <tr>
                <td>${isRTL ? "الشحن" : "Shipping"}</td>
                <td class="text-right">${formatAmount(convertAmount(invoice.shippingCost, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>` : ""}
              <tr class="total-row">
                <td>${isRTL ? "الإجمالي الكلي" : "Grand Total"}</td>
                <td class="text-right">${formatAmount(convertAmount(invoice.amount.total, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>
               ${invoice.depositAmount && invoice.depositAmount > 0 ? `
              <tr>
                <td style="color: #2563eb;">${isRTL ? "المدفوع" : "Paid"}</td>
                <td class="text-right" style="color: #2563eb;">${formatAmount(convertAmount(invoice.depositAmount, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>
              <tr class="total-row">
                <td style="padding-top: 4px; border-top: 1px dashed #e5e7eb;">${isRTL ? "المتبقي" : "Balance Due"}</td>
                <td class="text-right" style="padding-top: 4px; border-top: 1px dashed #e5e7eb;">${formatAmount(convertAmount(invoice.amount.total - invoice.depositAmount, localStorage.getItem("selectedCurrency") ?? selectedCurrency), (JSON.parse(invoice?.currency)?.symbol || localStorage.getItem("selectedCurrencySymbol")) ?? selectedSymbol)}</td>
              </tr>` : ""}
            </table>
          </div>

          <!-- Shipping Info & Notes -->
          <div class="notes-section">
             <div>
                ${invoice.notes || invoice.notesAr ? `
                  <h4>${isRTL ? "ملاحظات" : "Notes"}</h4>
                  <p>${isRTL ? invoice.notesAr || invoice.notes : invoice.notes || invoice.notesAr}</p>
                ` : ""}
            </div>
            <div>
               ${invoice.terms || invoice.termsAr ? `
                  <h4>${isRTL ? "الشروط والأحكام" : "Terms & Conditions"}</h4>
                  <p>${isRTL ? invoice.termsAr || invoice.terms || "الدفع مستحق خلال 30 يوماً من تاريخ الفاتورة." : invoice.terms || invoice.termsAr || "Payment is due within 30 days of invoice date."}</p>
               ` : ""}
            </div>
          </div>
          
           ${invoice.shippingAddress ? `
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
               <h4 style="font-size: 11px; font-weight: 700; margin: 0 0 2px 0;">${isRTL ? "معلومات الشحن" : "Shipping Info"}</h4>
               <p style="font-size: 10px; color: #6b7280; margin: 0;">
                ${invoice.shippingMethod ? `${isRTL ? "طريقة الشحن:" : "Method:"} ${invoice.shippingMethod} | ` : ""}
                ${invoice.shippingAddress}
               </p>
            </div>
           ` : ""}

          <div class="footer">
             ${isRTL ? "شكراً لتعاملكم معنا" : "Thank you for your business"}
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

// Export invoice as PDF using unified template
// export const exportUnifiedInvoicePDF = async (invoice, isRTL = false) => {
//   try {
//     const doc = new jsPDF();
//     const totals = calculateInvoiceTotals(invoice);

//     // Set font
//     doc.setFont("helvetica");

//     // Company Header
//     doc.setFontSize(20);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(37, 99, 235);
//     doc.text(
//       isRTL ? "شركة النظام المتكامل" : "ERP System Company",
//       20,
//       25
//     );

//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.setTextColor(100, 100, 100);
//     doc.text(
//       isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
//       20,
//       35
//     );
//     doc.text(
//       isRTL ? "هاتف: +966 11 555 0000" : "Phone: +966 11 555 0000",
//       20,
//       42
//     );
//     doc.text(
//       isRTL ? "البريد: info@erpsystem.sa" : "Email: info@erpsystem.sa",
//       20,
//       49
//     );

//     // Invoice Title and Number
//     doc.setFontSize(24);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(0, 0, 0);
//     doc.text(isRTL ? "فـــاتـــورة" : "INVOICE", 150, 25);

//     doc.setFontSize(12);
//     doc.setFont("helvetica", "normal");
//     doc.text(invoice.elementNumber, 150, 35);

//     // Status Badge
//     doc.setFont("helvetica", "bold");
//     doc.text(
//       `${isRTL ? "الحالة:" : "Status:"} ${getStatusLabel(invoice.status, isRTL)}`,
//       150,
//       45
//     );

//     // Horizontal line
//     doc.setLineWidth(1);
//     doc.setDrawColor(37, 99, 235);
//     doc.line(20, 55, 190, 55);

//     // Bill To Section
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(0, 0, 0);
//     doc.text(isRTL ? "فاتورة إلى:" : "Bill To:", 20, 70);

//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");
//     doc.text(
//       isRTL ? invoice.customer.name || invoice.customer.name : invoice.customer.name,
//       20,
//       80
//     );
//     doc.text(`${isRTL ? "البريد:" : "Email:"} ${invoice.customer.email}`, 20, 88);
//     doc.text(`${isRTL ? "الهاتف:" : "Phone:"} ${invoice.customer.phone}`, 20, 96);
//     doc.text(
//       `${isRTL ? "العنوان:" : "Address:"} ${isRTL ? invoice.customer.addressAr || invoice.customer.address : invoice.customer.address}`,
//       20,
//       104
//     );
//     doc.text(
//       `${isRTL ? "الرقم الضريبي:" : "Tax ID:"} ${invoice.customer.taxNumber}`,
//       20,
//       112
//     );

//     // Invoice Details Section
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text(isRTL ? "تفاصيل الفاتورة:" : "Invoice Details:", 120, 70);

//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");
//     doc.text(
//       `${isRTL ? "تاريخ الإصدار:" : "Issue Date:"} ${new Date(
//         invoice.date || invoice.issueDate || new Date()
//       ).toLocaleDateString()}`,
//       120,
//       80
//     );
//     doc.text(
//       `${isRTL ? "تاريخ الاستحقاق:" : "Due Date:"} ${new Date(
//         invoice.dueDate
//       ).toLocaleDateString()}`,
//       120,
//       88
//     );

//     if (invoice.salesRep) {
//       doc.text(
//         `${isRTL ? "مندوب المبيعات:" : "Sales Rep:"} ${
//           isRTL ? invoice.salesRep.nameAr || invoice.salesRep.name : invoice.salesRep.name
//         }`,
//         120,
//         96
//       );
//     }

//     if (invoice.paymentTerm) {
//       doc.text(
//         `${isRTL ? "شروط الدفع:" : "Payment Terms:"} ${
//           isRTL ? invoice.paymentTerm.nameAr || invoice.paymentTerm.name : invoice.paymentTerm.name
//         }`,
//         120,
//         104
//       );
//     }

//     // Items Table
//     const tableColumns = [
//       isRTL ? "الوصف" : "Description",
//       isRTL ? "الكمية" : "Qty",
//       isRTL ? "السعر" : "Price",
//       isRTL ? "خصم" : "Discount",
//       isRTL ? "ضريبة %" : "Tax %",
//       isRTL ? "الإجمالي" : "Total",
//     ];

//     const tableRows = invoice.items.map((item) => [
//       item.productName || item.description,
//       item.quantity.toString(),
//       formatCurrency(item.unitPrice),
//       item.discount && item.discount > 0
//         ? item.discountType === "percentage"
//           ? `${item.discount}%`
//           : formatCurrency(item.discount)
//         : "-",
//       `${item.taxRate}%`,
//       formatCurrency(item.total || calculateItemTotal(item)),
//     ]);

//     (doc as any).autoTable({
//       head: [tableColumns],
//       body: tableRows,
//       startY: 125,
//       styles: {
//         fontSize: 10,
//         cellPadding: 4,
//       },
//       headStyles: {
//         fillColor: [37, 99, 235],
//         textColor: 255,
//         fontStyle: "bold",
//       },
//       columnStyles: {
//         0: { cellWidth: 60 },
//         1: { cellWidth: 20, halign: "center" },
//         2: { cellWidth: 25, halign: "right" },
//         3: { cellWidth: 20, halign: "center" },
//         4: { cellWidth: 20, halign: "center" },
//         5: { cellWidth: 25, halign: "right", fontStyle: "bold" },
//       },
//     });

//     // Totals Section
//     const finalY = (doc as any).lastAutoTable.finalY + 20;

//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");
//     doc.text(`${isRTL ? "المجموع الفرعي:" : "Subtotal:"}`, 130, finalY);
//     doc.text(formatCurrency(totals.subtotal), 170, finalY);

//     let currentY = finalY + 8;

//     if (totals.totalItemDiscounts > 0) {
//       doc.setTextColor(220, 38, 38);
//       doc.text(`${isRTL ? "خصومات البنود:" : "Item Discounts:"}`, 130, currentY);
//       doc.text(`-${formatCurrency(totals.totalItemDiscounts)}`, 170, currentY);
//       doc.setTextColor(0, 0, 0);
//       currentY += 8;
//     }

//     doc.text(`${isRTL ? "الضريبة:" : "Tax:"}`, 130, currentY);
//     doc.text(formatCurrency(totals.totalTax), 170, currentY);
//     currentY += 8;

//     if (totals.invoiceDiscount > 0) {
//       doc.setTextColor(220, 38, 38);
//       doc.text(`${isRTL ? "خصم الفاتورة:" : "Invoice Discount:"}`, 130, currentY);
//       doc.text(`-${formatCurrency(totals.invoiceDiscount)}`, 170, currentY);
//       doc.setTextColor(0, 0, 0);
//       currentY += 8;
//     }

//     if (invoice.shippingCost && invoice.shippingCost > 0) {
//       doc.text(`${isRTL ? "الشحن:" : "Shipping:"}`, 130, currentY);
//       doc.text(formatCurrency(invoice.shippingCost), 170, currentY);
//       currentY += 8;
//     }

//     // Total line
//     doc.setLineWidth(0.5);
//     doc.line(130, currentY - 2, 190, currentY - 2);

//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(37, 99, 235);
//     doc.text(`${isRTL ? "الإجمالي:" : "Total:"}`, 130, currentY + 8);
//     doc.text(formatCurrency(totals.total), 170, currentY + 8);

//     currentY += 16;

//     // Deposit and Amount Due
//     if (invoice.depositAmount && invoice.depositAmount > 0) {
//       doc.setFontSize(11);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(0, 0, 0);
//       doc.text(`${isRTL ? "المبلغ المدفوع:" : "Deposit:"}`, 130, currentY);
//       doc.text(`-${formatCurrency(invoice.depositAmount)}`, 170, currentY);
//       currentY += 8;

//       doc.setFontSize(14);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(34, 197, 94);
//       doc.text(`${isRTL ? "المبلغ المتبقي:" : "Amount Due:"}`, 130, currentY);
//       doc.text(formatCurrency(totals.total - invoice.depositAmount), 170, currentY);
//       currentY += 16;
//     }

//     // Shipping Information
//     if (invoice.shippingAddress) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(0, 0, 0);
//       doc.text(isRTL ? "معلومات الشحن:" : "Shipping Information:", 20, currentY);

//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(100, 100, 100);
//       currentY += 10;

//       if (invoice.shippingMethod) {
//         doc.text(`${isRTL ? "طريقة الشحن:" : "Method:"} ${invoice.shippingMethod}`, 20, currentY);
//         currentY += 8;
//       }
//       doc.text(`${isRTL ? "العنوان:" : "Address:"} ${invoice.shippingAddress}`, 20, currentY);
//       currentY += 16;
//     }

//     // Notes and Terms
//     const footerY = Math.max(currentY, 220);

//     if (invoice.notes || invoice.notesAr) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(0, 0, 0);
//       doc.text(isRTL ? "ملاحظات:" : "Notes:", 20, footerY);

//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(100, 100, 100);
//       const notes = doc.splitTextToSize(
//         isRTL ? invoice.notesAr || invoice.notes || "" : invoice.notes || invoice.notesAr || "",
//         80
//       );
//       doc.text(notes, 20, footerY + 10);
//     }

//     doc.setFontSize(12);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(0, 0, 0);
//     doc.text(isRTL ? "الشروط والأحكام:" : "Terms & Conditions:", 120, footerY);

//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.setTextColor(100, 100, 100);
//     const terms = doc.splitTextToSize(
//       isRTL
//         ? invoice.termsAr || invoice.terms || "الدفع مستحق خلال 30 يوماً من تاريخ الفاتورة. قد تُطبق رسوم تأخير."
//         : invoice.terms || invoice.termsAr || "Payment is due within 30 days of invoice date. Late fees may apply.",
//       70
//     );
//     doc.text(terms, 120, footerY + 10);

//     // Footer
//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.setTextColor(150, 150, 150);
//     doc.text(
//       isRTL ? "شكراً لتعاملكم معنا" : "Thank you for your business",
//       105,
//       280,
//       { align: "center" }
//     );
//     doc.text(
//       `${isRTL ? "تم إنشاؤه بواسطة نظام إدارة الموارد" : "Generated by ERP Management System"} - ${new Date().toLocaleDateString()}`,
//       105,
//       288,
//       { align: "center" }
//     );

//     // Save PDF
//     doc.save(`${invoice.elementNumber}-invoice.pdf`);

//     return true;
//   } catch (error) {
//     console.error("PDF generation failed:", error);
//     throw error;
//   }
// };
// ${invoice.paymentTerm ? `
// <div class="detail-row">
//   <span class="label">${isRTL ? "شروط الدفع:" : "Payment Terms:"}</span>
//   <span class="value">${isRTL ? invoice.paymentTerm.nameAr || invoice.paymentTerm.name : invoice.paymentTerm.name}</span>
// </div>
// ` : ''}
