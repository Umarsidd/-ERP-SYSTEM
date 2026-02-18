import { selectedCurrency, selectedSymbol } from "@/data/data";
import { getStatusColor, getStatusLabel } from "@/lib/function";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`;
    case "pending":
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`;
    case "failed":
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    default:
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>`;
  }
};

// Print payment receipt using unified template
export const printUnifiedPaymentReceipt = (
  payment,
  isRTL = false,
  formatAmount,
  convertAmount,
) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;

  const templateHTML = generatePaymentHTML(
    payment,
    isRTL,
    "print",
    formatAmount,
    convertAmount,
  );

  const printContent = `
    <!DOCTYPE html>
    <html dir="${isRTL ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt ${payment.elementNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: A4;
                  margin: 1cm;
          }

          body {
            margin: 0;
            padding: 2px;
            background: white;
            font-family: system-ui, -apple-system, sans-serif;
            direction: ${isRTL ? "rtl" : "ltr"};
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print-receipt {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .print-receipt {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${templateHTML}
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };
};

const generatePaymentHTML = (
  payment,
  isRTL: boolean = false,
  mode: "print" | "pdf" = "print",
  formatAmount,
  convertAmount,
) => {
  return `
    <div class="bg-white text-black ${mode === "print" ? "print-receipt" : "p-1"} mobile-responsive" dir="${isRTL ? "rtl" : "ltr"}">
      <!-- Company Header -->
      <div class="flex flex-col space-y-4 mb-6 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 sm:mb-8 receipt-header">
        <div class="flex-1">
          <h1 class="text-2xl sm:text-3xl font-bold text-primary mb-2">
      ${JSON.parse(localStorage.getItem("logo"))?.logoText}
          </h1>
          <div class="text-gray-600 space-y-1 text-sm sm:text-base">
           
              <p>${JSON.parse(localStorage.getItem("logo"))?.logoAddress}</p>
              <p><span>${JSON.parse(localStorage.getItem("logo"))?.logoPhone}</span>  ${JSON.parse(localStorage.getItem("logo"))?.logoPhone2 && `<span> - ${JSON.parse(localStorage.getItem("logo"))?.logoPhone2}</span>`}</p>

              <p>${JSON.parse(localStorage.getItem("logo"))?.logoEmail}</p>

              </div>
        </div>



            
        <div class="">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            ${isRTL ? "إيصـــال دفـــع" : "PAYMENT RECEIPT"}
          </h2>
          <div class="space-y-2">
            <p class="font-semibold text-sm sm:text-lg">${payment.transactionId}</p>
            <div class="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(payment.status)}">
              ${getStatusIcon(payment.status)}
              <span>${getStatusLabel(payment.status, isRTL)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Details -->
      <div class="grid grid-cols-1 gap-6 mb-6 sm:gap-8 sm:mb-8 lg:grid-cols-2 receipt-details">
        <!-- Customer Info -->
        <div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${isRTL ? "تم التحصيل بواسطة" : "Collected By"}
          </h3>
          <div class="space-y-2 text-gray-600 text-sm sm:text-base">
            <p class="font-semibold text-gray-800 break-words">${
              isRTL ? payment.customer.name : payment.customer.name
            }</p>
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
              <span class="break-all">${payment.customer.email}</span>
            </div>
            ${
              payment.customer.phone
                ? `
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span class="break-words">${payment.customer.phone}</span>
            </div>
            `
                : ""
            }

          </div>
        </div>

        <!-- Payment Info -->
        <div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            ${isRTL ? "تفاصيل الدفع:" : "Payment Details:"}
          </h3>
          <div class="space-y-2 text-gray-600 text-sm sm:text-base">
            <div class="flex justify-between items-start">
              <span class="flex-shrink-0">${isRTL ? "تاريخ الدفع:" : "Payment Date:"}</span>
              <span class="font-medium text-right">${payment.issueDate}</span>
            </div>
    
            <div class="flex justify-between items-start">
              <span class="flex-shrink-0 flex items-center">
           
                <span class="ml-2">${isRTL ? "طريقة الدفع:" : "Payment Method:"}</span>
              </span>
              <span class="font-medium text-right break-words">${getStatusLabel(payment.paymentMethod, isRTL)}</span>
            </div>
            ${
              payment.transactionId
                ? `
            <div class="flex justify-between items-start">
              <span class="flex-shrink-0">${isRTL ? "معرف المعاملة:" : "Transaction ID:"}</span>
              <span class="font-medium text-right break-words font-mono text-xs">${payment.transactionId}</span>
            </div>
            `
                : ""
            }
          </div>
        </div>
      </div>

      <!-- Amount Summary -->
      <div class="mb-6 sm:mb-8">
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 rtl:mr-0 rtl:ml-2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ${isRTL ? "ملخص المبلغ" : "Amount Summary"}
        </h3>

        <!-- Desktop View - Table Layout -->
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center text-lg">
              <span class="text-gray-600">${isRTL ? "المبلغ الإجمالي:" : "Gross Amount:"}</span>
              <span class="font-semibold text-blue-600"> ${formatAmount(
                convertAmount(
                  payment.amount,
                  localStorage.getItem("selectedCurrency") ?? selectedCurrency,
                ),
                (JSON.parse(payment?.currency)?.symbol ||
                  localStorage.getItem("selectedCurrencySymbol")) ??
                  selectedSymbol,
              )}</span>
            </div>
            ${
              payment.fees && payment.fees > 0
                ? `
            <div class="flex justify-between items-center text-lg">
              <span class="text-gray-600">${isRTL ? "الرسوم:" : "Transaction Fees:"}</span>
              <span class="font-semibold text-red-600">-${formatAmount(
                convertAmount(
                  payment.fees,
                  localStorage.getItem("selectedCurrency") ?? selectedCurrency,
                ),
                (JSON.parse(payment?.currency)?.symbol ||
                  localStorage.getItem("selectedCurrencySymbol")) ??
                  selectedSymbol,
              )} </span>
            </div>
            `
                : ""
            }
         
          </div>
        </div>
      </div>

      ${
        payment.notes
          ? `
      <!-- Notes -->
      <div class="mb-6 sm:mb-8">
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-3">
          ${isRTL ? "ملاحظات:" : "Notes:"}
        </h3>
        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-gray-600 text-sm sm:text-base break-words">${payment.notes}</p>
        </div>
      </div>
      `
          : ""
      }


      <!-- Footer -->
      <div class="border-t border-gray-300 pt-4 sm:pt-6 text-center text-gray-500">
        <p class="text-xs sm:text-sm">
          ${isRTL ? "شكراً لتعاملكم معنا" : "Thank you for your business"}
        </p>
        <p class="text-xs mt-2">
          ${isRTL ? "تم إنشاؤه بواسطة نظام إدارة الموارد" : "Generated by ERP Management System"} - ${new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  `;
};

// Export payment receipt as PDF using unified template
// export const exportUnifiedPaymentReceiptPDF = async (payment: UnifiedPaymentData, isRTL = false) => {
//   try {
//     // Create a temporary container for rendering
//     const tempContainer = document.createElement("div");
//     tempContainer.style.position = "absolute";
//     tempContainer.style.left = "-9999px";
//     tempContainer.style.top = "-9999px";
//     tempContainer.style.width = "794px"; // A4 width in pixels at 96 DPI
//     tempContainer.style.background = "white";
//     tempContainer.style.padding = "40px";
//     tempContainer.style.boxSizing = "border-box";
//     tempContainer.style.fontFamily = "system-ui, -apple-system, sans-serif";

//     // Add Tailwind CSS
//     const tailwindLink = document.createElement("link");
//     tailwindLink.href = "https://cdn.tailwindcss.com";
//     tailwindLink.rel = "stylesheet";
//     document.head.appendChild(tailwindLink);

//     // Generate and insert HTML
//     const templateHTML = generatePaymentHTML(payment, isRTL, "pdf");
//     tempContainer.innerHTML = templateHTML;

//     document.body.appendChild(tempContainer);

//     // Wait for styles to load and render to complete
//     await new Promise(resolve => setTimeout(resolve, 1500));

//     // Convert to canvas
//     const canvas = await html2canvas(tempContainer, {
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: "#ffffff",
//       width: 794,
//       height: Math.max(1123, tempContainer.scrollHeight)
//     });

//     // Create PDF
//     const pdf = new jsPDF({
//       orientation: 'portrait',
//       unit: 'px',
//       format: [794, Math.max(1123, canvas.height)]
//     });

//     const imgData = canvas.toDataURL('image/png');
//     const imgWidth = 794;
//     const imgHeight = canvas.height;

//     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

//     // Cleanup
//     document.body.removeChild(tempContainer);
//     document.head.removeChild(tailwindLink);

//     // Save PDF
//     pdf.save(`payment-receipt-${payment.elementNumber}.pdf`);

//     return true;
//   } catch (error) {
//     console.error("PDF generation failed:", error);
//     alert(isRTL ? "خطأ في تصدير PDF" : "PDF export failed");
//     throw error;
//   }
// };
