import { getStatusLabel } from "@/lib/function";
import "jspdf-autotable";
import CryptoJS from "crypto-js";

export const printEntry = (data, isRTL = false) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;

  const printContent = `
    <!DOCTYPE html>
    <html dir="${isRTL ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${data.elementNumber}</title>
        <style>
        @media print {
                @page {
                  size: A4;
                  margin: 1cm;
                }
                body { margin: 0; }
              }

          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
            margin: 0;
            padding: 20px;
            direction: ${isRTL ? "rtl" : "ltr"};
          }

          .invoice-content {
            max-width: none;
            margin: 0;
            padding: 0;
          }

          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 3px solid hsl(184, 32%, 37%);
            padding-bottom: 20px;
          }

          .company-info h1 {
            color: hsl(184, 32%, 37%);
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: bold;
          }

          .company-info p {
            margin: 2px 0;
            color: #666;
            font-size: 14px;
          }

          .invoice-title h2 {
            font-size: 32px;
            margin: 0 0 10px 0;
            color: #333;
            font-weight: bold;
          }

          .invoice-number {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }

          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }

          .section-content {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          }

          .section-content p {
            margin: 0 0 8px 0;
          }

          .section-content .customer-name {
            font-weight: bold;
            color: #374151;
            font-size: 16px;
            margin-bottom: 10px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .detail-row .label {
            flex-shrink: 0;
          }

          .detail-row .value {
            font-weight: 500;
            color: #374151;
            text-align: ${isRTL ? "left" : "right"};
          }

          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 30px;
            font-size: 14px;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 12px 8px;
            text-align: ${isRTL ? "right" : "left"};
          }

          th {
            background: #f9fafb;
            font-weight: bold;
            color: #374151;
          }

          .text-center { text-align: center; }
          .text-right { text-align: ${isRTL ? "left" : "right"}; }
          .font-bold { font-weight: bold; }
          .text-blue-600 { color: hsl(184, 32%, 37%); }
          .text-red-600 { color: #dc2626; }
          .text-green-600 { color: #16a34a; }

          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }

          .totals-table {
            width: 300px;
            border: none;
          }

          .totals-table td {
            border: none;
            border-bottom: 1px solid #e5e7eb;
            padding: 8px 0;
          }

          .totals-table .total-row td {
            border-top: 2px solid #374151;
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: hsl(184, 32%, 37%);
            padding-top: 12px;
          }

          .notes-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }

          .notes-section h4 {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
          }

          .notes-section p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
          }

          .footer {
            border-top: 1px solid #d1d5db;
            padding-top: 20px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
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

            <div class="flex-1">
              ${JSON.parse(localStorage.getItem("logo"))?.logoUrl ? `
                <img
                  src="${JSON.parse(localStorage.getItem("logo"))?.logoUrl}"
                  alt="Logo"
                  style="width: 80px; object-fit: contain;"
                />
              ` : ''}
            </div>

            <div class="invoice-title">
              <h2>${data.title}</h2>
              <div class="invoice-number">${data.elementNumber}</div>
   
            </div>
          </div>



            <!-- Invoice Info -->
            <div>
              <h3 class="section-title">${isRTL ? "التفاصيل:" : "Details:"}</h3>
              <div class="section-content">
                <div class="detail-row">
                  <span class="label">${isRTL ? "تاريخ الإصدار:" : "Issue Date:"}</span>
                  <span class="value">${new Date(data.date || data.issueDate || new Date()).toLocaleDateString()}</span>
                </div>
   

     
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div>
            <h3 class="section-title">${isRTL ? "البنود" : "Items"}</h3>
            <table>
              <thead>
                <tr>
                  <th class="text-center">${isRTL ? "الاسم" : "Name"}</th>
                  <th class="text-center">${isRTL ? "مركز التكلفة" : "Cost Center"}</th>
                  <th class="text-center">${isRTL ? "ضريبة %" : "Tax %"}</th>
                  <th class="text-center">${isRTL ? "دائن" : "Credit"}</th>
                  <th class="text-center">${isRTL ? "مدين" : "Debit"}</th>
                  
                </tr>
              </thead>
              <tbody>
                ${data.items
                  .map(
                    (item, index) => `
                  <tr style="background: ${index % 2 === 0 ? "#fff" : "#f9fafb"}">
                      <td class="text-center">${getStatusLabel(item.guideName, isRTL)}</td>
                      <td class="text-center">${getStatusLabel(item.costCenterName, isRTL)}</td>
                      <td class="text-center">${item.taxRate}</td>
                      <td class="text-center">${item.credit}</td>
                      <td class="text-center"">${item.debit}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <table class="totals-table">
              <tr class="total-row">
                <td>${isRTL ? "الإجمالي:" : "Total:"}</td>
                <td class="text-right">${data.totalAmount}</td>
              </tr>

            </table>
          </div>



          <!-- Notes and Terms -->
          <div class="notes-section">
            ${
              data.notes || data.notesAr
                ? `
            <div>
              <h4>${isRTL ? "ملاحظات:" : "Notes:"}</h4>
              <p>${isRTL ? data.notesAr || data.notes : data.notes || data.notesAr}</p>
            </div>
            `
                : ""
            }
            <div>
              
  
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>${isRTL ? "شكراً لتعاملكم معنا" : "Thank you for your business"}</p>
            <p>${isRTL ? "تم إنشاؤه بواسطة نظام إدارة الموارد" : "Generated by ERP Management System"} - ${new Date().toLocaleDateString()}</p>
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
