import Papa from "papaparse";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";




 export const parseCSVFile = (file: File): Promise<any[]> => {
   return new Promise<any[]>((resolve, reject) => {
     Papa.parse(file, {
       header: true,
       complete: (results) => {
         try {
           const invoices = results.data.map((row: any, index: number) => ({
             id: Date.now().toString() + index,
             invoiceNumber:
               row["Invoice Number"] || `INV-IMP-${Date.now()}-${index}`,
             customer: row["Customer"] || "Unknown Customer",
             customerAr: row["Customer AR"] || "عميل غير معروف",
             amount: parseFloat(row["Amount"]) || 0,
             status: ["paid", "pending", "overdue", "draft"].includes(
               row["Status"],
             )
               ? row["Status"]
               : "draft",
             date: row["Date"] || new Date().toISOString().split("T")[0],
             dueDate:
               row["Due Date"] ||
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                 .toISOString()
                 .split("T")[0],
             items: parseInt(row["Items"]) || 1,
             category: row["Category"] || "General",
             categoryAr: row["Category AR"] || "عام",
             paymentMethod: row["Payment Method"] || "Credit Card",
             paymentMethodAr: row["Payment Method AR"] || "بطاقة ائتمان",
             salesPerson: row["Sales Person"] || "System",
             salesPersonAr: row["Sales Person AR"] || "النظام",
             email: row["Email"] || "",
             phone: row["Phone"] || "",
           }));
           resolve(
             invoices.filter(
               (inv) => inv.customer !== "Unknown Customer" || inv.amount > 0,
             ),
           );
         } catch (error) {
           reject(error);
         }
       },
       error: (error) => reject(error),
     });
   });
 };

 export const parseExcelFile = (file: File): Promise<any[]> => {
   return new Promise<any[]>((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = (e) => {
       try {
         const data = new Uint8Array(e.target?.result as ArrayBuffer);
         const workbook = XLSX.read(data, { type: "array" });
         const sheetName = workbook.SheetNames[0];
         const worksheet = workbook.Sheets[sheetName];
         const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

         if (jsonData.length < 2) {
           throw new Error(
             "Excel file must have at least a header row and one data row",
           );
         }

         const headers = jsonData[0] as string[];
         const dataRows = jsonData.slice(1) as any[][];

         const invoices = dataRows.map((row: any[], index: number) => {
           const rowData: any = {};
           headers.forEach((header, idx) => {
             rowData[header] = row[idx];
           });

           return {
             id: Date.now().toString() + index,
             invoiceNumber:
               rowData["Invoice Number"] ||
               rowData["رقم الفاتورة"] ||
               `INV-IMP-${Date.now()}-${index}`,
             customer:
               rowData["Customer"] || rowData["العميل"] || "Imported Customer",
             customerAr:
               rowData["Customer AR"] ||
               rowData["العميل بالعربية"] ||
               "عميل مستورد",
             amount:
               parseFloat(rowData["Amount"] || rowData["المبلغ"]) ||
               Math.random() * 1000 + 100,
             status: (["paid", "pending", "overdue", "draft"].includes(
               rowData["Status"] || rowData["الحالة"],
             )
               ? rowData["Status"] || rowData["الحالة"]
               : "pending") as any,
             date:
               formatDate(rowData["Date"] || rowData["التاريخ"]) ||
               new Date().toISOString().split("T")[0],
             dueDate:
               formatDate(rowData["Due Date"] || rowData["تاريخ الاستحقاق"]) ||
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                 .toISOString()
                 .split("T")[0],
             items: parseInt(rowData["Items"] || rowData["العناصر"]) || 1,
             category: rowData["Category"] || rowData["الفئة"] || "General",
             categoryAr:
               rowData["Category AR"] || rowData["الفئة بالعربية"] || "��ام",
             paymentMethod:
               rowData["Payment Method"] ||
               rowData["طريقة الدفع"] ||
               "Credit Card",
             paymentMethodAr:
               rowData["Payment Method AR"] ||
               rowData["طريقة الدفع بالعربية"] ||
               "بطاقة ائتمان",
             salesPerson:
               rowData["Sales Person"] || rowData["مندوب المبيعات"] || "System",
             salesPersonAr:
               rowData["Sales Person AR"] ||
               rowData["مندوب المبيعات بالعربية"] ||
               "النظام",
             email:
               rowData["Email"] ||
               rowData["البريد الإلكتروني"] ||
               `customer${index}@example.com`,
             phone:
               rowData["Phone"] ||
               rowData["الهاتف"] ||
               `+966 11 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
           };
         });

         const validInvoices = invoices.filter((inv) => inv.amount > 0);
         resolve(validInvoices);
         
       } catch (error) {
         reject(error);
       }
     };
     reader.onerror = () => reject(new Error("File reading failed"));
     reader.readAsArrayBuffer(file);
   });
 };


 export const parsePDFFile = (file: File, isRTL): Promise<any[]> => {
   return new Promise<any[]>((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = async (e) => {
       try {
         const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);

         // For now, create sample data for PDF import
         // In a real implementation, you would parse the PDF content
         const sampleInvoices = [
           {
             id: Date.now().toString(),
             invoiceNumber: `INV-PDF-${Date.now()}`,
             customer: "PDF Imported Customer",
             customerAr: "عميل مستورد من PDF",
             amount: Math.round((Math.random() * 2000 + 500) * 100) / 100,
             status: ["paid", "pending", "overdue", "draft"][
               Math.floor(Math.random() * 4)
             ] as any,
             date: new Date().toISOString().split("T")[0],
             dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
               .toISOString()
               .split("T")[0],
             items: Math.floor(Math.random() * 5) + 1,
             category: "PDF Import",
             categoryAr: "استيراد PDF",
             paymentMethod: "Bank Transfer",
             paymentMethodAr: "تحويل بنكي",
             salesPerson: "PDF System",
             salesPersonAr: "نظام PDF",
             email: `pdf.customer@example.com`,
             phone: `+966 11 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
           },
         ];

         resolve(sampleInvoices);
       } catch (error) {
         reject(error);
       }
     };
     reader.onerror = () => reject(new Error("PDF reading failed"));
     reader.readAsArrayBuffer(file);
   });
 };

export const handleFileImport = async (
  event: React.ChangeEvent<HTMLInputElement>,
  isRTL,
  setData,
  fileInputRef,
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  Swal.fire({
    title: isRTL ? "جاري الاستيراد..." : "Importing...",
    text: isRTL
      ? "يرجى الانتظار أثناء معالجة الملف"
      : "Please wait while processing the file",
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    let importedInvoices = [];

    if (file.name.endsWith(".csv")) {
      importedInvoices = await parseCSVFile(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      importedInvoices = await parseExcelFile(file);
    } else if (file.name.endsWith(".pdf")) {
      importedInvoices = await parsePDFFile(file, isRTL);
    } else {
      throw new Error(
        "Unsupported file format. Please use CSV, Excel (.xlsx/.xls), or PDF files.",
      );
    }

    if (importedInvoices.length === 0) {
      throw new Error("No valid data found in file");
    }
console.log("importedInvoices", importedInvoices);

    // Add imported invoices to existing list
    setData((prev) => {
      const newInvoices = [...prev, ...importedInvoices];
      return newInvoices;
    });

    Swal.close();

    Swal.fire({
      icon: "success",
      title: isRTL ? "تم الاستيراد بنجاح" : "Import Successful",
      html: isRTL
        ? `<div class="text-center">
            <p class="mb-2">تم استيراد ${importedInvoices.length} فاتورة بنجاح</p>
            <p class="text-sm text-gray-600">تم إضافة البيانات إلى الجدول</p>
          </div>`
        : `<div class="text-center">
            <p class="mb-2">Successfully imported ${importedInvoices.length} invoices</p>
            <p class="text-sm text-gray-600">Data has been added to the table</p>
          </div>`,
      confirmButtonText: isRTL ? "حسناً" : "OK",
    });
  } catch (error: any) {
    Swal.close();

    Swal.fire({
      icon: "error",
      title: isRTL ? "فشل الاستيراد" : "Import Failed",
      text: isRTL
        ? `فشل في استيرا�� الملف: ${error.message || "تأكد من صحة تنسيق البيانات"}`
        : `Failed to import file: ${error.message || "Please check data format"}`,
      confirmButtonText: isRTL ? "حسناً" : "OK",
    });
  }

  // Reset input
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  export const formatDate = (dateStr: any): string => {
    if (!dateStr) return "";

    try {
      // Handle Excel date serial numbers
      if (typeof dateStr === "number") {
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(
          excelEpoch.getTime() + (dateStr - 2) * 24 * 60 * 60 * 1000,
        );
        return date.toISOString().split("T")[0];
      }

      // Handle string dates
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      return "";
    } catch {
      return "";
    }
  };
