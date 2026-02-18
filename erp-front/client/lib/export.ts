import jsPDF from "jspdf";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { getStatusLabel } from "@/lib/function";
import { format } from "date-fns";
import { selectedCurrency } from "@/data/data";

interface Invoice {
  id: string;
  elementNumber: string;
  customer: string;
  customerAr: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  date: string;
  dueDate: string;
  items: number;
  category: string;
  categoryAr: string;
  paymentMethod: string;
  paymentMethodAr: string;
  salesPerson: string;
  salesPersonAr: string;
  email?: string;
  phone?: string;
}

const handleExtractPDF = (
  invoice: Invoice,
  formatAmount,
  convertAmount,
  isRTL,
) => {
  try {
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text(isRTL ? "شركة النظام المتكامل" : "ERP System Company", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
      20,
      35,
    );
    doc.text(
      isRTL ? "هاتف: +966 11 555 0000" : "Phone: +966 11 555 0000",
      20,
      42,
    );
    doc.text(
      isRTL ? "البريد: info@erpsystem.sa" : "Email: info@erpsystem.sa",
      20,
      49,
    );

    // Invoice Title and Number
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(isRTL ? "فــــاتـــــورة" : "INVOICE", 150, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.elementNumber, 150, 35);

    // Status Badge
    doc.setFont("helvetica", "bold");
    doc.text(
      `${isRTL ? "الحالة:" : "Status:"} ${getStatusLabel(invoice.status, isRTL)}`,
      150,
      45,
    );

    // Horizontal line
    doc.setLineWidth(1);
    doc.setDrawColor(37, 99, 235);
    doc.line(20, 55, 190, 55);

    // Bill To Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(isRTL ? "فاتورة إلى:" : "Bill To:", 20, 70);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(isRTL ? invoice.customerAr : invoice.customer, 20, 80);
    doc.text(
      `${isRTL ? "البريد:" : "Email:"} ${invoice.email || "N/A"}`,
      20,
      88,
    );
    doc.text(
      `${isRTL ? "الهاتف:" : "Phone:"} ${invoice.phone || "N/A"}`,
      20,
      96,
    );

    // Invoice Details Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(isRTL ? "تفاصيل الفاتورة:" : "Invoice Details:", 120, 70);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${isRTL ? "تاريخ الإصدار:" : "Issue Date:"} ${new Date(invoice.date).toLocaleDateString()}`,
      120,
      80,
    );
    doc.text(
      `${isRTL ? "تاريخ الاستحقاق:" : "Due Date:"} ${new Date(invoice.dueDate).toLocaleDateString()}`,
      120,
      88,
    );
    doc.text(
      `${isRTL ? "مندوب المبيعات:" : "Sales Person:"} ${isRTL ? invoice.salesPersonAr : invoice.salesPerson}`,
      120,
      96,
    );
    doc.text(
      `${isRTL ? "طريقة الدفع:" : "Payment Method:"} ${isRTL ? invoice.paymentMethodAr : invoice.paymentMethod}`,
      120,
      104,
    );

    // Items Table
    const tableColumns = [
      isRTL ? "الوصف" : "Description",
      isRTL ? "الكمية" : "Qty",
      isRTL ? "سعر الوحدة" : "Unit Price",
      isRTL ? "الإجمالي" : "Total",
    ];

    const tableRows = [
      [
        `${isRTL ? invoice.categoryAr : invoice.category} - ${isRTL ? "منتجات متنوعة" : "Various Products"}`,
        invoice.items.toString(),
        formatAmount(
          convertAmount(
            invoice.amount / invoice.items,
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          ),
        ),
        formatAmount(
          convertAmount(
            invoice.amount,
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          ),
        ),
      ],
    ];

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 115,
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 40, halign: "right", fontStyle: "bold" },
      },
    });

    // Totals Section
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${isRTL ? "المجموع الفرعي:" : "Subtotal:"}`, 130, finalY);
    doc.text(
      formatAmount(
        convertAmount(
          invoice.amount * 0.87,
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
        ),
      ),
      170,
      finalY,
    );

    doc.text(`${isRTL ? "الضريبة (15%):" : "Tax (15%):"}`, 130, finalY + 8);
    doc.text(
      formatAmount(
        convertAmount(
          invoice.amount * 0.13,
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
        ),
      ),
      170,
      finalY + 8,
    );

    // Total line
    doc.setLineWidth(0.5);
    doc.line(130, finalY + 12, 190, finalY + 12);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(`${isRTL ? "الإجمالي:" : "Total:"}`, 130, finalY + 20);
    doc.text(
      formatAmount(
        convertAmount(
          invoice.amount,
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
        ),
      ),
      170,
      finalY + 20,
    );

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      isRTL ? "شكراً لتعاملكم معنا" : "Thank you for your business",
      105,
      finalY + 40,
      { align: "center" },
    );
    doc.text(
      `${isRTL ? "تم إنشاؤه بواسطة نظام إدارة الموارد" : "Generated by ERP Management System"} - ${new Date().toLocaleDateString()}`,
      105,
      finalY + 48,
      { align: "center" },
    );

    // Save PDF
    doc.save(`${invoice.elementNumber}-professional.pdf`);

    Swal.fire({
      icon: "success",
      title: isRTL ? "تم التصدير" : "Export Successful",
      text: isRTL
        ? "تم تصدير الفاتورة بصيغة PDF احترافية"
        : "Professional PDF invoice exported successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: isRTL ? "فشل التصدير" : "Export Failed",
      text: isRTL ? "فشل في تصدير ملف PDF" : "Failed to export PDF",
      confirmButtonText: isRTL ? "حسناً" : "OK",
    });
  }
};

export const handleExportPDF = (data, formatAmount, convertAmount, isRTL) => {
  try {
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(isRTL ? "شركة النظام المتكامل" : "ERP System Company", 20, 30);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
      20,
      40,
    );
    doc.text(
      isRTL ? "هاتف: +966 11 555 0000" : "Phone: +966 11 555 0000",
      20,
      48,
    );
    doc.text(
      isRTL ? "البريد: info@erpsystem.sa" : "Email: info@erpsystem.sa",
      20,
      56,
    );

    // Report Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(isRTL ? "تقرير الفواتير" : "INVOICES REPORT", 20, 75);

    // Date and Stats
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${isRTL ? "تاريخ الإنشاء:" : "Generated:"} ${new Date().toLocaleDateString()}`,
      20,
      85,
    );
    doc.text(
      `${isRTL ? "إجمالي الفواتير:" : "Total Invoices:"} ${data.length}`,
      20,
      93,
    );
    doc.text(
      `${isRTL ? "المبلغ الإجمالي:" : "Total Amount:"} ${formatAmount(
        data.reduce(
          (sum, inv) =>
            sum +
            convertAmount(
              inv.amount,
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            ),
          0,
        ),
      )}`,
      20,
      101,
    );

    // Prepare table data with more details
    const tableColumns = [
      isRTL ? "رقم الفاتورة" : "Invoice #",
      isRTL ? "العميل" : "Customer",
      isRTL ? "المبلغ" : "Amount",
      isRTL ? "الحالة" : "Status",
      isRTL ? "التاريخ" : "Date",
      isRTL ? "الاستحقاق" : "Due Date",
      isRTL ? "طريقة الدفع" : "Payment",
    ];

    const tableRows = data.map((invoice) => [
      invoice.elementNumber,
      isRTL ? invoice.customerAr : invoice.customer,
      formatAmount(
        convertAmount(
          invoice.amount,
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
        ),
      ),
      getStatusLabel(invoice.status, isRTL),
      new Date(invoice.date).toLocaleDateString(),
      new Date(invoice.dueDate).toLocaleDateString(),
      isRTL ? invoice.paymentMethodAr : invoice.paymentMethod,
    ]);

    // Add table with professional styling
    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 110,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [128, 128, 128],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: 22, halign: "center" },
        6: { cellWidth: 25 },
      },
      margin: { top: 10, left: 20, right: 20 },
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${isRTL ? "صفحة" : "Page"} ${i} ${isRTL ? "من" : "of"} ${pageCount}`,
        doc.internal.pageSize.width / 2,
        pageHeight - 10,
        { align: "center" },
      );
      doc.text(
        isRTL
          ? "تم إنشاؤه بواسطة نظام إدارة الموارد"
          : "Generated by ERP Management System",
        doc.internal.pageSize.width / 2,
        pageHeight - 5,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(`invoices-report-${new Date().toISOString().split("T")[0]}.pdf`);

    Swal.fire({
      icon: "success",
      title: isRTL ? "تم التصدير" : "Export Successful",
      text: isRTL
        ? "تم تصدير تقرير PDF مفصل بنجاح"
        : "Detailed PDF report exported successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: isRTL ? "فشل التصدير" : "Export Failed",
      text: isRTL ? "فشل في تصدير ملف PDF" : "Failed to export PDF",
      confirmButtonText: isRTL ? "حسناً" : "OK",
    });
  }
};

export const handleExportExcel = (data, isRTL) => {
  try {
    const exportData = data.map((invoice) => ({
      "Invoice Number": invoice.elementNumber,
      Customer: invoice.customer,
      "Customer AR": invoice.customerAr,
      Amount: invoice.amount,
      Status: invoice.status,
      Date: invoice.date,
      "Due Date": invoice.dueDate,
      Items: invoice.items,
      Category: invoice.category,
      "Category AR": invoice.categoryAr,
      "Payment Method": invoice.paymentMethod,
      "Payment Method AR": invoice.paymentMethodAr,
      "Sales Person": invoice.salesPerson,
      "Sales Person AR": invoice.salesPersonAr,
      Email: invoice.email || "",
      Phone: invoice.phone || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    // Save the file
    XLSX.writeFile(
      workbook,
      `invoices-${new Date().toISOString().split("T")[0]}.xlsx`,
    );

    Swal.fire({
      icon: "success",
      title: isRTL ? "تم التصدير" : "Export Successful",
      text: isRTL ? "تم تصدير ملف Excel بنجاح" : "Excel exported successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: isRTL ? "فشل التصدير" : "Export Failed",
      text: isRTL ? "فشل في تصدير ملف Excel" : "Failed to export Excel",
      confirmButtonText: isRTL ? "حسناً" : "OK",
    });
  }
};

const handleExport = async (filteredAndSortedQuotations, isRTL) => {
  //  setExporting(true);
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const csvHeaders =
      "Quote Number,Customer,Contact Person,Project,Amount,Currency,Status,Valid Until,Issue Date,Created By,Probability,Notes\n";
    const csvContent = filteredAndSortedQuotations
      .map(
        (quote) =>
          `"${quote.quoteNumber}","${quote.customer}","${quote.contactPerson}","${quote.projectName || ""}",${quote.quotationAmount},${quote.currency},"${getStatusLabel(quote.status, isRTL)}","${format(quote.validUntil, "yyyy-MM-dd")}","${format(quote.issueDate, "yyyy-MM-dd")}","${quote.createdBy}","${quote.probability || 0}%","${quote.notes || ""}"`,
      )
      .join("\n");

    const csv = csvHeaders + csvContent;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quotations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log("Export completed");
  } catch (error) {
    console.error("Error exporting data:", error);
  } finally {
    //    setExporting(false);
  }
};

/*     <div><strong>Valid Until:</strong> ${format(quote.validUntil, "MMM dd, yyyy")}</div> */
